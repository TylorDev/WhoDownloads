import { FolderOpen } from 'lucide-react'
import type { DownloadProgress } from '../../types/ipc'
import './StatusPanel.scss'

interface StatusPanelProps {
  progress: DownloadProgress
}

function StatusPanel({ progress }: StatusPanelProps): JSX.Element {
  const progressPercent = Math.max(0, Math.min(100, progress.percent ?? 0))
  const hasRealProgress = typeof progress.percent === 'number'
  const isError = progress.status === 'failed'
  const isSuccess = progress.status === 'completed'
  const isDownloadingWithoutPercent = progress.status === 'downloading' && !hasRealProgress
  const isApproximateProgress = progress.status === 'starting' || progress.status === 'processing'
  const completedFilePath = 'filePath' in progress ? progress.filePath : undefined
  const progressLabel = hasRealProgress ? `${Math.round(progressPercent)}%` : null
  const progressMeta = [
    progressLabel,
    progress.speed,
    progress.eta ? `ETA ${progress.eta}` : null
  ].filter(Boolean)

  const statusLabel =
    progress.status === 'idle'
      ? 'En espera'
      : progress.status === 'starting'
        ? 'Preparando'
        : progress.status === 'downloading'
          ? 'Descargando'
          : progress.status === 'processing'
            ? 'Procesando'
            : progress.status === 'completed'
              ? 'Completado'
              : 'Error'

  const progressWidth =
    progress.status === 'completed'
      ? '100%'
      : progress.status === 'downloading'
        ? `${progressPercent}%`
        : isApproximateProgress
          ? '18%'
          : '0%'

  return (
    <div className="status-panel">
      <div className="status-panel__header">
        <div className="status-panel__title">
          <span
            className={[
              'status-label',
              isError ? 'status-label--error' : '',
              isSuccess ? 'status-label--success' : ''
            ].join(' ')}
          >
            {statusLabel}
          </span>
          {isDownloadingWithoutPercent && (
            <span className="status-panel__hint">Calculando progreso...</span>
          )}
          {isApproximateProgress && (
            <span className="status-panel__hint">Progreso aproximado</span>
          )}
        </div>
        {progressMeta.length > 0 && (
          <span className="status-panel__meta">{progressMeta.join(' · ')}</span>
        )}
      </div>

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

      <p className="status-panel__message break-anywhere">{progress.message}</p>
      {progress.status === 'completed' && completedFilePath && (
        <button
          className="status-panel__folder-button"
          type="button"
          onClick={() => void window.whoDownloads.showItemInFolder(completedFilePath)}
        >
          <FolderOpen size={16} strokeWidth={2.1} aria-hidden="true" />
          <span>Mostrar en carpeta</span>
        </button>
      )}
      <p className="status-panel__version">Version {window.whoDownloads.version}</p>
    </div>
  )
}

export default StatusPanel
