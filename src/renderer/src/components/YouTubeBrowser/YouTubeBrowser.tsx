import type { RefObject } from 'react'
import type { YouTubeWebviewElement } from '../../types/ipc'
import './YouTubeBrowser.scss'

interface YouTubeBrowserProps {
  youtubeWebviewPreloadPath: string
  clickedVideos: string[]
  youtubeWebviewRef: RefObject<YouTubeWebviewElement | null>
  onClose: () => Promise<void>
}

function YouTubeBrowser({
  youtubeWebviewPreloadPath,
  clickedVideos,
  youtubeWebviewRef,
  onClose
}: YouTubeBrowserProps): JSX.Element {
  return (
    <section className="youtube-browser">
      {youtubeWebviewPreloadPath ? (
        <webview
          ref={youtubeWebviewRef}
          className="youtube-browser__webview"
          src="https://www.youtube.com"
          preload={youtubeWebviewPreloadPath}
          partition="persist:whodownloads-youtube"
          allowpopups="true"
        />
      ) : (
        <div className="youtube-browser__loading">Cargando YouTube...</div>
      )}

      <div className="youtube-floating-list">
        <div className="youtube-floating-list__header">
          <div>
            <p className="youtube-floating-list__eyebrow">YouTube</p>
            <h2 className="youtube-floating-list__title">Videos clickeados</h2>
          </div>
          <span className="youtube-floating-list__count">{clickedVideos.length}</span>
          <button
            className="secondary-button"
            type="button"
            onClick={onClose}
          >
            Cerrar YouTube
          </button>
        </div>

        {clickedVideos.length > 0 ? (
          <ol className="youtube-floating-list__items">
            {clickedVideos.map((videoUrl) => (
              <li className="youtube-floating-list__item" key={videoUrl}>
                <span className="break-anywhere">{videoUrl}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="youtube-floating-list__empty">
            Click derecho sobre un video para agregarlo.
          </p>
        )}
      </div>
    </section>
  )
}

export default YouTubeBrowser
