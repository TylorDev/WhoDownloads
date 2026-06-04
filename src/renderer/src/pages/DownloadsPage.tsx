import DownloadProgressFeedback from '../components/DownloadProgressFeedback/DownloadProgressFeedback'
import { useDownloadContext } from '../contexts/DownloadContext'
import { useLanguage } from '../contexts/LanguageContext'
import { formatDuration } from '../utils/formatDuration'
import { getDownloadTaskTitle } from '../utils/downloadTasks'
import type { DownloadTask, DownloadTaskStatus } from '../types/ipc'

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
  const { t } = useLanguage()
  const { downloadTasks, showDownloadInFolder } = useDownloadContext()
  const sortedTasks = getSortedTasks(downloadTasks)

  return (
    <section className="page-section downloads-page">
      <div className="page-heading">
        <p className="page-heading__eyebrow">{t('downloads.eyebrow')}</p>
        <h1>{t('downloads.title')}</h1>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="downloads-empty">
          <p>{t('downloads.empty')}</p>
        </div>
      ) : (
        <div className="downloads-list">
          {sortedTasks.map((task) => (
            <article className="download-task" key={task.id}>
              <div className="download-task__media">
                {task.metadata?.thumbnailUrl ? (
                  <img src={task.metadata.thumbnailUrl} alt="" />
                ) : (
                  <span>{task.format.toUpperCase()}</span>
                )}
              </div>

              <div className="download-task__content">
                <div className="download-task__header">
                  <div>
                    <h2 className="download-task__title">{getDownloadTaskTitle(task)}</h2>
                  </div>
                  <span className="download-task__format">
                    {task.format.toUpperCase()} - {task.quality}
                  </span>
                </div>

                <p className="download-task__url break-anywhere">{task.url}</p>

                {task.metadata && (
                  <dl className="download-task__metadata">
                    {task.metadata.artist && (
                      <div>
                        <dt>{t('downloads.channel')}</dt>
                        <dd>{task.metadata.artist}</dd>
                      </div>
                    )}
                    {task.metadata.duration != null && (
                      <div>
                        <dt>{t('downloads.duration')}</dt>
                        <dd>{formatDuration(task.metadata.duration)}</dd>
                      </div>
                    )}
                    {task.metadata.year && (
                      <div>
                        <dt>{t('downloads.year')}</dt>
                        <dd>{task.metadata.year}</dd>
                      </div>
                    )}
                  </dl>
                )}

                <DownloadProgressFeedback compact progress={task} />

                {task.filePath && (
                  <div className="download-task__footer">
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => void showDownloadInFolder(task.filePath!)}
                    >
                      {t('downloads.showInFolder')}
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default DownloadsPage
