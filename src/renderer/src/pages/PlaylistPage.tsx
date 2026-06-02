import { useEffect } from 'react'
import PlaylistPanel from '../components/PlaylistPanel/PlaylistPanel'
import StatusPanel from '../components/StatusPanel/StatusPanel'
import { useDownloadContext } from '../contexts/DownloadContext'
import { PlaylistProvider, usePlaylistContext } from '../contexts/PlaylistContext'
import { useNavigation } from '../contexts/NavigationContext'
import type { QueueVideo } from '../components/Cola/types'
import { playlistEntriesToQueueVideos } from '../utils/queueVideos'
import type { VideoMetadataPreview } from '../../../shared/downloadTypes'

function PlaylistPageContent(): JSX.Element {
  const playlist = usePlaylistContext()
  const download = useDownloadContext()
  const { pendingPlaylistUrl, clearPendingPlaylistUrl } = useNavigation()

  useEffect(() => {
    if (!pendingPlaylistUrl) {
      return
    }

    void playlist.loadPlaylistUrl(pendingPlaylistUrl)
    clearPendingPlaylistUrl()
  }, [pendingPlaylistUrl, playlist.loadPlaylistUrl, clearPendingPlaylistUrl])

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

function PlaylistPage(): JSX.Element {
  return (
    <PlaylistProvider>
      <PlaylistPageContent />
    </PlaylistProvider>
  )
}

export default PlaylistPage
