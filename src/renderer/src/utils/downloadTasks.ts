import type {
  DownloadFormat,
  DownloadInput,
  DownloadProgress,
  DownloadQuality,
  DownloadResult,
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
  metadata?: VideoMetadataPreview
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
    message: 'En cola.'
  }
}

export function getDownloadTaskTitle(task: DownloadTask): string {
  return task.metadata?.title || task.url
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
  result: DownloadResult
): DownloadTask[] {
  return tasks.map((task) => {
    if (task.id !== taskId) {
      return task
    }

    if (result.ok) {
      return {
        ...task,
        status: 'completed',
        percent: 100,
        filePath: result.filePath,
        message: result.filePath ? `Descargado en ${result.filePath}` : 'Descarga completada.'
      }
    }

    return {
      ...task,
      status: 'failed',
      error: result.error,
      message: result.error
    }
  })
}
