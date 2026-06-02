import { FormEvent, useEffect, useMemo, useState } from 'react'
import { looksLikeYouTubeUrl } from '../../../shared/youtubeUrl'
import type {
  DownloadFormat,
  DownloadInput,
  DownloadProgress,
  DownloadQuality,
  Mp3Quality,
  Mp4Quality
} from '../types/ipc'
import type { VideoMetadataPreview } from '../../../shared/downloadTypes'

export interface UseDownloadReturn {
  url: string
  format: DownloadFormat
  quality: DownloadQuality
  metadata: VideoMetadataPreview | null
  progress: DownloadProgress
  isDownloading: boolean
  isPreviewLoading: boolean
  hasCurrentPreview: boolean
  canSubmit: boolean
  setFormat: (format: DownloadFormat) => void
  setQuality: (quality: DownloadQuality) => void
  handleUrlChange: (value: string) => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
}

export function useDownload(): UseDownloadReturn {
  const [url, setUrl] = useState('')
  const [format, setFormat] = useState<DownloadFormat>('mp4')
  const [quality, setQuality] = useState<DownloadQuality>('auto')
  const [metadata, setMetadata] = useState<VideoMetadataPreview | null>(null)
  const [metadataUrl, setMetadataUrl] = useState('')
  const [progress, setProgress] = useState<DownloadProgress>({
    status: 'idle',
    message: 'Listo para descargar.'
  })
  const [isDownloading, setIsDownloading] = useState(false)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  const cleanUrl = url.trim()
  const hasCurrentPreview = Boolean(metadata && metadataUrl === cleanUrl)
  const canSubmit = useMemo(
    () => cleanUrl.length > 0 && !isDownloading && !isPreviewLoading,
    [cleanUrl, isDownloading, isPreviewLoading]
  )

  useEffect(() => {
    return window.whoDownloads.onDownloadProgress((nextProgress) => {
      setProgress(nextProgress)

      if (nextProgress.status === 'completed' || nextProgress.status === 'failed') {
        setIsDownloading(false)
      }
    })
  }, [])

  function handleUrlChange(value: string): void {
    setUrl(value)

    if (metadata) {
      setMetadata(null)
      setMetadataUrl('')
      setProgress({ status: 'idle', message: 'La URL cambió. Carga la preview otra vez.' })
    }
  }

  function handleFormatChange(nextFormat: DownloadFormat): void {
    setFormat(nextFormat)
    setQuality('auto')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    if (!cleanUrl) {
      setProgress({ status: 'failed', message: 'Pega una URL de YouTube primero.' })
      return
    }

    if (!looksLikeYouTubeUrl(cleanUrl)) {
      setProgress({ status: 'failed', message: 'La URL debe ser de youtube.com o youtu.be.' })
      return
    }

    if (!hasCurrentPreview) {
      setIsPreviewLoading(true)
      setProgress({ status: 'starting', message: 'Cargando preview de metadata...' })

      const preview = await window.whoDownloads.previewVideo(cleanUrl)

      setIsPreviewLoading(false)

      if (!preview.ok) {
        setProgress({ status: 'failed', message: preview.error })
        return
      }

      setMetadata(preview.metadata)
      setMetadataUrl(cleanUrl)
      setProgress({ status: 'idle', message: 'Preview lista. Revisa los datos y descarga.' })
      return
    }

    setIsDownloading(true)
    setProgress({ status: 'starting', message: 'Preparando descarga...' })

    const input: DownloadInput =
      format === 'mp3'
        ? { url: cleanUrl, format, quality: quality as Mp3Quality }
        : { url: cleanUrl, format, quality: quality as Mp4Quality }

    const result = await window.whoDownloads.downloadVideo(input)

    if (!result.ok) {
      setIsDownloading(false)
      setProgress({ status: 'failed', message: result.error })
      return
    }

    setIsDownloading(false)
    setProgress({
      status: 'completed',
      percent: 100,
      filePath: result.filePath,
      message: result.filePath ? `Descargado en ${result.filePath}` : 'Descarga completada.'
    })
  }

  return {
    url,
    format,
    quality,
    metadata,
    progress,
    isDownloading,
    isPreviewLoading,
    hasCurrentPreview,
    canSubmit,
    setFormat: handleFormatChange,
    setQuality,
    handleUrlChange,
    handleSubmit
  }
}
