import { Check, CircleX, Download, Image, Layers2, LoaderCircle, RotateCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLanguage, type TranslationKey } from '../../contexts/LanguageContext'
import type { DownloadStep, DownloadTaskStatus } from '../../types/ipc'
import './DownloadProgressFeedback.scss'

type FeedbackStatus = 'idle' | DownloadTaskStatus

export type DownloadProgressFeedbackValue = {
  status: FeedbackStatus
  step?: DownloadStep
  stepHistory?: DownloadStep[]
  percent?: number
  speed?: string
  eta?: string
  message?: string
  error?: string
}

type TimelineStep = {
  id: DownloadStep
  labelKey: TranslationKey
  Icon: typeof LoaderCircle
}

type DownloadProgressFeedbackProps = {
  progress: DownloadProgressFeedbackValue
  compact?: boolean
}

const STEP_LABEL_KEYS: Record<DownloadStep, TranslationKey> = {
  preparing: 'status.stepPreparingDownload',
  'downloading-file': 'status.stepDownloadingFile',
  'downloading-cover': 'status.stepDownloadingCover',
  converting: 'status.stepConverting',
  merging: 'status.stepMerging',
  completed: 'status.stepCompleted',
  failed: 'status.stepFailed'
}

const DEFAULT_TIMELINE_STEPS: TimelineStep[] = [
  { id: 'preparing', labelKey: 'status.timelinePreparing', Icon: LoaderCircle },
  { id: 'downloading-file', labelKey: 'status.timelineFile', Icon: Download },
  { id: 'converting', labelKey: 'status.timelineConvert', Icon: RotateCw },
  { id: 'completed', labelKey: 'status.timelineComplete', Icon: Check }
]

function getFallbackStep(progress: DownloadProgressFeedbackValue): DownloadStep | undefined {
  if (progress.step) {
    return progress.step
  }

  if (progress.status === 'idle' || progress.status === 'queued') {
    return undefined
  }

  if (progress.status === 'starting') {
    return 'preparing'
  }

  if (progress.status === 'downloading') {
    return 'downloading-file'
  }

  if (progress.status === 'processing') {
    return 'converting'
  }

  return progress.status
}

function getStatusLabel(status: FeedbackStatus): TranslationKey {
  if (status === 'idle') {
    return 'status.idle'
  }

  if (status === 'queued') {
    return 'status.queued'
  }

  if (status === 'starting') {
    return 'status.starting'
  }

  if (status === 'downloading') {
    return 'status.downloading'
  }

  if (status === 'processing') {
    return 'status.processing'
  }

  if (status === 'completed') {
    return 'status.completed'
  }

  return 'status.failed'
}

function getProgressWidth(
  progress: DownloadProgressFeedbackValue,
  progressPercent: number,
  isApproximateProgress: boolean
): string {
  if (progress.status === 'completed') {
    return '100%'
  }

  if (progress.status === 'downloading') {
    return `${progressPercent}%`
  }

  if (isApproximateProgress) {
    return '18%'
  }

  return '0%'
}

function addStep(steps: Set<DownloadStep>, step: DownloadStep | undefined): Set<DownloadStep> {
  if (!step) {
    return steps
  }

  return new Set(steps).add(step)
}

function DownloadProgressFeedback({
  progress,
  compact = false
}: DownloadProgressFeedbackProps): JSX.Element {
  const { t } = useLanguage()
  const [seenOptionalSteps, setSeenOptionalSteps] = useState<Set<DownloadStep>>(() => new Set())
  const progressPercent = Math.max(0, Math.min(100, progress.percent ?? 0))
  const hasRealProgress = typeof progress.percent === 'number'
  const isError = progress.status === 'failed'
  const isSuccess = progress.status === 'completed'
  const currentStep = getFallbackStep(progress)
  const isDownloadingWithoutPercent = progress.status === 'downloading' && !hasRealProgress
  const isApproximateProgress = progress.status === 'starting' || progress.status === 'processing'
  const progressLabel = hasRealProgress ? `${Math.round(progressPercent)}%` : null
  const progressMeta = [
    progressLabel,
    progress.speed,
    progress.eta ? t('status.eta', { eta: progress.eta }) : null
  ].filter(Boolean)
  const message = progress.error || progress.message

  useEffect(() => {
    if (progress.status === 'starting' || progress.status === 'idle' || progress.status === 'queued') {
      setSeenOptionalSteps(new Set(progress.stepHistory ?? []))
      return
    }

    if (currentStep === 'downloading-cover' || currentStep === 'merging') {
      setSeenOptionalSteps((previousSteps) => addStep(previousSteps, currentStep))
    }
  }, [currentStep, progress.status, progress.stepHistory])

  const timelineSteps = useMemo(() => {
    const steps = [...DEFAULT_TIMELINE_STEPS]
    const history = new Set([...(progress.stepHistory ?? []), ...seenOptionalSteps])

    if (history.has('downloading-cover') || currentStep === 'downloading-cover') {
      steps.splice(2, 0, { id: 'downloading-cover', labelKey: 'status.timelineCover', Icon: Image })
    }

    if (history.has('merging') || currentStep === 'merging') {
      const completedIndex = steps.findIndex((step) => step.id === 'completed')
      steps.splice(completedIndex, 0, { id: 'merging', labelKey: 'status.timelineMerge', Icon: Layers2 })
    }

    if (currentStep === 'failed') {
      const completedIndex = steps.findIndex((step) => step.id === 'completed')
      steps.splice(completedIndex, 1, { id: 'failed', labelKey: 'status.timelineError', Icon: CircleX })
    }

    return steps
  }, [currentStep, progress.stepHistory, seenOptionalSteps])

  const statusLabel = t(getStatusLabel(progress.status))
  const stepLabel =
    progress.status === 'queued'
      ? t('status.queuedStep')
      : currentStep
        ? t(STEP_LABEL_KEYS[currentStep])
        : t('status.readyStep')
  const activeStepIndex = currentStep
    ? timelineSteps.findIndex((step) => step.id === currentStep)
    : -1
  const progressWidth = getProgressWidth(progress, progressPercent, isApproximateProgress)

  return (
    <div className={['download-progress-feedback', compact ? 'download-progress-feedback--compact' : ''].join(' ')}>
      <div className="download-progress-feedback__header">
        <div className="download-progress-feedback__title">
          <span
            className={[
              'status-label',
              isError ? 'status-label--error' : '',
              isSuccess ? 'status-label--success' : ''
            ].join(' ')}
          >
            {statusLabel}
          </span>
          <span className="download-progress-feedback__step">{stepLabel}</span>
          {isDownloadingWithoutPercent && (
            <span className="download-progress-feedback__hint">{t('status.calculatingProgress')}</span>
          )}
          {isApproximateProgress && (
            <span className="download-progress-feedback__hint">{t('status.approximateProgress')}</span>
          )}
        </div>
        {progressMeta.length > 0 && (
          <span className="download-progress-feedback__meta">{progressMeta.join(' - ')}</span>
        )}
      </div>

      <ol className="status-steps" aria-label={t('status.progressAriaLabel')}>
        {timelineSteps.map((step, index) => {
          const Icon = step.Icon
          const isActive = step.id === currentStep
          const isDone =
            isSuccess || (activeStepIndex >= 0 && index < activeStepIndex && !isError)

          return (
            <li
              className={[
                'status-steps__item',
                isActive ? 'status-steps__item--active' : '',
                isDone ? 'status-steps__item--done' : '',
                isError && isActive ? 'status-steps__item--error' : ''
              ].join(' ')}
              key={step.id}
            >
              <span className="status-steps__icon">
                <Icon size={15} strokeWidth={2.15} aria-hidden="true" />
              </span>
              <span className="status-steps__label">{t(step.labelKey)}</span>
            </li>
          )
        })}
      </ol>

      <div
        className={[
          'progress-bar',
          isDownloadingWithoutPercent ? 'progress-bar--indeterminate' : '',
          isApproximateProgress ? 'progress-bar--approximate' : ''
        ].join(' ')}
      >
        <div
          className={[
            'progress-bar__fill',
            isError ? 'progress-bar__fill--error' : '',
            isSuccess ? 'progress-bar__fill--success' : '',
            isDownloadingWithoutPercent ? 'progress-bar__fill--indeterminate' : ''
          ].join(' ')}
          style={{ width: isDownloadingWithoutPercent ? undefined : progressWidth }}
        />
      </div>

      <p className="download-progress-feedback__message break-anywhere">
        {message || t('status.waitingProgress')}
      </p>
    </div>
  )
}

export default DownloadProgressFeedback
