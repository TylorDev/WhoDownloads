import type {
  DownloadFormat,
  DownloadInput,
  DownloadQuality,
  DownloadProgress as MainDownloadProgress,
  DownloadResult,
  DownloadTask,
  DownloadTaskStatus,
  MetadataResult,
  Mp3Quality,
  Mp4Quality,
  OpenDirectoryResult,
  AppSettings,
  PlaylistEntry,
  PlaylistResult,
  SelectDirectoryResult,
  SettingsResult,
  YouTubeVideoClickedEvent
} from '../../../shared/downloadTypes'

export type DownloadProgress = MainDownloadProgress | { status: 'idle'; message?: string }

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
      windowControls: {
        minimize: () => Promise<void>
        toggleMaximize: () => Promise<boolean>
        close: () => Promise<void>
        isMaximized: () => Promise<boolean>
      }
      getYouTubeWebviewPreloadPath: () => Promise<string>
      previewVideo: (url: string) => Promise<MetadataResult>
      downloadVideo: (input: DownloadInput) => Promise<DownloadResult>
      openYouTubeBrowser: () => Promise<void>
      closeYouTubeBrowser: () => Promise<void>
      fetchPlaylist: (url: string) => Promise<PlaylistResult>
      getSettings: () => Promise<SettingsResult>
      saveSettings: (settings: AppSettings) => Promise<SettingsResult>
      selectDownloadDirectory: () => Promise<SelectDirectoryResult>
      showItemInFolder: (filePath: string) => Promise<void>
      openDownloadDirectory: (directory: string) => Promise<OpenDirectoryResult>
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
  DownloadQuality,
  DownloadResult,
  DownloadTask,
  DownloadTaskStatus,
  MetadataResult,
  Mp3Quality,
  Mp4Quality,
  OpenDirectoryResult,
  AppSettings,
  PlaylistEntry,
  PlaylistResult,
  SelectDirectoryResult,
  SettingsResult,
  YouTubeVideoClickedEvent
}
