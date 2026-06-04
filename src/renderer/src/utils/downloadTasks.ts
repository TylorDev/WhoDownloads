import type {
  DownloadFormat,
  DownloadInput,
  DownloadProgress,
  DownloadQuality,
  DownloadResult,
  DownloadStep,
  DownloadTask,
  VideoMetadataPreview
} from '../../../shared/downloadTypes'

let taskCounter = 0

export function createDownloadTaskId(): string {
  taskCounter += 1
  return `download-${Date.now()}-${taskCounter}`
}

export function createDownloadTask(
  input: DownloadInput,
  metadata?: VideoMetadataPreview,
  queuedMessage = 'Queued.'
): DownloadTask {
  const id = input.taskId ?? createDownloadTaskId()

  return {
    id,
    url: input.url,
    format: input.format as DownloadFormat,
    quality: input.quality as DownloadQuality,
    status: 'queued',
    percent: 0,
    metadata,
    message: queuedMessage
  }
}

export function getDownloadTaskTitle(task: DownloadTask): string {
  return task.metadata?.title || task.url
}

function appendStepHistory(stepHistory: DownloadStep[] | undefined, step: DownloadStep | undefined): DownloadStep[] | undefined {
  if (!step) {
    return stepHistory
  }

  const nextStepHistory = stepHistory ?? []

  return nextStepHistory.includes(step) ? nextStepHistory : [...nextStepHistory, step]
}

export function applyTaskProgress(tasks: DownloadTask[], progress: DownloadProgress): DownloadTask[] {
  if (!progress.taskId) {
    return tasks
  }

  return tasks.map((task) =>
    task.id === progress.taskId
      ? {
          ...task,
          status: progress.status,
          step: progress.step ?? task.step,
          stepHistory: appendStepHistory(task.stepHistory, progress.step),
          percent: progress.percent ?? task.percent,
          speed: progress.speed,
          eta: progress.eta,
          message: progress.message ?? task.message,
          error: progress.status === 'failed' ? progress.message : task.error
        }
      : task
  )
}

export function applyTaskResult(
  tasks: DownloadTask[],
  taskId: string,
  result: DownloadResult,
  formatCompletedMessage = (filePath?: string): string =>
    filePath ? `Downloaded to ${filePath}` : 'Download completed.'
): DownloadTask[] {
  return tasks.map((task) => {
    if (task.id !== taskId) {
      return task
    }

    if (result.ok) {
      return {
        ...task,
        status: 'completed',
        step: 'completed',
        stepHistory: appendStepHistory(task.stepHistory, 'completed'),
        percent: 100,
        filePath: result.filePath,
        message: formatCompletedMessage(result.filePath)
      }
    }

    return {
      ...task,
      status: 'failed',
      step: 'failed',
      stepHistory: appendStepHistory(task.stepHistory, 'failed'),
      error: result.error,
      message: result.error
    }
  })
}
