import { useEffect, useState } from 'react'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'
import { Cola, StatusPanel, YouTubeBrowser } from '../components'
import { useDownloadContext } from '../contexts/DownloadContext'
import { useNavigation } from '../contexts/NavigationContext'
import { useYouTubeContext } from '../contexts/YouTubeContext'
import type { QueueVideo } from '../components/Cola/types'
import { urlsToQueueVideos } from '../utils/queueVideos'
import type { VideoMetadataPreview } from '../../../shared/downloadTypes'

function YouTubePage(): JSX.Element {
  const youtube = useYouTubeContext()
  const download = useDownloadContext()
  const { setActivePage } = useNavigation()
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true)

  useEffect(() => {
    void youtube.ensureYouTubePreloadPath()
  }, [])

  function useVideo(videoUrl: string): void {
    download.setVideoUrl(videoUrl)
    setActivePage('home')
  }

  function quickDownload(videoUrl: string): void {
    setActivePage('home')
    void download.quickDownloadUrl(videoUrl)
  }

  const queueVideos = urlsToQueueVideos(youtube.clickedVideos)

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
          aria-label={isSidePanelOpen ? 'Ocultar lista lateral' : 'Mostrar lista lateral'}
          onClick={() => setIsSidePanelOpen((isOpen) => !isOpen)}
        >
          {isSidePanelOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
          <span>{isSidePanelOpen ? 'Ocultar lista' : 'Mostrar lista'}</span>
          <span className="youtube-page__toggle-count">{queueVideos.length}</span>
        </button>
        <YouTubeBrowser
          youtubeWebviewPreloadPath={youtube.youtubeWebviewPreloadPath}
          clickedVideos={youtube.clickedVideos}
          youtubeWebviewRef={youtube.youtubeWebviewRef}
          onUseVideo={useVideo}
          onQuickDownloadVideo={quickDownload}
        />
      </div>
      <div className="youtube-page__side" aria-hidden={!isSidePanelOpen}>
        <Cola
          title="Videos clickeados"
          emptyMessage="Abre YouTube dentro de la app y entra a videos para agregarlos a esta lista."
          videos={queueVideos}
          isDisabled={download.isBatchDownloading}
          downloadLabel="Descargar"
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
