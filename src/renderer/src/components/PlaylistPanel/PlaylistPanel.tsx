import type { FormEvent } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import Cola from '../Cola/Cola'
import type { QueueVideo } from '../Cola/types'
import type { PendingLongPlaylist } from '../../utils/playlistLimit'
import './PlaylistPanel.scss'

interface PlaylistPanelProps {
  playlistUrl: string
  playlistTitle: string
  videos: QueueVideo[]
  pendingLongPlaylist: PendingLongPlaylist | null
  isLoading: boolean
  error: string | null
  onPlaylistUrlChange: (value: string) => void
  onFetchPlaylist: (event: FormEvent<HTMLFormElement>) => Promise<void>
  onQuickDownloadVideo: (videoUrl: string) => void
  onDownloadPlaylist: (videos: QueueVideo[]) => void
  onRemoveVideo: (videoId: string) => void
  onLoadLongPlaylistAll: () => void
  onLoadLongPlaylistFirst100: () => void
  isBatchDownloading: boolean
}

function PlaylistPanel({
  playlistUrl,
  playlistTitle,
  videos,
  pendingLongPlaylist,
  isLoading,
  error,
  onPlaylistUrlChange,
  onFetchPlaylist,
  onQuickDownloadVideo,
  onDownloadPlaylist,
  onRemoveVideo,
  onLoadLongPlaylistAll,
  onLoadLongPlaylistFirst100,
  isBatchDownloading
}: PlaylistPanelProps): JSX.Element {
  const { t } = useLanguage()
  const hasVideos = videos.length > 0
  const videoCountKey = videos.length === 1 ? 'playlist.videoCountOne' : 'playlist.videoCountMany'

  return (
    <div className="playlist-panel">
      <div className="playlist-panel__header">
        <h2 className="playlist-panel__title">{t('playlist.panelTitle')}</h2>
      </div>

      <form className="playlist-panel__form" onSubmit={onFetchPlaylist}>
        <label className="field" htmlFor="playlist-url">
          <span className="field__label">{t('playlist.urlLabel')}</span>
          <input
            id="playlist-url"
            className="form-control form-control--input"
            placeholder={t('playlist.urlPlaceholder')}
            value={playlistUrl}
            onChange={(event) => onPlaylistUrlChange(event.target.value)}
            disabled={isLoading}
          />
        </label>
        <button
          className="primary-button"
          type="submit"
          disabled={isLoading || isBatchDownloading || !playlistUrl.trim()}
        >
          {isLoading ? t('playlist.fetchLoading') : t('playlist.fetch')}
        </button>
      </form>

      {error && (
        <p className="playlist-panel__error">{error}</p>
      )}

      {pendingLongPlaylist && (
        <div className="playlist-panel__warning" role="alert">
          <p className="playlist-panel__warning-title">{t('playlist.longWarningTitle')}</p>
          <p className="playlist-panel__warning-copy">
            {t('playlist.longWarningCopy', { count: pendingLongPlaylist.entries.length })}
          </p>
          <div className="playlist-panel__warning-actions">
            <button
              className="secondary-button"
              type="button"
              disabled={isBatchDownloading}
              onClick={onLoadLongPlaylistAll}
            >
              {t('playlist.loadAnyway')}
            </button>
            <button
              className="primary-button"
              type="button"
              disabled={isBatchDownloading}
              onClick={onLoadLongPlaylistFirst100}
            >
              {t('playlist.loadFirst100')}
            </button>
          </div>
        </div>
      )}

      {hasVideos && (
        <div className="playlist-panel__results">
          <div className="playlist-panel__results-header">
            <p className="playlist-panel__results-title">{playlistTitle}</p>
            <span className="playlist-panel__count">{t(videoCountKey, { count: videos.length })}</span>
          </div>
          <Cola
            title={t('playlist.queueTitle')}
            emptyMessage={t('playlist.queueEmpty')}
            videos={videos}
            isDisabled={isBatchDownloading}
            downloadLabel={t('playlist.downloadLabel')}
            onDownloadAll={onDownloadPlaylist}
            onQuickDownloadVideo={onQuickDownloadVideo}
            onRemoveVideo={onRemoveVideo}
          />
        </div>
      )}
    </div>
  )
}

export default PlaylistPanel
