import { Trash2, Zap } from 'lucide-react'
import { formatDuration } from '../../utils/formatDuration'
import type { QueueVideo } from './types'

interface VideoProps {
  video: QueueVideo
  isDisabled: boolean
  onQuickDownloadVideo: (url: string) => void
  onRemoveVideo: (id: string) => void
}

function Video({
  video,
  isDisabled,
  onQuickDownloadVideo,
  onRemoveVideo
}: VideoProps): JSX.Element {
  return (
    <li className="cola-video">
      <div className="cola-video__info">
        <span className="cola-video__title">{video.title || video.url}</span>
        {video.duration != null && (
          <span className="cola-video__duration">{formatDuration(video.duration)}</span>
        )}
        <span className="cola-video__url break-anywhere">{video.url}</span>
      </div>
      <div className="cola-video__actions">
        <button
          className="cola-video__action"
          type="button"
          disabled={isDisabled}
          aria-label="Descargar rapido"
          data-tooltip="Descarga rapida"
          onClick={() => onQuickDownloadVideo(video.url)}
        >
          <Zap aria-hidden="true" size={16} strokeWidth={2.2} />
        </button>
        <button
          className="cola-video__action cola-video__action--danger"
          type="button"
          disabled={isDisabled}
          aria-label="Quitar video"
          data-tooltip="Quitar"
          onClick={() => onRemoveVideo(video.id)}
        >
          <Trash2 aria-hidden="true" size={16} strokeWidth={2.2} />
        </button>
      </div>
    </li>
  )
}

export default Video
