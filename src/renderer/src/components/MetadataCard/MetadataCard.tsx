import type { VideoMetadataPreview } from '../../../shared/downloadTypes'
import { formatDuration } from '../../utils/formatDuration'
import './MetadataCard.scss'

interface MetadataCardProps {
  metadata: VideoMetadataPreview
}

function MetadataCard({ metadata }: MetadataCardProps): JSX.Element {
  return (
    <div className="metadata-card">
      {metadata.thumbnailUrl && (
        <img className="metadata-card__image" src={metadata.thumbnailUrl} alt="" />
      )}
      <div className="metadata-card__body">
        <div>
          <p className="metadata-card__eyebrow">Preview de metadata</p>
          <h2 className="metadata-card__title">{metadata.title}</h2>
        </div>
        <dl className="metadata-card__details">
          <div>
            <dt className="metadata-card__term">Artist</dt>
            <dd className="metadata-card__description">{metadata.artist}</dd>
          </div>
          <div>
            <dt className="metadata-card__term">Año</dt>
            <dd className="metadata-card__description">{metadata.year || 'No disponible'}</dd>
          </div>
          <div>
            <dt className="metadata-card__term">Duración</dt>
            <dd className="metadata-card__description">
              {formatDuration(metadata.duration) || 'No disponible'}
            </dd>
          </div>
          <div>
            <dt className="metadata-card__term">URL del autor</dt>
            <dd className="metadata-card__description break-anywhere">{metadata.authorUrl}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

export default MetadataCard
