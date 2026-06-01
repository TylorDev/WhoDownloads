import type { DownloadTask, DownloadTaskStatus } from '../types/ipc'
import { useDownloadContext } from '../contexts/DownloadContext'
import { formatDuration } from '../utils/formatDuration'

const statusLabels: Record<DownloadTaskStatus, string> = {
  queued: 'En cola',
  starting: 'Preparando',
  downloading: 'Descargando',
  processing: 'Procesando',
  completed: 'Completado',
  failed: 'Error'
}

function getTaskTitle(task: DownloadTask): string {
  return task.metadata?.title || task.url
}

function getSortedTasks(tasks: DownloadTask[]): DownloadTask[] {
  const activeStatuses: DownloadTaskStatus[] = ['queued', 'starting', 'downloading', 'processing']

  return [...tasks].sort((firstTask, secondTask) => {
    const firstIsActive = activeStatuses.includes(firstTask.status)
    const secondIsActive = activeStatuses.includes(secondTask.status)

    if (firstIsActive === secondIsActive) {
      return 0
    }

    return firstIsActive ? -1 : 1
  })
}

function DownloadsPage(): JSX.Element {
  const { downloadTasks, showDownloadInFolder } = useDownloadContext()
  const sortedTasks = getSortedTasks(downloadTasks)

  return (
    <section className="page-section downloads-page">
      <div className="page-heading">
        <p className="page-heading__eyebrow">Downloads</p>
        <h1>Detalles de descarga</h1>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="downloads-empty">
          <p>No hay descargas en esta sesion.</p>
        </div>
      ) : (
        <div className="downloads-list">
          {sortedTasks.map((task) => {
            const percent = Math.max(0, Math.min(100, task.percent ?? 0))
            const isFailed = task.status === 'failed'
            const isCompleted = task.status === 'completed'

            return (
              <article className="download-task" key={task.id}>
                <div className="download-task__header">
                  <div>
                    <span
                      className={[
                        'download-task__status',
                        isFailed ? 'download-task__status--failed' : '',
                        isCompleted ? 'download-task__status--completed' : ''
                      ].join(' ')}
                    >
                      {statusLabels[task.status]}
                    </span>
                    <h2 className="download-task__title">{getTaskTitle(task)}</h2>
                  </div>
                  <span className="download-task__format">
                    {task.format.toUpperCase()} · {task.quality}
                  </span>
                </div>

                <p className="download-task__url break-anywhere">{task.url}</p>

                {task.metadata && (
                  <dl className="download-task__metadata">
                    {task.metadata.artist && (
                      <div>
                        <dt>Canal</dt>
                        <dd>{task.metadata.artist}</dd>
                      </div>
                    )}
                    {task.metadata.duration != null && (
                      <div>
                        <dt>Duracion</dt>
                        <dd>{formatDuration(task.metadata.duration)}</dd>
                      </div>
                    )}
                    {task.metadata.year && (
                      <div>
                        <dt>Anio</dt>
                        <dd>{task.metadata.year}</dd>
                      </div>
                    )}
                  </dl>
                )}

                <div className="download-task__bar" aria-hidden="true">
                  <div className="download-task__bar-fill" style={{ width: `${percent}%` }} />
                </div>

                <div className="download-task__footer">
                  <p className="download-task__message break-anywhere">
                    {task.error || task.message || 'Esperando progreso...'}
                    {task.speed ? ` · ${task.speed}` : ''}
                    {task.eta ? ` · ETA ${task.eta}` : ''}
                  </p>
                  {task.filePath && (
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => void showDownloadInFolder(task.filePath!)}
                    >
                      Mostrar en carpeta
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default DownloadsPage
