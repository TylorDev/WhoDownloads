export type DownloadStatus = 'starting' | 'downloading' | 'processing' | 'completed' | 'failed'

export type DownloadProgress = {
  taskId?: string
  status: DownloadStatus
  percent?: number
  speed?: string
  eta?: string
  message?: string
}

export type DownloadResult =
  | { ok: true; filePath?: string }
  | { ok: false; error: string }

export type MetadataResult =
  | { ok: true; metadata: VideoMetadataPreview }
  | { ok: false; error: string }

export type VideoMetadataPreview = {
  title: string
  artist: string
  year: string
  authorUrl: string
  thumbnailUrl?: string
  duration?: number
  url: string
}

export type DownloadFormat = 'mp4' | 'mp3'
export type Mp4Quality = 'auto' | '1080' | '720' | '480'
export type Mp3Quality = 'auto' | '320' | '192' | '128'
export type DownloadQuality = Mp4Quality | Mp3Quality

export type DownloadInput =
  | { url: string; format: 'mp4'; quality: Mp4Quality; taskId?: string }
  | { url: string; format: 'mp3'; quality: Mp3Quality; taskId?: string }

export type DownloadTaskStatus = 'queued' | DownloadStatus

export type DownloadTask = {
  id: string
  url: string
  format: DownloadFormat
  quality: DownloadQuality
  status: DownloadTaskStatus
  percent?: number
  speed?: string
  eta?: string
  message?: string
  metadata?: VideoMetadataPreview
  filePath?: string
  error?: string
}

export type YouTubeVideoClickedEvent = {
  url: string
}

export type PlaylistEntry = {
  id: string
  title: string
  url: string
  duration?: number
}

export type PlaylistResult =
  | { ok: true; title: string; entries: PlaylistEntry[] }
  | { ok: false; error: string }

export type AppSettings = {
  downloadDirectory: string
  defaultFormat: DownloadFormat
  defaultQuality: DownloadQuality
  quickDownloadConfigured: boolean
}

export type SettingsResult =
  | { ok: true; settings: AppSettings }
  | { ok: false; error: string }

export type SelectDirectoryResult =
  | { ok: true; directory: string }
  | { ok: false; canceled: true }
  | { ok: false; error: string }
