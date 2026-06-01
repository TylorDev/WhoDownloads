import { useEffect, useRef, useState } from 'react'
import { normalizeYouTubeVideoUrl } from '../../../shared/youtubeUrl'
import type {
  WebviewIpcMessageEvent,
  WebviewNavigationEvent,
  YouTubeWebviewElement
} from '../types/ipc'

export interface UseYouTubeBrowserReturn {
  isYouTubeOpen: boolean
  youtubeWebviewPreloadPath: string
  clickedVideos: string[]
  youtubeWebviewRef: React.RefObject<YouTubeWebviewElement | null>
  handleYouTubeBrowserToggle: () => Promise<void>
}

export function useYouTubeBrowser(): UseYouTubeBrowserReturn {
  const [isYouTubeOpen, setIsYouTubeOpen] = useState(false)
  const [youtubeWebviewPreloadPath, setYouTubeWebviewPreloadPath] = useState('')
  const [clickedVideos, setClickedVideos] = useState<string[]>([])
  const youtubeWebviewRef = useRef<YouTubeWebviewElement | null>(null)

  useEffect(() => {
    return window.whoDownloads.onYouTubeVideoClicked(({ url: videoUrl }) => {
      addClickedVideo(videoUrl)
    })
  }, [])

  useEffect(() => {
    if (!isYouTubeOpen || !youtubeWebviewRef.current) {
      return
    }

    const webview = youtubeWebviewRef.current

    const handleIpcMessage = (event: Event): void => {
      const { channel, args } = event as WebviewIpcMessageEvent

      if (channel !== 'youtube-video-context-menu') {
        return
      }

      const payload = args[0]

      if (
        payload &&
        typeof payload === 'object' &&
        'url' in payload &&
        typeof payload.url === 'string'
      ) {
        addClickedVideo(payload.url)
      }
    }

    const handleNavigation = (event: Event): void => {
      const navigationUrl = (event as WebviewNavigationEvent).url ?? webview.getURL?.() ?? ''
      addClickedVideo(navigationUrl)
    }

    webview.addEventListener('ipc-message', handleIpcMessage)
    webview.addEventListener('did-navigate', handleNavigation)
    webview.addEventListener('did-navigate-in-page', handleNavigation)

    return () => {
      webview.removeEventListener('ipc-message', handleIpcMessage)
      webview.removeEventListener('did-navigate', handleNavigation)
      webview.removeEventListener('did-navigate-in-page', handleNavigation)
    }
  }, [isYouTubeOpen])

  function addClickedVideo(rawUrl: string): void {
    const videoUrl = normalizeYouTubeVideoUrl(rawUrl)

    if (!videoUrl) {
      return
    }

    setClickedVideos((currentVideos) =>
      currentVideos.includes(videoUrl) ? currentVideos : [...currentVideos, videoUrl]
    )
  }

  async function handleYouTubeBrowserToggle(): Promise<void> {
    if (isYouTubeOpen) {
      setIsYouTubeOpen(false)
      return
    }

    if (!youtubeWebviewPreloadPath) {
      const preloadPath = await window.whoDownloads.getYouTubeWebviewPreloadPath()
      setYouTubeWebviewPreloadPath(preloadPath)
    }

    setIsYouTubeOpen(true)
  }

  return {
    isYouTubeOpen,
    youtubeWebviewPreloadPath,
    clickedVideos,
    youtubeWebviewRef,
    handleYouTubeBrowserToggle
  }
}
