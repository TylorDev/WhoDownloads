import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode
} from 'react'
import { looksLikeYouTubeUrl } from '../../../shared/youtubeUrl'
import type {
  DownloadFormat,
  DownloadInput,
  DownloadProgress,
  DownloadTask,
  DownloadQuality,
  Mp3Quality,
  Mp4Quality
} from '../types/ipc'
import type { VideoMetadataPreview } from '../../../shared/downloadTypes'
import { useSettings } from './SettingsContext'
import { useNavigation } from './NavigationContext'
import {
  dedupeUrls,
  MAX_PARALLEL_BATCH_DOWNLOADS,
  runWithConcurrency
} from '../utils/downloadBatch'
import {
  applyTaskProgress,
  applyTaskResult,
  createDownloadTask,
  createDownloadTaskId
} from '../utils/downloadTasks'
import { isBatchDownloadSuccessful, shouldClearDownloadInput } from '../utils/downloadCompletion'

type BatchDownloadSource = 'playlist' | 'youtube'

interface DownloadContextValue {
  url: string
  format: DownloadFormat
  quality: DownloadQuality
  quickDownloadEnabled: boolean
  metadata: VideoMetadataPreview | null
  downloadTasks: DownloadTask[]
  progress: DownloadProgress
  isDownloading: boolean
  isBatchDownloading: boolean
  isPreviewLoading: boolean
  hasCurrentPreview: boolean
  canSubmit: boolean
  setFormat: (format: DownloadFormat) => void
  setQuality: (quality: DownloadQuality) => void
  setQuickDownloadEnabled: (enabled: boolean) => void
  setVideoUrl: (value: string) => void
  submitDownload: (event: FormEvent<HTMLFormElement>) => Promise<void>
  quickDownloadUrl: (videoUrl: string) => Promise<void>
  downloadUrls: (
    urls: string[],
    source: BatchDownloadSource,
    metadataByUrl?: Record<string, VideoMetadataPreview>
  ) => Promise<boolean>
  showDownloadInFolder: (filePath: string) => Promise<void>
}

const DownloadContext = createContext<DownloadContextValue | null>(null)

function buildInput(
  url: string,
  format: DownloadFormat,
  quality: DownloadQuality
): DownloadInput {
  return format === 'mp3'
    ? { url, format, quality: quality as Mp3Quality }
    : { url, format, quality: quality as Mp4Quality }
}

export function DownloadProvider({ children }: { children: ReactNode }): JSX.Element {
  const { settings, updateFormat, updateQuality } = useSettings()
  const { setActivePage } = useNavigation()
  const [url, setUrl] = useState('')
  const [quickDownloadEnabled, setQuickDownloadEnabled] = useState(false)
  const [metadata, setMetadata] = useState<VideoMetadataPreview | null>(null)
  const [metadataUrl, setMetadataUrl] = useState('')
  const [downloadTasks, setDownloadTasks] = useState<DownloadTask[]>([])
  const [progress, setProgress] = useState<DownloadProgress>({
    status: 'idle',
    message: 'Listo para descargar.'
  })
  const [isDownloading, setIsDownloading] = useState(false)
  const [isBatchDownloading, setIsBatchDownloading] = useState(false)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const isDownloadingRef = useRef(false)
  const isBatchDownloadingRef = useRef(false)

  const cleanUrl = url.trim()
  const format = settings.defaultFormat
  const quality = settings.defaultQuality
  const hasCurrentPreview = Boolean(metadata && metadataUrl === cleanUrl)
  const canSubmit = useMemo(
    () => cleanUrl.length > 0 && !isDownloading && !isPreviewLoading && !isBatchDownloading,
    [cleanUrl, isDownloading, isPreviewLoading, isBatchDownloading]
  )

  useEffect(() => {
    isDownloadingRef.current = isDownloading
  }, [isDownloading])

  useEffect(() => {
    isBatchDownloadingRef.current = isBatchDownloading
  }, [isBatchDownloading])

  useEffect(() => {
    return window.whoDownloads.onDownloadProgress((nextProgress) => {
      setDownloadTasks((currentTasks) => applyTaskProgress(currentTasks, nextProgress))

      if (isBatchDownloadingRef.current) {
        return
      }

      setProgress(nextProgress)

      if (nextProgress.status === 'completed' || nextProgress.status === 'failed') {
        setIsDownloading(false)
      }
    })
  }, [])

  useEffect(() => {
    if (
      !cleanUrl ||
      quickDownloadEnabled ||
      isDownloading ||
      metadataUrl === cleanUrl ||
      !looksLikeYouTubeUrl(cleanUrl)
    ) {
      return
    }

    let isCanceled = false
    const previewTimer = window.setTimeout(() => {
      async function loadPreview(): Promise<void> {
        setIsPreviewLoading(true)
        setProgress({ status: 'starting', message: 'Cargando preview de metadata...' })

        const preview = await window.whoDownloads.previewVideo(cleanUrl)

        if (isCanceled) {
          return
        }

        setIsPreviewLoading(false)

        if (!preview.ok) {
          setProgress({ status: 'failed', message: preview.error })
          return
        }

        setMetadata(preview.metadata)
        setMetadataUrl(cleanUrl)
        setProgress({ status: 'idle', message: 'Preview lista. Revisa los datos y descarga.' })
      }

      void loadPreview()
    }, 500)

    return () => {
      isCanceled = true
      setIsPreviewLoading(false)
      window.clearTimeout(previewTimer)
    }
  }, [cleanUrl, quickDownloadEnabled, isDownloading, metadataUrl])

  function setVideoUrl(value: string): void {
    setUrl(value)

    if (metadata) {
      setMetadata(null)
      setMetadataUrl('')
      setProgress({ status: 'idle', message: 'La URL cambio. Cargando nueva preview...' })
    }
  }

  function handleFormatChange(nextFormat: DownloadFormat): void {
    void updateFormat(nextFormat)
  }

  function handleQualityChange(nextQuality: DownloadQuality): void {
    void updateQuality(nextQuality)
  }

  function clearCurrentDownloadInput(): void {
    setUrl('')
    setMetadata(null)
    setMetadataUrl('')
  }

  async function startDownload(input: DownloadInput): Promise<boolean> {
    if (isBatchDownloadingRef.current) {
      setProgress({
        status: 'failed',
        message: 'Hay una lista descargandose. Espera a que termine.'
      })
      return false
    }

    if (isDownloadingRef.current) {
      setProgress({ status: 'failed', message: 'Ya hay una descarga activa. Espera a que termine.' })
      return false
    }

    const taskInput = input.taskId ? input : { ...input, taskId: createDownloadTaskId() }
    const taskMetadata = metadataUrl === taskInput.url ? metadata ?? undefined : undefined
    setDownloadTasks((currentTasks) => [
      createDownloadTask(taskInput, taskMetadata),
      ...currentTasks.filter((task) => task.id !== taskInput.taskId)
    ])

    isDownloadingRef.current = true
    setIsDownloading(true)
    setProgress({ status: 'starting', message: 'Preparando descarga...' })

    const result = await window.whoDownloads.downloadVideo(taskInput)
    setDownloadTasks((currentTasks) => applyTaskResult(currentTasks, taskInput.taskId, result))

    if (!result.ok) {
      setIsDownloading(false)
      isDownloadingRef.current = false
      setProgress({ status: 'failed', message: result.error })
      return false
    }

    setIsDownloading(false)
    isDownloadingRef.current = false
    if (shouldClearDownloadInput(result)) {
      clearCurrentDownloadInput()
    }
    setProgress({
      status: 'completed',
      percent: 100,
      filePath: result.filePath,
      message: result.filePath ? `Descargado en ${result.filePath}` : 'Descarga completada.'
    })
    return true
  }

  async function quickDownloadUrl(videoUrl: string): Promise<void> {
    const cleanVideoUrl = videoUrl.trim()
    setVideoUrl(cleanVideoUrl)

    if (!settings.quickDownloadConfigured) {
      setProgress({
        status: 'failed',
        message: 'Configura carpeta, formato y calidad en Settings antes de usar descarga rapida.'
      })
      return
    }

    if (!cleanVideoUrl) {
      setProgress({ status: 'failed', message: 'Pega una URL de YouTube primero.' })
      return
    }

    if (!looksLikeYouTubeUrl(cleanVideoUrl)) {
      setProgress({ status: 'failed', message: 'La URL debe ser de youtube.com o youtu.be.' })
      return
    }

    await startDownload(buildInput(cleanVideoUrl, settings.defaultFormat, settings.defaultQuality))
  }

  async function downloadUrls(
    urls: string[],
    source: BatchDownloadSource,
    metadataByUrl: Record<string, VideoMetadataPreview> = {}
  ): Promise<boolean> {
    if (isBatchDownloadingRef.current || isDownloadingRef.current) {
      setProgress({
        status: 'failed',
        message: 'Ya hay una descarga activa. Espera a que termine.'
      })
      return false
    }

    if (!settings.quickDownloadConfigured) {
      setProgress({
        status: 'failed',
        message: 'Configura carpeta, formato y calidad en Settings antes de descargar listas.'
      })
      return false
    }

    const uniqueUrls = dedupeUrls(urls)

    if (uniqueUrls.length === 0) {
      setProgress({ status: 'failed', message: 'No hay videos para descargar.' })
      return false
    }

    const taskInputs = uniqueUrls.map((videoUrl) => ({
      ...buildInput(videoUrl, settings.defaultFormat, settings.defaultQuality),
      taskId: createDownloadTaskId()
    }))
    const taskMetadataByUrl = new Map<string, VideoMetadataPreview>(
      Object.entries(metadataByUrl)
    )

    if (metadata && metadataUrl) {
      taskMetadataByUrl.set(metadataUrl, metadata)
    }

    setDownloadTasks((currentTasks) => [
      ...taskInputs.map((taskInput) =>
        createDownloadTask(taskInput, taskMetadataByUrl.get(taskInput.url))
      ),
      ...currentTasks
    ])

    let completed = 0
    let failed = 0
    const sourceLabel = source === 'playlist' ? 'playlist' : 'videos clickeados'

    setActivePage('downloads')
    isBatchDownloadingRef.current = true
    isDownloadingRef.current = true
    setIsBatchDownloading(true)
    setIsDownloading(true)
    setProgress({
      status: 'starting',
      message: `Descargando ${uniqueUrls.length} videos de ${sourceLabel} en grupos de ${MAX_PARALLEL_BATCH_DOWNLOADS}...`
    })

    try {
      await runWithConcurrency(
        taskInputs,
        MAX_PARALLEL_BATCH_DOWNLOADS,
        async (input) => {
          const result = await window.whoDownloads.downloadVideo(input)
          setDownloadTasks((currentTasks) => applyTaskResult(currentTasks, input.taskId, result))

          if (result.ok) {
            completed += 1
          } else {
            failed += 1
          }

          setProgress({
            status: failed > 0 ? 'processing' : 'downloading',
            percent: Math.round(((completed + failed) / taskInputs.length) * 100),
            message: `Lista: ${completed} completadas, ${failed} fallidas, ${taskInputs.length - completed - failed} pendientes.`
          })
        }
      )

      setProgress({
        status: failed > 0 ? 'failed' : 'completed',
        percent: 100,
        message:
          failed > 0
            ? `Descarga de lista terminada con ${completed} completadas y ${failed} fallidas.`
            : `Descarga de lista completada: ${completed} videos.`
      })
      return isBatchDownloadSuccessful(failed)
    } finally {
      setIsBatchDownloading(false)
      setIsDownloading(false)
      isBatchDownloadingRef.current = false
      isDownloadingRef.current = false
    }
  }

  async function submitDownload(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    if (quickDownloadEnabled) {
      await quickDownloadUrl(cleanUrl)
      return
    }

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

    await startDownload(buildInput(cleanUrl, format, quality))
  }

  async function showDownloadInFolder(filePath: string): Promise<void> {
    await window.whoDownloads.showItemInFolder(filePath)
  }

  const value = useMemo(
    () => ({
      url,
      format,
      quality,
      quickDownloadEnabled,
      metadata,
      downloadTasks,
      progress,
      isDownloading,
      isBatchDownloading,
      isPreviewLoading,
      hasCurrentPreview,
      canSubmit,
      setFormat: handleFormatChange,
      setQuality: handleQualityChange,
      setQuickDownloadEnabled,
      setVideoUrl,
      submitDownload,
      quickDownloadUrl,
      downloadUrls,
      showDownloadInFolder
    }),
    [
      url,
      format,
      quality,
      quickDownloadEnabled,
      metadata,
      downloadTasks,
      progress,
      isDownloading,
      isBatchDownloading,
      isPreviewLoading,
      hasCurrentPreview,
      canSubmit,
      format,
      quality,
      settings,
      updateFormat,
      updateQuality
    ]
  )

  return <DownloadContext.Provider value={value}>{children}</DownloadContext.Provider>
}

export function useDownloadContext(): DownloadContextValue {
  const value = useContext(DownloadContext)

  if (!value) {
    throw new Error('useDownloadContext must be used inside DownloadProvider')
  }

  return value
}
