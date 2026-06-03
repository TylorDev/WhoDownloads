import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchPlaylistEntries } from './playlistService'
import { runYtDlpForJson } from './ytdlpService'

vi.mock('./ytdlpService', () => ({
  runYtDlpForJson: vi.fn()
}))

describe('fetchPlaylistEntries', () => {
  const originalLogsEnv = process.env['WHODOWNLOADS_LOGS']

  beforeEach(() => {
    vi.mocked(runYtDlpForJson).mockReset()
    vi.mocked(runYtDlpForJson).mockResolvedValue({
      ok: true,
      stdout: JSON.stringify({ title: 'Playlist', entries: [] })
    })
  })

  afterEach(() => {
    if (originalLogsEnv === undefined) {
      delete process.env['WHODOWNLOADS_LOGS']
    } else {
      process.env['WHODOWNLOADS_LOGS'] = originalLogsEnv
    }
    vi.restoreAllMocks()
  })

  it('fetches playlist entries without cookie args by default', async () => {
    await fetchPlaylistEntries('C:\\bin\\yt-dlp.exe', 'https://www.youtube.com/playlist?list=abc')

    expect(runYtDlpForJson).toHaveBeenCalledWith(
      'C:\\bin\\yt-dlp.exe',
      [
        '--flat-playlist',
        '--dump-single-json',
        '--no-warnings',
        'https://www.youtube.com/playlist?list=abc'
      ],
      undefined
    )
  })

  it('passes embedded YouTube cookie args to yt-dlp', async () => {
    await fetchPlaylistEntries(
      'C:\\bin\\yt-dlp.exe',
      'https://www.youtube.com/playlist?list=abc',
      ['--cookies', 'C:\\UserData\\cookies.txt']
    )

    expect(runYtDlpForJson).toHaveBeenCalledWith(
      'C:\\bin\\yt-dlp.exe',
      [
        '--flat-playlist',
        '--dump-single-json',
        '--no-warnings',
        '--cookies',
        'C:\\UserData\\cookies.txt',
        'https://www.youtube.com/playlist?list=abc'
      ],
      undefined
    )
  })

  it('passes a logger to yt-dlp and emits playlist logs with --logs', async () => {
    process.env['WHODOWNLOADS_LOGS'] = '1'
    vi.spyOn(console, 'info').mockImplementation(() => undefined)

    await fetchPlaylistEntries('C:\\bin\\yt-dlp.exe', 'https://www.youtube.com/playlist?list=abc')

    expect(runYtDlpForJson).toHaveBeenCalledWith(
      'C:\\bin\\yt-dlp.exe',
      expect.any(Array),
      expect.objectContaining({ prefix: 'playlist' })
    )
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining('[playlist:start]'))
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining('[playlist:result]'))
  })
})
