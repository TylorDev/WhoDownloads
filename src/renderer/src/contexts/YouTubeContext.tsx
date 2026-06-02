import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
  type ReactNode
} from 'react'
import { normalizeYouTubeVideoUrl } from '../../../shared/youtubeUrl'
import type {
  WebviewIpcMessageEvent,
  WebviewNavigationEvent,
  YouTubeWebviewElement
} from '../types/ipc'
import { useDownloadContext } from './DownloadContext'

interface YouTubeContextValue {
  youtubeWebviewPreloadPath: string
  clickedVideos: string[]
  lastValidClickNotice: YouTubeClickNotice | null
  youtubeWebviewRef: RefObject<YouTubeWebviewElement | null>
  ensureYouTubePreloadPath: () => Promise<void>
  removeClickedVideo: (url: string) => void
}

type YouTubeClickNotice = {
  id: number
  url: string
  isDuplicate: boolean
}

const YouTubeContext = createContext<YouTubeContextValue | null>(null)

export function YouTubeProvider({ children }: { children: ReactNode }): JSX.Element {
  const { isBatchDownloading } = useDownloadContext()
  const [youtubeWebviewPreloadPath, setYouTubeWebviewPreloadPath] = useState('')
  const [clickedVideos, setClickedVideos] = useState<string[]>([])
  const [lastValidClickNotice, setLastValidClickNotice] = useState<YouTubeClickNotice | null>(null)
  const youtubeWebviewRef = useRef<YouTubeWebviewElement | null>(null)
  const isBatchDownloadingRef = useRef(isBatchDownloading)
  const clickedVideosRef = useRef(clickedVideos)
  const validClickNoticeIdRef = useRef(0)

  useEffect(() => {
    isBatchDownloadingRef.current = isBatchDownloading
  }, [isBatchDownloading])

  useEffect(() => {
    clickedVideosRef.current = clickedVideos
  }, [clickedVideos])

  useEffect(() => {
    return window.whoDownloads.onYouTubeVideoClicked(({ url: videoUrl }) => {
      addClickedVideo(videoUrl)
    })
  }, [])

  useEffect(() => {
    if (!youtubeWebviewRef.current) {
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
  }, [youtubeWebviewPreloadPath])

  function addClickedVideo(rawUrl: string): void {
    if (isBatchDownloadingRef.current) {
      return
    }

    const videoUrl = normalizeYouTubeVideoUrl(rawUrl)

    if (!videoUrl) {
      return
    }

    const currentVideos = clickedVideosRef.current
    const isDuplicate = currentVideos.includes(videoUrl)

    if (!isDuplicate) {
      const nextVideos = [...currentVideos, videoUrl]
      clickedVideosRef.current = nextVideos
      setClickedVideos(nextVideos)
    }

    validClickNoticeIdRef.current += 1
    setLastValidClickNotice({
      id: validClickNoticeIdRef.current,
      url: videoUrl,
      isDuplicate
    })
  }

  async function ensureYouTubePreloadPath(): Promise<void> {
    if (youtubeWebviewPreloadPath) {
      return
    }

    const preloadPath = await window.whoDownloads.getYouTubeWebviewPreloadPath()
    setYouTubeWebviewPreloadPath(preloadPath)
  }

  function removeClickedVideo(url: string): void {
    setClickedVideos((currentVideos) => {
      const nextVideos = currentVideos.filter((videoUrl) => videoUrl !== url)
      clickedVideosRef.current = nextVideos
      return nextVideos
    })
  }

  const value = useMemo(
    () => ({
      youtubeWebviewPreloadPath,
      clickedVideos,
      lastValidClickNotice,
      youtubeWebviewRef,
      ensureYouTubePreloadPath,
      removeClickedVideo
    }),
    [youtubeWebviewPreloadPath, clickedVideos, lastValidClickNotice]
  )

  return <YouTubeContext.Provider value={value}>{children}</YouTubeContext.Provider>
}

export function useYouTubeContext(): YouTubeContextValue {
  const value = useContext(YouTubeContext)

  if (!value) {
    throw new Error('useYouTubeContext must be used inside YouTubeProvider')
  }

  return value
}
