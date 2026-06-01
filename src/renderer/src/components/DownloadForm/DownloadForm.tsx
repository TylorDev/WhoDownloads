import type { FormEvent } from 'react'
import type { DownloadFormat, DownloadQuality } from '../../types/ipc'
import './DownloadForm.scss'

interface DownloadFormProps {
  url: string
  format: DownloadFormat
  quality: DownloadQuality
  isDownloading: boolean
  isPreviewLoading: boolean
  hasCurrentPreview: boolean
  canSubmit: boolean
  isYouTubeOpen: boolean
  onUrlChange: (value: string) => void
  onFormatChange: (format: DownloadFormat) => void
  onQualityChange: (quality: DownloadQuality) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  onYouTubeToggle: () => Promise<void>
}

function DownloadForm({
  url,
  format,
  quality,
  isDownloading,
  isPreviewLoading,
  hasCurrentPreview,
  canSubmit,
  isYouTubeOpen,
  onUrlChange,
  onFormatChange,
  onQualityChange,
  onSubmit,
  onYouTubeToggle
}: DownloadFormProps): JSX.Element {
  const isDisabled = isDownloading || isPreviewLoading

  return (
    <form className="download-form" onSubmit={onSubmit}>
      <div className="browser-actions">
        <button className="secondary-button" type="button" onClick={onYouTubeToggle}>
          {isYouTubeOpen ? 'Cerrar YouTube' : 'Abrir YouTube'}
        </button>
      </div>

      <label className="field" htmlFor="youtube-url">
        <span className="field__label">URL de YouTube</span>
        <input
          id="youtube-url"
          className="form-control form-control--input"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(event) => onUrlChange(event.target.value)}
          disabled={isDisabled}
        />
      </label>

      <div className="control-grid">
        <label className="field" htmlFor="format">
          <span className="field__label">Formato</span>
          <select
            id="format"
            className="form-control form-control--select"
            value={format}
            onChange={(event) => onFormatChange(event.target.value as DownloadFormat)}
            disabled={isDisabled}
          >
            <option value="mp4">MP4 compatible</option>
            <option value="mp3">MP3 audio</option>
          </select>
        </label>

        <label className="field" htmlFor="quality">
          <span className="field__label">Calidad</span>
          <select
            id="quality"
            className="form-control form-control--select"
            value={quality}
            onChange={(event) => onQualityChange(event.target.value as DownloadQuality)}
            disabled={isDisabled}
          >
            {format === 'mp4' ? (
              <>
                <option value="auto">Auto</option>
                <option value="1080">1080p</option>
                <option value="720">720p</option>
                <option value="480">480p</option>
              </>
            ) : (
              <>
                <option value="auto">Auto</option>
                <option value="320">320 kbps</option>
                <option value="192">192 kbps</option>
                <option value="128">128 kbps</option>
              </>
            )}
          </select>
        </label>
      </div>

      <button className="primary-button" type="submit" disabled={!canSubmit}>
        {isPreviewLoading
          ? 'Cargando preview...'
          : isDownloading
            ? 'Descargando...'
            : hasCurrentPreview
              ? `Descargar ${format.toUpperCase()}`
              : 'Ver preview'}
      </button>
    </form>
  )
}

export default DownloadForm
