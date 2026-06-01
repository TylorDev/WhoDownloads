import type {
  DownloadFormat,
  DownloadInput,
  DownloadProgress as MainDownloadProgress,
  DownloadResult,
  MetadataResult,
  Mp3Quality,
  Mp4Quality,
  PlaylistEntry,
  PlaylistResult,
  YouTubeVideoClickedEvent
} from '../../../shared/downloadTypes'

export type DownloadProgress = MainDownloadProgress | { status: 'idle'; message?: string }

export type DownloadQuality = Mp4Quality | Mp3Quality

export type WebviewIpcMessageEvent = Event & {
  channel: string
  args: unknown[]
}

export type WebviewNavigationEvent = Event & {
  url?: string
}

export type YouTubeWebviewElement = HTMLElement & {
  getURL?: () => string
}

declare global {
  interface Window {
    whoDownloads: {
      version: string
      getYouTubeWebviewPreloadPath: () => Promise<string>
      previewVideo: (url: string) => Promise<MetadataResult>
      downloadVideo: (input: DownloadInput) => Promise<DownloadResult>
      openYouTubeBrowser: () => Promise<void>
      closeYouTubeBrowser: () => Promise<void>
      fetchPlaylist: (url: string) => Promise<PlaylistResult>
      onYouTubeVideoClicked: (callback: (event: YouTubeVideoClickedEvent) => void) => () => void
      onDownloadProgress: (callback: (progress: Omit<DownloadProgress, 'status'> & {
        status: Exclude<DownloadProgress['status'], 'idle'>
      }) => void) => () => void
    }
  }
}

export type {
  DownloadFormat,
  DownloadInput,
  DownloadResult,
  MetadataResult,
  Mp3Quality,
  Mp4Quality,
  PlaylistEntry,
  PlaylistResult,
  YouTubeVideoClickedEvent
}
