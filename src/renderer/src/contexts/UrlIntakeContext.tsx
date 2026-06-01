import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { classifyYouTubeUrl, normalizeYouTubeVideoUrl } from '../../../shared/youtubeUrl'
import { useDownloadContext } from './DownloadContext'
import { useNavigation } from './NavigationContext'
import { usePlaylistContext } from './PlaylistContext'

const UrlIntakeContext = createContext(true)
const URL_PATTERN = /https?:\/\/[^\s"'<>]+/i
const EDITABLE_SELECTOR = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])'

type PotentialEditableTarget = EventTarget & {
  isContentEditable?: boolean
  nodeName?: string
  closest?: (selector: string) => unknown
}

function extractUrl(value: string): string | null {
  return value.match(URL_PATTERN)?.[0] ?? null
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || typeof target !== 'object') {
    return false
  }

  const editableTarget = target as PotentialEditableTarget
  const nodeName =
    typeof editableTarget.nodeName === 'string' ? editableTarget.nodeName.toLowerCase() : ''

  if (
    nodeName === 'input' ||
    nodeName === 'textarea' ||
    nodeName === 'select' ||
    editableTarget.isContentEditable === true
  ) {
    return true
  }

  return typeof editableTarget.closest === 'function'
    ? Boolean(editableTarget.closest(EDITABLE_SELECTOR))
    : false
}

export function UrlIntakeProvider({ children }: { children: ReactNode }): JSX.Element {
  const { setActivePage } = useNavigation()
  const { setVideoUrl, quickDownloadEnabled, quickDownloadUrl } = useDownloadContext()
  const { loadPlaylistUrl } = usePlaylistContext()

  async function routeIncomingUrl(candidateUrl: string): Promise<void> {
    const urlKind = classifyYouTubeUrl(candidateUrl)

    if (urlKind === 'video') {
      const videoUrl = normalizeYouTubeVideoUrl(candidateUrl) ?? candidateUrl
      setActivePage('home')

      if (quickDownloadEnabled) {
        await quickDownloadUrl(videoUrl)
      } else {
        setVideoUrl(videoUrl)
      }

      return
    }

    if (urlKind === 'playlist') {
      setActivePage('playlist')
      await loadPlaylistUrl(candidateUrl)
    }
  }

  function getSupportedUrl(value: string): string | null {
    const candidateUrl = extractUrl(value)

    if (!candidateUrl) {
      return null
    }

    return classifyYouTubeUrl(candidateUrl) ? candidateUrl : null
  }

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent): void => {
      if (isEditableTarget(event.target)) {
        return
      }

      const text = event.clipboardData?.getData('text') ?? ''
      const supportedUrl = getSupportedUrl(text)

      if (!supportedUrl) {
        return
      }

      event.preventDefault()
      void routeIncomingUrl(supportedUrl)
    }

    const handleDragOver = (event: DragEvent): void => {
      if (isEditableTarget(event.target)) {
        return
      }

      event.preventDefault()
    }

    const handleDrop = (event: DragEvent): void => {
      if (isEditableTarget(event.target)) {
        return
      }

      const text = event.dataTransfer?.getData('text/uri-list') ||
        event.dataTransfer?.getData('text/plain') ||
        ''

      const supportedUrl = getSupportedUrl(text)

      event.preventDefault()

      if (supportedUrl) {
        void routeIncomingUrl(supportedUrl)
      }
    }

    document.addEventListener('paste', handlePaste, true)
    document.addEventListener('dragover', handleDragOver, true)
    document.addEventListener('drop', handleDrop, true)

    return () => {
      document.removeEventListener('paste', handlePaste, true)
      document.removeEventListener('dragover', handleDragOver, true)
      document.removeEventListener('drop', handleDrop, true)
    }
  }, [quickDownloadEnabled, setActivePage, setVideoUrl, quickDownloadUrl, loadPlaylistUrl])

  return <UrlIntakeContext.Provider value>{children}</UrlIntakeContext.Provider>
}

export function useUrlIntake(): boolean {
  return useContext(UrlIntakeContext)
}
