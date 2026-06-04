import { useLanguage } from '../../contexts/LanguageContext'
import type { YouTubeWebviewElement } from '../../types/ipc'
import './YouTubeBrowser.scss'

interface YouTubeBrowserProps {
  youtubeWebviewPreloadPath: string
  clickedVideos: string[]
  bindYouTubeWebview: (webview: YouTubeWebviewElement | null) => void
  onUseVideo: (videoUrl: string) => void
  onQuickDownloadVideo: (videoUrl: string) => void
}

function YouTubeBrowser({
  youtubeWebviewPreloadPath,
  clickedVideos,
  bindYouTubeWebview,
  onUseVideo,
  onQuickDownloadVideo
}: YouTubeBrowserProps): JSX.Element {
  const { t } = useLanguage()

  return (
    <section className="youtube-browser">
      {youtubeWebviewPreloadPath ? (
        <webview
          ref={bindYouTubeWebview}
          className="youtube-browser__webview"
          src="https://www.youtube.com"
          preload={youtubeWebviewPreloadPath}
          partition="persist:whodownloads-youtube"
          allowpopups="true"
        />
      ) : (
        <div className="youtube-browser__loading">{t('youtube.loading')}</div>
      )}

      <div className="youtube-floating-list">
        <div className="youtube-floating-list__header">
          <div>
            <p className="youtube-floating-list__eyebrow">YouTube</p>
            <h2 className="youtube-floating-list__title">{t('youtube.clickedTitle')}</h2>
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
                    {t('youtube.use')}
                  </button>
                  <button type="button" onClick={() => onQuickDownloadVideo(videoUrl)}>
                    {t('youtube.quick')}
                  </button>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="youtube-floating-list__empty">
            {t('youtube.rightClickEmpty')}
          </p>
        )}
      </div>
    </section>
  )
}

export default YouTubeBrowser
