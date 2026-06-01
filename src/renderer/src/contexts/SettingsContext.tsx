import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AppSettings, DownloadFormat, DownloadQuality } from '../types/ipc'

interface SettingsContextValue {
  settings: AppSettings
  isLoading: boolean
  error: string | null
  updateFormat: (format: DownloadFormat) => Promise<void>
  updateQuality: (quality: DownloadQuality) => Promise<void>
  chooseDirectory: () => Promise<void>
  confirmQuickDownloadSettings: () => Promise<void>
}

const fallbackSettings: AppSettings = {
  downloadDirectory: '',
  defaultFormat: 'mp4',
  defaultQuality: 'auto',
  quickDownloadConfigured: false
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }): JSX.Element {
  const [settings, setSettings] = useState<AppSettings>(fallbackSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function load(): Promise<void> {
      const result = await window.whoDownloads.getSettings()

      if (!isMounted) {
        return
      }

      setIsLoading(false)

      if (!result.ok) {
        setError(result.error)
        return
      }

      setSettings(result.settings)
    }

    void load()

    return () => {
      isMounted = false
    }
  }, [])

  async function persist(nextSettings: AppSettings): Promise<void> {
    setSettings(nextSettings)
    setError(null)

    const result = await window.whoDownloads.saveSettings(nextSettings)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setSettings(result.settings)
  }

  async function updateFormat(format: DownloadFormat): Promise<void> {
    await persist({
      ...settings,
      defaultFormat: format,
      defaultQuality: 'auto',
      quickDownloadConfigured: false
    })
  }

  async function updateQuality(quality: DownloadQuality): Promise<void> {
    await persist({ ...settings, defaultQuality: quality, quickDownloadConfigured: false })
  }

  async function chooseDirectory(): Promise<void> {
    const result = await window.whoDownloads.selectDownloadDirectory()

    if (!result.ok) {
      if ('canceled' in result && result.canceled) {
        return
      }

      setError(result.error)
      return
    }

    await persist({
      ...settings,
      downloadDirectory: result.directory,
      quickDownloadConfigured: false
    })
  }

  async function confirmQuickDownloadSettings(): Promise<void> {
    await persist({ ...settings, quickDownloadConfigured: true })
  }

  const value = useMemo(
    () => ({
      settings,
      isLoading,
      error,
      updateFormat,
      updateQuality,
      chooseDirectory,
      confirmQuickDownloadSettings
    }),
    [settings, isLoading, error]
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext)

  if (!value) {
    throw new Error('useSettings must be used inside SettingsProvider')
  }

  return value
}
