import { FolderOpen } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import DownloadProgressFeedback from '../DownloadProgressFeedback/DownloadProgressFeedback'
import type { DownloadProgress } from '../../types/ipc'
import './StatusPanel.scss'

interface StatusPanelProps {
  progress: DownloadProgress
}

function StatusPanel({ progress }: StatusPanelProps): JSX.Element {
  const { t } = useLanguage()
  const completedFilePath = 'filePath' in progress ? progress.filePath : undefined

  return (
    <div className="status-panel">
      <DownloadProgressFeedback progress={progress} />
      {progress.status === 'completed' && completedFilePath && (
        <button
          className="status-panel__folder-button"
          type="button"
          onClick={() => void window.whoDownloads.showItemInFolder(completedFilePath)}
        >
          <FolderOpen size={16} strokeWidth={2.1} aria-hidden="true" />
          <span>{t('status.showInFolder')}</span>
        </button>
      )}
      <p className="status-panel__version">
        {t('status.version', { version: window.whoDownloads.version })}
      </p>
    </div>
  )
}

export default StatusPanel
