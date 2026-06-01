import { describe, expect, it } from 'vitest'
import {
  LONG_PLAYLIST_LIMIT,
  shouldWarnForLongPlaylist,
  takeFirstPlaylistEntries
} from './playlistLimit'
import type { PlaylistEntry } from '../types/ipc'

function makeEntries(count: number): PlaylistEntry[] {
  return Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    title: `Video ${index + 1}`,
    url: `https://www.youtube.com/watch?v=${index + 1}`
  }))
}

describe('playlistLimit', () => {
  it('does not warn for exactly 100 entries', () => {
    expect(shouldWarnForLongPlaylist(makeEntries(LONG_PLAYLIST_LIMIT))).toBe(false)
  })

  it('warns for more than 100 entries', () => {
    expect(shouldWarnForLongPlaylist(makeEntries(LONG_PLAYLIST_LIMIT + 1))).toBe(true)
  })

  it('keeps only the first 100 entries preserving order', () => {
    const limitedEntries = takeFirstPlaylistEntries(makeEntries(120))

    expect(limitedEntries).toHaveLength(100)
    expect(limitedEntries[0].id).toBe('1')
    expect(limitedEntries[99].id).toBe('100')
  })
})
