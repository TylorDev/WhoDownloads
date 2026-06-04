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
import { useLanguage } from './LanguageContext'
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
  const { t } = useLanguage()
  const { settings, updateFormat, updateQuality } = useSettings()
  const { setActivePage } = useNavigation()
  const [url, setUrl] = useState('')
  const [quickDownloadEnabled, setQuickDownloadEnabled] = useState(false)
  const [metadata, setMetadata] = useState<VideoMetadataPreview | null>(null)
  const [metadataUrl, setMetadataUrl] = useState('')
  const [downloadTasks, setDownloadTasks] = useState<DownloadTask[]>([])
  const [progress, setProgress] = useState<DownloadProgress>({
    status: 'idle',
    message: t('status.readyMessage')
  })
  const [isDownloading, setIsDownloading] = useState(false)
  const [isBatchDownloading, setIsBatchDownloading] = useState(false)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const isDownloadingRef = useRef(false)
  const isBatchDownloadingRef = useRef(false)
  const isPreviewLoadingRef = useRef(false)
  const previewRequestIdRef = useRef(0)

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
    isPreviewLoadingRef.current = isPreviewLoading
  }, [isPreviewLoading])

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
      isPreviewLoadingRef.current ||
      metadataUrl === cleanUrl ||
      !looksLikeYouTubeUrl(cleanUrl)
    ) {
      return
    }

    let isCanceled = false
    const requestId = previewRequestIdRef.current + 1
    previewRequestIdRef.current = requestId
    const previewTimer = window.setTimeout(() => {
      async function loadPreview(): Promise<void> {
        setIsPreviewLoading(true)
        isPreviewLoadingRef.current = true
        setProgress({ status: 'starting', step: 'preparing', message: t('status.loadingPreviewMessage') })
        console.log(`[renderer:preview] start ${cleanUrl}`)

        const preview = await window.whoDownloads.previewVideo(cleanUrl).catch((error: unknown) => ({
          ok: false as const,
          error: error instanceof Error ? error.message : t('status.previewFailedMessage')
        }))
        console.log(`[renderer:preview] result ${JSON.stringify({ ok: preview.ok })}`)

        if (isCanceled || previewRequestIdRef.current !== requestId) {
          return
        }

        setIsPreviewLoading(false)
        isPreviewLoadingRef.current = false

        if (!preview.ok) {
          setProgress({ status: 'failed', message: preview.error })
          return
        }

        setMetadata(preview.metadata)
        setMetadataUrl(cleanUrl)
        setProgress({ status: 'idle', message: t('status.previewReadyMessage') })
      }

      void loadPreview()
    }, 500)

    return () => {
      isCanceled = true
      if (previewRequestIdRef.current === requestId) {
        previewRequestIdRef.current += 1
      }
      setIsPreviewLoading(false)
      isPreviewLoadingRef.current = false
      window.clearTimeout(previewTimer)
    }
  }, [cleanUrl, quickDownloadEnabled, isDownloading, metadataUrl, t])

  function setVideoUrl(value: string): void {
    setUrl(value)

    if (metadata) {
      setMetadata(null)
      setMetadataUrl('')
      setProgress({ status: 'idle', message: t('status.urlChangedMessage') })
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

  function formatCompletedDownloadMessage(filePath?: string): string {
    return filePath
      ? t('status.downloadedAt', { path: filePath })
      : t('status.downloadCompletedMessage')
  }

  async function startDownload(input: DownloadInput): Promise<boolean> {
    if (isBatchDownloadingRef.current) {
      setProgress({
        status: 'failed',
        message: t('status.batchActiveMessage')
      })
      return false
    }

    if (isDownloadingRef.current) {
      setProgress({ status: 'failed', message: t('status.downloadActiveMessage') })
      return false
    }

    const taskInput = input.taskId ? input : { ...input, taskId: createDownloadTaskId() }
    const taskMetadata = metadataUrl === taskInput.url ? metadata ?? undefined : undefined
    setDownloadTasks((currentTasks) => [
      createDownloadTask(taskInput, taskMetadata, t('status.queuedMessage')),
      ...currentTasks.filter((task) => task.id !== taskInput.taskId)
    ])

    isDownloadingRef.current = true
    setIsDownloading(true)
    setProgress({ status: 'starting', step: 'preparing', message: t('status.preparingDownloadMessage') })
    console.log(
      `[renderer:download] start ${JSON.stringify({
        url: taskInput.url,
        format: taskInput.format,
        quality: taskInput.quality,
        taskId: taskInput.taskId
      })}`
    )

    const result = await window.whoDownloads.downloadVideo(taskInput)
    console.log(
      `[renderer:download] result ${JSON.stringify({
        ok: result.ok,
        taskId: taskInput.taskId
      })}`
    )
    setDownloadTasks((currentTasks) =>
      applyTaskResult(currentTasks, taskInput.taskId, result, formatCompletedDownloadMessage)
    )

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
      step: 'completed',
      percent: 100,
      filePath: result.filePath,
      message: formatCompletedDownloadMessage(result.filePath)
    })
    return true
  }

  async function quickDownloadUrl(videoUrl: string): Promise<void> {
    const cleanVideoUrl = videoUrl.trim()
    setVideoUrl(cleanVideoUrl)

    if (!settings.quickDownloadConfigured) {
      setProgress({
        status: 'failed',
        message: t('status.quickNeedsConfigMessage')
      })
      return
    }

    if (!cleanVideoUrl) {
      setProgress({ status: 'failed', message: t('status.missingYouTubeUrlMessage') })
      return
    }

    if (!looksLikeYouTubeUrl(cleanVideoUrl)) {
      setProgress({ status: 'failed', message: t('status.invalidYouTubeUrlMessage') })
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
        message: t('status.downloadActiveMessage')
      })
      return false
    }

    if (!settings.quickDownloadConfigured) {
      setProgress({
        status: 'failed',
        message: t('status.batchNeedsConfigMessage')
      })
      return false
    }

    const uniqueUrls = dedupeUrls(urls)

    if (uniqueUrls.length === 0) {
      setProgress({ status: 'failed', message: t('status.noVideosMessage') })
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
        createDownloadTask(taskInput, taskMetadataByUrl.get(taskInput.url), t('status.queuedMessage'))
      ),
      ...currentTasks
    ])

    let completed = 0
    let failed = 0
    const sourceLabel = source === 'playlist' ? t('status.batchSourcePlaylist') : t('status.batchSourceYouTube')

    setActivePage('downloads')
    isBatchDownloadingRef.current = true
    isDownloadingRef.current = true
    setIsBatchDownloading(true)
    setIsDownloading(true)
    setProgress({
      status: 'starting',
      step: 'preparing',
      message: t('status.batchStarting', {
        count: uniqueUrls.length,
        source: sourceLabel,
        batchSize: MAX_PARALLEL_BATCH_DOWNLOADS
      })
    })

    try {
      await runWithConcurrency(
        taskInputs,
        MAX_PARALLEL_BATCH_DOWNLOADS,
        async (input) => {
          const result = await window.whoDownloads.downloadVideo(input)
          console.log(
            `[renderer:download] batch-result ${JSON.stringify({
              ok: result.ok,
              taskId: input.taskId
            })}`
          )
          setDownloadTasks((currentTasks) =>
            applyTaskResult(currentTasks, input.taskId, result, formatCompletedDownloadMessage)
          )

          if (result.ok) {
            completed += 1
          } else {
            failed += 1
          }

          setProgress({
            status: failed > 0 ? 'processing' : 'downloading',
            step: 'downloading-file',
            percent: Math.round(((completed + failed) / taskInputs.length) * 100),
            message: t('status.batchProgress', {
              completed,
              failed,
              pending: taskInputs.length - completed - failed
            })
          })
        }
      )

      setProgress({
        status: failed > 0 ? 'failed' : 'completed',
        step: failed > 0 ? 'failed' : 'completed',
        percent: 100,
        message:
          failed > 0
            ? t('status.batchFinishedWithFailures', { completed, failed })
            : t('status.batchCompleted', { completed })
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
      setProgress({ status: 'failed', message: t('status.missingYouTubeUrlMessage') })
      return
    }

    if (!looksLikeYouTubeUrl(cleanUrl)) {
      setProgress({ status: 'failed', message: t('status.invalidYouTubeUrlMessage') })
      return
    }

    if (!hasCurrentPreview) {
      const requestId = previewRequestIdRef.current + 1
      previewRequestIdRef.current = requestId
      setIsPreviewLoading(true)
      isPreviewLoadingRef.current = true
      setProgress({ status: 'starting', step: 'preparing', message: t('status.loadingPreviewMessage') })
      console.log(`[renderer:preview] submit-start ${cleanUrl}`)

      const preview = await window.whoDownloads.previewVideo(cleanUrl).catch((error: unknown) => ({
        ok: false as const,
        error: error instanceof Error ? error.message : t('status.previewFailedMessage')
      }))
      console.log(`[renderer:preview] submit-result ${JSON.stringify({ ok: preview.ok })}`)

      if (previewRequestIdRef.current !== requestId) {
        return
      }

      setIsPreviewLoading(false)
      isPreviewLoadingRef.current = false

      if (!preview.ok) {
        setProgress({ status: 'failed', message: preview.error })
        return
      }

      setMetadata(preview.metadata)
      setMetadataUrl(cleanUrl)
      setProgress({ status: 'idle', message: t('status.previewReadyMessage') })
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
      t,
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
