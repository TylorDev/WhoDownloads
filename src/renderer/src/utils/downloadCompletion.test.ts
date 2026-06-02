import { describe, expect, it } from 'vitest'
import {
  isBatchDownloadSuccessful,
  shouldClearDownloadInput,
  shouldClearPlaylistStateForUrl
} from './downloadCompletion'

describe('downloadCompletion', () => {
  it('clears a single-download input only after successful downloads', () => {
    expect(shouldClearDownloadInput({ ok: true, filePath: 'C:\\Downloads\\video.mp4' })).toBe(true)
    expect(shouldClearDownloadInput({ ok: false, error: 'failed' })).toBe(false)
  })

  it('marks batch downloads successful only when no videos failed', () => {
    expect(isBatchDownloadSuccessful(0)).toBe(true)
    expect(isBatchDownloadSuccessful(1)).toBe(false)
  })

  it('clears playlist state only when the playlist URL input is empty', () => {
    expect(shouldClearPlaylistStateForUrl('')).toBe(true)
    expect(shouldClearPlaylistStateForUrl('   ')).toBe(true)
    expect(shouldClearPlaylistStateForUrl('https://www.youtube.com/playlist?list=abc')).toBe(false)
  })
})
