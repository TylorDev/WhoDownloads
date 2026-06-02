import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchPlaylistEntries } from './playlistService'
import { runYtDlpForJson } from './ytdlpService'

vi.mock('./ytdlpService', () => ({
  runYtDlpForJson: vi.fn()
}))

describe('fetchPlaylistEntries', () => {
  beforeEach(() => {
    vi.mocked(runYtDlpForJson).mockReset()
    vi.mocked(runYtDlpForJson).mockResolvedValue({
      ok: true,
      stdout: JSON.stringify({ title: 'Playlist', entries: [] })
    })
  })

  it('fetches playlist entries without cookie args by default', async () => {
    await fetchPlaylistEntries('C:\\bin\\yt-dlp.exe', 'https://www.youtube.com/playlist?list=abc')

    expect(runYtDlpForJson).toHaveBeenCalledWith('C:\\bin\\yt-dlp.exe', [
      '--flat-playlist',
      '--dump-single-json',
      '--no-warnings',
      'https://www.youtube.com/playlist?list=abc'
    ])
  })

  it('passes embedded YouTube cookie args to yt-dlp', async () => {
    await fetchPlaylistEntries(
      'C:\\bin\\yt-dlp.exe',
      'https://www.youtube.com/playlist?list=abc',
      ['--cookies', 'C:\\UserData\\cookies.txt']
    )

    expect(runYtDlpForJson).toHaveBeenCalledWith('C:\\bin\\yt-dlp.exe', [
      '--flat-playlist',
      '--dump-single-json',
      '--no-warnings',
      '--cookies',
      'C:\\UserData\\cookies.txt',
      'https://www.youtube.com/playlist?list=abc'
    ])
  })
})
