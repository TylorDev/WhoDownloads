import { createContext, useContext, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { looksLikeYouTubePlaylistUrl } from '../../../shared/youtubeUrl'
import type { PlaylistEntry } from '../types/ipc'
import {
  shouldWarnForLongPlaylist,
  takeFirstPlaylistEntries,
  type PendingLongPlaylist
} from '../utils/playlistLimit'
import { shouldClearPlaylistStateForUrl } from '../utils/downloadCompletion'

interface PlaylistContextValue {
  playlistUrl: string
  playlistTitle: string
  entries: PlaylistEntry[]
  pendingLongPlaylist: PendingLongPlaylist | null
  isLoading: boolean
  error: string | null
  setPlaylistUrl: (value: string) => void
  fetchPlaylist: (event?: FormEvent<HTMLFormElement>) => Promise<void>
  loadPlaylistUrl: (url: string) => Promise<void>
  confirmLongPlaylistLoadAll: () => void
  confirmLongPlaylistLoadFirst100: () => void
  removeEntry: (entryId: string) => void
}

const PlaylistContext = createContext<PlaylistContextValue | null>(null)

export function PlaylistProvider({ children }: { children: ReactNode }): JSX.Element {
  const [playlistUrl, setPlaylistUrlState] = useState('')
  const [playlistTitle, setPlaylistTitle] = useState('')
  const [entries, setEntries] = useState<PlaylistEntry[]>([])
  const [pendingLongPlaylist, setPendingLongPlaylist] = useState<PendingLongPlaylist | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setPlaylistUrl(value: string): void {
    setPlaylistUrlState(value)

    if (shouldClearPlaylistStateForUrl(value)) {
      setPlaylistTitle('')
      setEntries([])
      setPendingLongPlaylist(null)
      setError(null)
      return
    }

    if (error) {
      setError(null)
    }

    setPendingLongPlaylist(null)
  }

  async function loadPlaylistUrl(url: string): Promise<void> {
    const cleanUrl = url.trim()
    setPlaylistUrl(cleanUrl)

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
    setPendingLongPlaylist(null)

    const result = await window.whoDownloads.fetchPlaylist(cleanUrl)

    setIsLoading(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    if (result.entries.length === 0) {
      setError('La playlist esta vacia o no se encontraron videos.')
      return
    }

    if (shouldWarnForLongPlaylist(result.entries)) {
      setPendingLongPlaylist({ title: result.title, entries: result.entries })
      return
    }

    setPlaylistTitle(result.title)
    setEntries(result.entries)
  }

  async function fetchPlaylist(event?: FormEvent<HTMLFormElement>): Promise<void> {
    event?.preventDefault()
    await loadPlaylistUrl(playlistUrl)
  }

  function removeEntry(entryId: string): void {
    setEntries((currentEntries) => currentEntries.filter((entry) => entry.id !== entryId))
  }

  function confirmLongPlaylistLoadAll(): void {
    if (!pendingLongPlaylist) {
      return
    }

    setPlaylistTitle(pendingLongPlaylist.title)
    setEntries(pendingLongPlaylist.entries)
    setPendingLongPlaylist(null)
  }

  function confirmLongPlaylistLoadFirst100(): void {
    if (!pendingLongPlaylist) {
      return
    }

    setPlaylistTitle(pendingLongPlaylist.title)
    setEntries(takeFirstPlaylistEntries(pendingLongPlaylist.entries))
    setPendingLongPlaylist(null)
  }

  const value = useMemo(
    () => ({
      playlistUrl,
      playlistTitle,
      entries,
      pendingLongPlaylist,
      isLoading,
      error,
      setPlaylistUrl,
      fetchPlaylist,
      loadPlaylistUrl,
      confirmLongPlaylistLoadAll,
      confirmLongPlaylistLoadFirst100,
      removeEntry
    }),
    [playlistUrl, playlistTitle, entries, pendingLongPlaylist, isLoading, error]
  )

  return <PlaylistContext.Provider value={value}>{children}</PlaylistContext.Provider>
}

export function usePlaylistContext(): PlaylistContextValue {
  const value = useContext(PlaylistContext)

  if (!value) {
    throw new Error('usePlaylistContext must be used inside PlaylistProvider')
  }

  return value
}
