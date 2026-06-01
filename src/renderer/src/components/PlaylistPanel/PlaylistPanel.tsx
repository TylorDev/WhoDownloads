import type { FormEvent } from 'react'
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
  const hasVideos = videos.length > 0

  return (
    <div className="playlist-panel">
      <div className="playlist-panel__header">
        <h2 className="playlist-panel__title">Playlist de YouTube</h2>
      </div>

      <form className="playlist-panel__form" onSubmit={onFetchPlaylist}>
        <label className="field" htmlFor="playlist-url">
          <span className="field__label">URL de Playlist</span>
          <input
            id="playlist-url"
            className="form-control form-control--input"
            placeholder="https://www.youtube.com/playlist?list=PLxxxxxxx"
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
          {isLoading ? 'Obteniendo lista...' : 'Obtener lista'}
        </button>
      </form>

      {error && (
        <p className="playlist-panel__error">{error}</p>
      )}

      {pendingLongPlaylist && (
        <div className="playlist-panel__warning" role="alert">
          <p className="playlist-panel__warning-title">La lista es demasiado larga.</p>
          <p className="playlist-panel__warning-copy">
            Puede causar inestabilidades en la app. Esta playlist tiene{' '}
            {pendingLongPlaylist.entries.length} videos.
          </p>
          <div className="playlist-panel__warning-actions">
            <button
              className="secondary-button"
              type="button"
              disabled={isBatchDownloading}
              onClick={onLoadLongPlaylistAll}
            >
              Cargar de todas formas
            </button>
            <button
              className="primary-button"
              type="button"
              disabled={isBatchDownloading}
              onClick={onLoadLongPlaylistFirst100}
            >
              Cargar solo los 100 primeros
            </button>
          </div>
        </div>
      )}

      {hasVideos && (
        <div className="playlist-panel__results">
          <div className="playlist-panel__results-header">
            <p className="playlist-panel__results-title">{playlistTitle}</p>
            <span className="playlist-panel__count">{videos.length} videos</span>
          </div>
          <Cola
            title="Cola de playlist"
            emptyMessage="Quita videos o carga una playlist para llenar la cola."
            videos={videos}
            isDisabled={isBatchDownloading}
            downloadLabel="Descargar playlist"
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
