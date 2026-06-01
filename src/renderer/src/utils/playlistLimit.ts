import type { PlaylistEntry } from '../types/ipc'

export const LONG_PLAYLIST_LIMIT = 100

export type PendingLongPlaylist = {
  title: string
  entries: PlaylistEntry[]
}

export function shouldWarnForLongPlaylist(entries: PlaylistEntry[]): boolean {
  return entries.length > LONG_PLAYLIST_LIMIT
}

export function takeFirstPlaylistEntries(entries: PlaylistEntry[]): PlaylistEntry[] {
  return entries.slice(0, LONG_PLAYLIST_LIMIT)
}
