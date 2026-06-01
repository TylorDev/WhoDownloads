import type { DownloadProgress } from '../../types/ipc'
import './StatusPanel.scss'

interface StatusPanelProps {
  progress: DownloadProgress
}

function StatusPanel({ progress }: StatusPanelProps): JSX.Element {
  const progressPercent = Math.max(0, Math.min(100, progress.percent ?? 0))
  const isError = progress.status === 'failed'
  const isSuccess = progress.status === 'completed'

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
        : progress.status === 'starting' || progress.status === 'processing'
          ? '18%'
          : '0%'

  return (
    <div className="status-panel">
      <div className="status-panel__header">
        <span
          className={[
            'status-label',
            isError ? 'status-label--error' : '',
            isSuccess ? 'status-label--success' : ''
          ].join(' ')}
        >
          {statusLabel}
        </span>
        {progress.status === 'downloading' && (
          <span className="status-panel__meta">
            {progress.speed ? `${progress.speed}` : ''}
            {progress.eta ? ` · ETA ${progress.eta}` : ''}
          </span>
        )}
      </div>

      <div className="progress-bar">
        <div
          className={[
            'progress-bar__fill',
            isError ? 'progress-bar__fill--error' : '',
            isSuccess ? 'progress-bar__fill--success' : ''
          ].join(' ')}
          style={{ width: progressWidth }}
        />
      </div>

      <p className="status-panel__message break-anywhere">{progress.message}</p>
      <p className="status-panel__version">Version {window.whoDownloads.version}</p>
    </div>
  )
}

export default StatusPanel
