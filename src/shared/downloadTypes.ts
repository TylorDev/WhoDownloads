export type DownloadStatus = 'starting' | 'downloading' | 'processing' | 'completed' | 'failed'

export type DownloadProgress = {
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

export type DownloadInput =
  | { url: string; format: 'mp4'; quality: Mp4Quality }
  | { url: string; format: 'mp3'; quality: Mp3Quality }

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

