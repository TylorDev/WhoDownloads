import type { VideoMetadataPreview } from '../../../shared/downloadTypes'
import { useLanguage } from '../../contexts/LanguageContext'
import { formatDuration } from '../../utils/formatDuration'
import './MetadataCard.scss'

interface MetadataCardProps {
  metadata: VideoMetadataPreview
}

function MetadataCard({ metadata }: MetadataCardProps): JSX.Element {
  const { t } = useLanguage()

  return (
    <div className="metadata-card">
      {metadata.thumbnailUrl && (
        <img className="metadata-card__image" src={metadata.thumbnailUrl} alt="" />
      )}
      <div className="metadata-card__body">
        <div>
          <p className="metadata-card__eyebrow">{t('metadata.eyebrow')}</p>
          <h2 className="metadata-card__title">{metadata.title}</h2>
        </div>
        <dl className="metadata-card__details">
          <div>
            <dt className="metadata-card__term">{t('metadata.artist')}</dt>
            <dd className="metadata-card__description">{metadata.artist}</dd>
          </div>
          <div>
            <dt className="metadata-card__term">{t('metadata.year')}</dt>
            <dd className="metadata-card__description">{metadata.year || t('metadata.unavailable')}</dd>
          </div>
          <div>
            <dt className="metadata-card__term">{t('metadata.duration')}</dt>
            <dd className="metadata-card__description">
              {formatDuration(metadata.duration) || t('metadata.unavailable')}
            </dd>
          </div>
          <div>
            <dt className="metadata-card__term">{t('metadata.authorUrl')}</dt>
            <dd className="metadata-card__description break-anywhere">{metadata.authorUrl}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

export default MetadataCard
