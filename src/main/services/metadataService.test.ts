import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchVideoMetadata, mapMetadataPreview } from './metadataService'
import { runYtDlpForJson } from './ytdlpService'

vi.mock('./ytdlpService', () => ({
  runYtDlpForJson: vi.fn()
}))

describe('fetchVideoMetadata', () => {
  const originalLogsEnv = process.env['WHODOWNLOADS_LOGS']

  beforeEach(() => {
    vi.mocked(runYtDlpForJson).mockReset()
    vi.mocked(runYtDlpForJson).mockResolvedValue({
      ok: true,
      stdout: JSON.stringify({ title: 'Song title', uploader: 'Channel name' })
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

  it('fetches metadata without a logger by default', async () => {
    await fetchVideoMetadata(
      'C:\\bin\\yt-dlp.exe',
      'https://youtu.be/abc',
      [],
      ['--js-runtimes', 'node:C:\\bin\\node\\node.exe']
    )

    expect(runYtDlpForJson).toHaveBeenCalledWith(
      'C:\\bin\\yt-dlp.exe',
      [
        '--dump-single-json',
        '--skip-download',
        '--no-playlist',
        '--js-runtimes',
        'node:C:\\bin\\node\\node.exe',
        'https://youtu.be/abc'
      ],
      undefined,
      expect.objectContaining({ timeoutMs: 25000 })
    )
  })

  it('passes a logger to yt-dlp and emits preview logs with --logs', async () => {
    process.env['WHODOWNLOADS_LOGS'] = '1'
    vi.spyOn(console, 'info').mockImplementation(() => undefined)

    await fetchVideoMetadata(
      'C:\\bin\\yt-dlp.exe',
      'https://youtu.be/abc',
      [],
      ['--js-runtimes', 'node:C:\\bin\\node\\node.exe']
    )

    expect(runYtDlpForJson).toHaveBeenCalledWith(
      'C:\\bin\\yt-dlp.exe',
      expect.any(Array),
      expect.objectContaining({ prefix: 'preview' }),
      expect.objectContaining({ timeoutMs: 25000 })
    )
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining('[preview:start]'))
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining('node:C:\\\\bin\\\\node\\\\node.exe'))
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining('[preview:result]'))
  })
})

describe('mapMetadataPreview', () => {
  it('maps yt-dlp JSON into preview metadata', () => {
    const result = mapMetadataPreview(
      JSON.stringify({
        title: 'Song title',
        uploader: 'Channel name',
        upload_date: '20240517',
        webpage_url: 'https://www.youtube.com/watch?v=abc',
        thumbnail: 'https://i.ytimg.com/vi/abc/maxresdefault.jpg',
        duration: 185
      }),
      'https://youtu.be/abc'
    )

    expect(result).toEqual({
      ok: true,
      metadata: {
        title: 'Song title',
        artist: 'Channel name',
        year: '2024',
        authorUrl: 'https://www.youtube.com/watch?v=abc',
        thumbnailUrl: 'https://i.ytimg.com/vi/abc/maxresdefault.jpg',
        duration: 185,
        url: 'https://www.youtube.com/watch?v=abc'
      }
    })
  })

  it('falls back to channel, fallback URL, and latest thumbnail from the list', () => {
    const result = mapMetadataPreview(
      JSON.stringify({
        title: 'Fallback song',
        channel: 'Fallback channel',
        thumbnails: [{ url: 'small.jpg' }, { url: 'large.jpg' }]
      }),
      'https://youtu.be/fallback'
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.metadata.artist).toBe('Fallback channel')
      expect(result.metadata.year).toBe('')
      expect(result.metadata.authorUrl).toBe('https://youtu.be/fallback')
      expect(result.metadata.thumbnailUrl).toBe('large.jpg')
    }
  })

  it('returns an error for invalid JSON', () => {
    expect(mapMetadataPreview('{bad json', 'https://youtu.be/abc')).toEqual({
      ok: false,
      error: 'No se pudo leer la metadata del video.'
    })
  })
})
