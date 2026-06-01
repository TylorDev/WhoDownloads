import { FormEvent, useState } from 'react'
import { looksLikeYouTubePlaylistUrl } from '../../../shared/youtubeUrl'
import type { PlaylistEntry } from '../types/ipc'

export interface UsePlaylistReturn {
  playlistUrl: string
  playlistTitle: string
  entries: PlaylistEntry[]
  isLoading: boolean
  error: string | null
  handlePlaylistUrlChange: (value: string) => void
  handleFetchPlaylist: (event: FormEvent<HTMLFormElement>) => Promise<void>
  handleUseVideoUrl: (videoUrl: string) => void
}

export function usePlaylist(
  onSelectVideoUrl: (url: string) => void
): UsePlaylistReturn {
  const [playlistUrl, setPlaylistUrl] = useState('')
  const [playlistTitle, setPlaylistTitle] = useState('')
  const [entries, setEntries] = useState<PlaylistEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handlePlaylistUrlChange(value: string): void {
    setPlaylistUrl(value)

    if (error) {
      setError(null)
    }
  }

  async function handleFetchPlaylist(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const cleanUrl = playlistUrl.trim()

    if (!cleanUrl) {
      setError('Pega una URL de playlist de YouTube.')
      return
    }

    if (!looksLikeYouTubePlaylistUrl(cleanUrl)) {
      setError('La URL debe ser una playlist de YouTube (con ?list=...).')
      return
    }

    setIsLoading(true)
    setError(null)
    setEntries([])
    setPlaylistTitle('')

    const result = await window.whoDownloads.fetchPlaylist(cleanUrl)

    setIsLoading(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    if (result.entries.length === 0) {
      setError('La playlist está vacía o no se encontraron videos.')
      return
    }

    setPlaylistTitle(result.title)
    setEntries(result.entries)
  }

  function handleUseVideoUrl(videoUrl: string): void {
    onSelectVideoUrl(videoUrl)
  }

  return {
    playlistUrl,
    playlistTitle,
    entries,
    isLoading,
    error,
    handlePlaylistUrlChange,
    handleFetchPlaylist,
    handleUseVideoUrl
  }
}
