import { useDownload } from './hooks/useDownload'
import { usePlaylist } from './hooks/usePlaylist'
import { useYouTubeBrowser } from './hooks/useYouTubeBrowser'
import {
  ClickedVideosList,
  DownloadForm,
  Hero,
  MetadataCard,
  PlaylistPanel,
  StatusPanel,
  YouTubeBrowser
} from './components'
import './App.scss'

function App(): JSX.Element {
  const download = useDownload()
  const playlist = usePlaylist(download.handleUrlChange)
  const youtube = useYouTubeBrowser()

  return (
    <main className="app-shell">
      {youtube.isYouTubeOpen && (
        <YouTubeBrowser
          youtubeWebviewPreloadPath={youtube.youtubeWebviewPreloadPath}
          clickedVideos={youtube.clickedVideos}
          youtubeWebviewRef={youtube.youtubeWebviewRef}
          onClose={youtube.handleYouTubeBrowserToggle}
        />
      )}

      <section className={youtube.isYouTubeOpen ? 'app-container app-container--hidden' : 'app-container'}>
        <Hero />
        <DownloadForm
          url={download.url}
          format={download.format}
          quality={download.quality}
          isDownloading={download.isDownloading}
          isPreviewLoading={download.isPreviewLoading}
          hasCurrentPreview={download.hasCurrentPreview}
          canSubmit={download.canSubmit}
          isYouTubeOpen={youtube.isYouTubeOpen}
          onUrlChange={download.handleUrlChange}
          onFormatChange={download.setFormat}
          onQualityChange={download.setQuality}
          onSubmit={download.handleSubmit}
          onYouTubeToggle={youtube.handleYouTubeBrowserToggle}
        />
        <PlaylistPanel
          playlistUrl={playlist.playlistUrl}
          playlistTitle={playlist.playlistTitle}
          entries={playlist.entries}
          isLoading={playlist.isLoading}
          error={playlist.error}
          onPlaylistUrlChange={playlist.handlePlaylistUrlChange}
          onFetchPlaylist={playlist.handleFetchPlaylist}
          onUseVideoUrl={playlist.handleUseVideoUrl}
        />
        <ClickedVideosList
          videos={youtube.clickedVideos}
          isYouTubeOpen={youtube.isYouTubeOpen}
        />
        {download.metadata && <MetadataCard metadata={download.metadata} />}
        <StatusPanel progress={download.progress} />
      </section>
    </main>
  )
}

export default App
