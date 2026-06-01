import type { RefObject } from 'react'
import type { YouTubeWebviewElement } from '../../types/ipc'
import './YouTubeBrowser.scss'

interface YouTubeBrowserProps {
  youtubeWebviewPreloadPath: string
  clickedVideos: string[]
  youtubeWebviewRef: RefObject<YouTubeWebviewElement | null>
  onUseVideo: (videoUrl: string) => void
  onQuickDownloadVideo: (videoUrl: string) => void
}

function YouTubeBrowser({
  youtubeWebviewPreloadPath,
  clickedVideos,
  youtubeWebviewRef,
  onUseVideo,
  onQuickDownloadVideo
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
        </div>

        {clickedVideos.length > 0 ? (
          <ol className="youtube-floating-list__items">
            {clickedVideos.map((videoUrl) => (
              <li className="youtube-floating-list__item" key={videoUrl}>
                <span className="break-anywhere">{videoUrl}</span>
                <div className="youtube-floating-list__actions">
                  <button type="button" onClick={() => onUseVideo(videoUrl)}>
                    Usar
                  </button>
                  <button type="button" onClick={() => onQuickDownloadVideo(videoUrl)}>
                    Rapida
                  </button>
                </div>
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
