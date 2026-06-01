import type { FormEvent } from 'react'
import type { PlaylistEntry } from '../../types/ipc'
import { formatDuration } from '../../utils/formatDuration'
import './PlaylistPanel.scss'

interface PlaylistPanelProps {
  playlistUrl: string
  playlistTitle: string
  entries: PlaylistEntry[]
  isLoading: boolean
  error: string | null
  onPlaylistUrlChange: (value: string) => void
  onFetchPlaylist: (event: FormEvent<HTMLFormElement>) => Promise<void>
  onUseVideoUrl: (videoUrl: string) => void
}

function PlaylistPanel({
  playlistUrl,
  playlistTitle,
  entries,
  isLoading,
  error,
  onPlaylistUrlChange,
  onFetchPlaylist,
  onUseVideoUrl
}: PlaylistPanelProps): JSX.Element {
  const hasEntries = entries.length > 0

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
          disabled={isLoading || !playlistUrl.trim()}
        >
          {isLoading ? 'Obteniendo lista...' : 'Obtener lista'}
        </button>
      </form>

      {error && (
        <p className="playlist-panel__error">{error}</p>
      )}

      {hasEntries && (
        <div className="playlist-panel__results">
          <div className="playlist-panel__results-header">
            <p className="playlist-panel__results-title">{playlistTitle}</p>
            <span className="playlist-panel__count">{entries.length} videos</span>
          </div>

          <ol className="playlist-panel__list">
            {entries.map((entry) => (
              <li className="playlist-panel__item" key={entry.id}>
                <div className="playlist-panel__item-info">
                  <span className="playlist-panel__item-title">{entry.title}</span>
                  {entry.duration != null && (
                    <span className="playlist-panel__item-duration">
                      {formatDuration(entry.duration)}
                    </span>
                  )}
                </div>
                <button
                  className="playlist-panel__use-button"
                  type="button"
                  onClick={() => onUseVideoUrl(entry.url)}
                >
                  Usar
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

export default PlaylistPanel
