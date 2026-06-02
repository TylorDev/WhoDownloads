import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type AppPage = 'home' | 'playlist' | 'youtube' | 'downloads' | 'settings'

interface NavigationContextValue {
  activePage: AppPage
  pendingPlaylistUrl: string
  setActivePage: (page: AppPage) => void
  openPlaylistUrl: (url: string) => void
  clearPendingPlaylistUrl: () => void
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

export function NavigationProvider({ children }: { children: ReactNode }): JSX.Element {
  const [activePage, setActivePage] = useState<AppPage>('home')
  const [pendingPlaylistUrl, setPendingPlaylistUrl] = useState('')

  function openPlaylistUrl(url: string): void {
    setPendingPlaylistUrl(url)
    setActivePage('playlist')
  }

  function clearPendingPlaylistUrl(): void {
    setPendingPlaylistUrl('')
  }

  const value = useMemo(
    () => ({
      activePage,
      pendingPlaylistUrl,
      setActivePage,
      openPlaylistUrl,
      clearPendingPlaylistUrl
    }),
    [activePage, pendingPlaylistUrl]
  )

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

export function useNavigation(): NavigationContextValue {
  const value = useContext(NavigationContext)

  if (!value) {
    throw new Error('useNavigation must be used inside NavigationProvider')
  }

  return value
}
