import { PlaylistPanel, StatusPanel } from '../components'
import { useDownloadContext } from '../contexts/DownloadContext'
import { usePlaylistContext } from '../contexts/PlaylistContext'
import type { QueueVideo } from '../components/Cola/types'
import { playlistEntriesToQueueVideos } from '../utils/queueVideos'
import type { VideoMetadataPreview } from '../../../shared/downloadTypes'

function PlaylistPage(): JSX.Element {
  const playlist = usePlaylistContext()
  const download = useDownloadContext()

  function quickDownload(videoUrl: string): void {
    void download.quickDownloadUrl(videoUrl)
  }

  const queueVideos = playlistEntriesToQueueVideos(playlist.entries)

  function downloadPlaylist(videos: QueueVideo[]): void {
    const metadataByUrl = videos.reduce<Record<string, VideoMetadataPreview>>((metadata, video) => {
      metadata[video.url] = {
        title: video.title,
        artist: '',
        year: '',
        authorUrl: video.url,
        duration: video.duration,
        url: video.url
      }

      return metadata
    }, {})

    void download.downloadUrls(
      videos.map((video) => video.url),
      'playlist',
      metadataByUrl
    )
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <p className="page-heading__eyebrow">Playlist</p>
        <h1>Explora una playlist</h1>
      </div>
      <PlaylistPanel
        playlistUrl={playlist.playlistUrl}
        playlistTitle={playlist.playlistTitle}
        videos={queueVideos}
        pendingLongPlaylist={playlist.pendingLongPlaylist}
        isLoading={playlist.isLoading}
        error={playlist.error}
        onPlaylistUrlChange={playlist.setPlaylistUrl}
        onFetchPlaylist={playlist.fetchPlaylist}
        onQuickDownloadVideo={quickDownload}
        onDownloadPlaylist={downloadPlaylist}
        onRemoveVideo={playlist.removeEntry}
        onLoadLongPlaylistAll={playlist.confirmLongPlaylistLoadAll}
        onLoadLongPlaylistFirst100={playlist.confirmLongPlaylistLoadFirst100}
        isBatchDownloading={download.isBatchDownloading}
      />
      <StatusPanel progress={download.progress} />
    </section>
  )
}

export default PlaylistPage
