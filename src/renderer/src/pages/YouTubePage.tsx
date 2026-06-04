import { useEffect, useState } from 'react'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'
import Cola from '../components/Cola/Cola'
import StatusPanel from '../components/StatusPanel/StatusPanel'
import YouTubeBrowser from '../components/YouTubeBrowser/YouTubeBrowser'
import { useDownloadContext } from '../contexts/DownloadContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useNavigation } from '../contexts/NavigationContext'
import { useYouTubeContext } from '../contexts/YouTubeContext'
import type { QueueVideo } from '../components/Cola/types'
import { urlsToQueueVideos } from '../utils/queueVideos'
import type { VideoMetadataPreview } from '../../../shared/downloadTypes'

function YouTubePage(): JSX.Element {
  const { t } = useLanguage()
  const youtube = useYouTubeContext()
  const download = useDownloadContext()
  const { setActivePage } = useNavigation()
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true)
  const [visibleNoticeId, setVisibleNoticeId] = useState<number | null>(null)

  useEffect(() => {
    void youtube.ensureYouTubePreloadPath()
  }, [])

  useEffect(() => {
    if (!youtube.lastValidClickNotice) {
      return
    }

    setVisibleNoticeId(youtube.lastValidClickNotice.id)

    const timeoutId = window.setTimeout(() => {
      setVisibleNoticeId((currentNoticeId) =>
        currentNoticeId === youtube.lastValidClickNotice?.id ? null : currentNoticeId
      )
    }, 2600)

    return () => window.clearTimeout(timeoutId)
  }, [youtube.lastValidClickNotice])

  function useVideo(videoUrl: string): void {
    download.setVideoUrl(videoUrl)
    setActivePage('home')
  }

  function quickDownload(videoUrl: string): void {
    setActivePage('home')
    void download.quickDownloadUrl(videoUrl)
  }

  const queueVideos = urlsToQueueVideos(youtube.clickedVideos)
  const visibleNotice =
    youtube.lastValidClickNotice && visibleNoticeId === youtube.lastValidClickNotice.id
      ? youtube.lastValidClickNotice
      : null

  function downloadClickedVideos(videos: QueueVideo[]): void {
    const metadataByUrl = videos.reduce<Record<string, VideoMetadataPreview>>((metadata, video) => {
      metadata[video.url] = {
        title: video.title,
        artist: '',
        year: '',
        authorUrl: video.url,
        url: video.url
      }

      return metadata
    }, {})

    void download.downloadUrls(
      videos.map((video) => video.url),
      'youtube',
      metadataByUrl
    )
  }

  return (
    <section className={`youtube-page ${isSidePanelOpen ? '' : 'youtube-page--side-closed'}`}>
      <div className="youtube-page__main">
        <button
          className="youtube-page__toggle"
          type="button"
          aria-pressed={isSidePanelOpen}
          aria-label={isSidePanelOpen ? t('youtube.hideSideList') : t('youtube.showSideList')}
          onClick={() => setIsSidePanelOpen((isOpen) => !isOpen)}
        >
          {isSidePanelOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
          <span>{isSidePanelOpen ? t('youtube.hideList') : t('youtube.showList')}</span>
          <span className="youtube-page__toggle-count">{queueVideos.length}</span>
        </button>
        <YouTubeBrowser
          youtubeWebviewPreloadPath={youtube.youtubeWebviewPreloadPath}
          clickedVideos={youtube.clickedVideos}
          bindYouTubeWebview={youtube.bindYouTubeWebview}
          onUseVideo={useVideo}
          onQuickDownloadVideo={quickDownload}
        />
        {visibleNotice ? (
          <div
            className={`youtube-click-toast ${
              visibleNotice.isDuplicate ? 'youtube-click-toast--duplicate' : ''
            }`}
            role="status"
            aria-live="polite"
          >
            <span className="youtube-click-toast__label">
              {visibleNotice.isDuplicate
                ? t('youtube.duplicateToast')
                : t('youtube.addedToast')}
            </span>
            <span className="youtube-click-toast__url">{visibleNotice.url}</span>
          </div>
        ) : null}
      </div>
      <div className="youtube-page__side" aria-hidden={!isSidePanelOpen}>
        <Cola
          title={t('youtube.clickedTitle')}
          emptyMessage={t('youtube.clickedEmpty')}
          videos={queueVideos}
          isDisabled={download.isBatchDownloading}
          downloadLabel={t('youtube.clickedDownloadLabel')}
          onDownloadAll={downloadClickedVideos}
          onQuickDownloadVideo={quickDownload}
          onRemoveVideo={youtube.removeClickedVideo}
        />
        <StatusPanel progress={download.progress} />
      </div>
    </section>
  )
}

export default YouTubePage
