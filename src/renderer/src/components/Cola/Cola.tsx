import Video from './Video'
import type { QueueVideo } from './types'
import './Cola.scss'

interface ColaProps {
  title: string
  emptyMessage: string
  videos: QueueVideo[]
  isDisabled: boolean
  downloadLabel: string
  onDownloadAll: (videos: QueueVideo[]) => void
  onQuickDownloadVideo: (url: string) => void
  onRemoveVideo: (id: string) => void
}

function Cola({
  title,
  emptyMessage,
  videos,
  isDisabled,
  downloadLabel,
  onDownloadAll,
  onQuickDownloadVideo,
  onRemoveVideo
}: ColaProps): JSX.Element {
  const hasVideos = videos.length > 0

  return (
    <div className="cola">
      <div className="cola__header">
        <h2 className="cola__title">{title}</h2>
        <span className="cola__count">{videos.length}</span>
      </div>

      {hasVideos ? (
        <>
          <button
            className="cola__download-button"
            type="button"
            disabled={isDisabled}
            onClick={() => onDownloadAll(videos)}
          >
            {isDisabled ? 'Descargando...' : downloadLabel}
          </button>
          <ol className="cola__list">
            {videos.map((video) => (
              <Video
                key={video.id}
                video={video}
                isDisabled={isDisabled}
                onQuickDownloadVideo={onQuickDownloadVideo}
                onRemoveVideo={onRemoveVideo}
              />
            ))}
          </ol>
        </>
      ) : (
        <p className="cola__empty">{emptyMessage}</p>
      )}
    </div>
  )
}

export default Cola
