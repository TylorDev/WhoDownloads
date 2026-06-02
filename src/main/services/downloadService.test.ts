import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { App, WebContents } from 'electron'
import { downloadVideo, previewVideo } from './downloadService'
import { runYtDlpDownload } from './ytdlpService'
import { fetchVideoMetadata } from './metadataService'

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn(() => Promise.resolve())
}))

vi.mock('../utils/paths', () => ({
  getDownloadOutputDirectory: vi.fn(() => 'C:\\Downloads\\WhoDownloads'),
  getWindowsBinaryPath: vi.fn((_app: App, binaryName: string) => `C:\\bin\\${binaryName}.exe`)
}))

vi.mock('./metadataService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./metadataService')>()

  return {
    ...actual,
    fetchVideoMetadata: vi.fn()
  }
})

vi.mock('./ytdlpService', () => ({
  runYtDlpDownload: vi.fn()
}))

function createAppStub(): App {
  return {} as App
}

function createSenderStub(): WebContents & { sent: Array<[string, unknown]> } {
  const sent: Array<[string, unknown]> = []

  return {
    sent,
    send: vi.fn((channel: string, payload: unknown) => {
      sent.push([channel, payload])
    })
  } as unknown as WebContents & { sent: Array<[string, unknown]> }
}

describe('previewVideo', () => {
  beforeEach(() => {
    vi.mocked(fetchVideoMetadata).mockReset()
  })

  it('validates URL before calling yt-dlp metadata fetch', async () => {
    const result = await previewVideo(createAppStub(), 'https://example.com/nope')

    expect(result).toEqual({ ok: false, error: 'La URL debe ser de youtube.com o youtu.be.' })
    expect(fetchVideoMetadata).not.toHaveBeenCalled()
  })

  it('fetches metadata for valid YouTube URLs', async () => {
    vi.mocked(fetchVideoMetadata).mockResolvedValue({
      ok: true,
      metadata: {
        title: 'Title',
        artist: 'Channel',
        year: '2024',
        authorUrl: 'https://youtu.be/abc',
        url: 'https://youtu.be/abc'
      }
    })

    const result = await previewVideo(createAppStub(), 'https://youtu.be/abc')

    expect(result.ok).toBe(true)
    expect(fetchVideoMetadata).toHaveBeenCalledWith('C:\\bin\\yt-dlp.exe', 'https://youtu.be/abc')
  })
})

describe('downloadVideo', () => {
  beforeEach(() => {
    vi.mocked(runYtDlpDownload).mockReset()
  })

  it('emits starting and completed progress for successful downloads', async () => {
    const sender = createSenderStub()
    vi.mocked(runYtDlpDownload).mockResolvedValue({ ok: true, filePath: 'C:\\Downloads\\song.mp3' })

    const result = await downloadVideo(
      createAppStub(),
      { url: 'https://youtu.be/abc', format: 'mp3', quality: '192' },
      sender
    )

    expect(result).toEqual({ ok: true, filePath: 'C:\\Downloads\\song.mp3' })
    expect(sender.sent).toEqual([
      ['download-progress', { status: 'starting', message: 'Preparando descarga...' }],
      [
        'download-progress',
        {
          status: 'completed',
          percent: 100,
          filePath: 'C:\\Downloads\\song.mp3',
          message: 'Descargado: C:\\Downloads\\song.mp3'
        }
      ]
    ])
  })

  it('emits taskId with download progress when provided', async () => {
    const sender = createSenderStub()
    vi.mocked(runYtDlpDownload).mockImplementation(async (_path, _args, _format, onProgress) => {
      onProgress({ status: 'downloading', percent: 50, message: '50%' })
      return { ok: true, filePath: 'C:\\Downloads\\song.mp3' }
    })

    await downloadVideo(
      createAppStub(),
      { url: 'https://youtu.be/abc', format: 'mp3', quality: '192', taskId: 'task-1' },
      sender
    )

    expect(sender.sent).toContainEqual([
      'download-progress',
      { taskId: 'task-1', status: 'downloading', percent: 50, message: '50%' }
    ])
    expect(sender.sent.at(-1)).toEqual([
      'download-progress',
      {
        taskId: 'task-1',
        status: 'completed',
        percent: 100,
        filePath: 'C:\\Downloads\\song.mp3',
        message: 'Descargado: C:\\Downloads\\song.mp3'
      }
    ])
  })

  it('uses configured download directory when provided', async () => {
    const sender = createSenderStub()
    vi.mocked(runYtDlpDownload).mockResolvedValue({ ok: true, filePath: 'D:\\Videos\\song.mp4' })

    await downloadVideo(
      createAppStub(),
      { url: 'https://youtu.be/abc', format: 'mp4', quality: '720' },
      sender,
      {
        downloadDirectory: 'D:\\Videos',
        defaultFormat: 'mp4',
        defaultQuality: '720',
        quickDownloadConfigured: true
      }
    )

    expect(runYtDlpDownload).toHaveBeenCalledWith(
      'C:\\bin\\yt-dlp.exe',
      expect.arrayContaining(['-o', 'D:\\Videos\\%(title).180B.%(ext)s']),
      'mp4',
      expect.any(Function)
    )
  })

  it('returns MP4 format errors with the compatibility message', async () => {
    const sender = createSenderStub()
    vi.mocked(runYtDlpDownload).mockResolvedValue({
      ok: false,
      stderr: 'ERROR: Requested format is not available'
    })

    const result = await downloadVideo(
      createAppStub(),
      { url: 'https://youtu.be/abc', format: 'mp4', quality: '1080' },
      sender
    )

    expect(result).toEqual({
      ok: false,
      error: 'No se encontró una versión MP4 compatible H.264/AAC para esta calidad.'
    })
  })

  it('returns MP3 extraction errors with the MP3 message', async () => {
    const sender = createSenderStub()
    vi.mocked(runYtDlpDownload).mockResolvedValue({
      ok: false,
      stderr: 'ERROR: No video formats found'
    })

    const result = await downloadVideo(
      createAppStub(),
      { url: 'https://youtu.be/abc', format: 'mp3', quality: 'auto' },
      sender
    )

    expect(result).toEqual({ ok: false, error: 'No se pudo extraer audio MP3 para esta URL.' })
  })

  it('allows four simultaneous downloads and rejects the fifth', async () => {
    const senders = Array.from({ length: 5 }, () => createSenderStub())
    const resolvers: Array<(value: Awaited<ReturnType<typeof runYtDlpDownload>>) => void> = []
    vi.mocked(runYtDlpDownload).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvers.push(resolve)
        })
    )

    const active = Array.from({ length: 4 }, (_, index) =>
      downloadVideo(
        createAppStub(),
        { url: `https://youtu.be/video-${index}`, format: 'mp3', quality: 'auto' },
        senders[index]
      )
    )
    const fifth = await downloadVideo(
      createAppStub(),
      { url: 'https://youtu.be/fifth', format: 'mp3', quality: 'auto' },
      senders[4]
    )

    expect(fifth).toEqual({
      ok: false,
      error: 'Ya hay 4 descargas activas. Espera a que termine una.'
    })

    resolvers.forEach((resolve, index) => {
      resolve({ ok: true, filePath: `C:\\Downloads\\video-${index}.mp3` })
    })
    await Promise.all(active)
  })

  it('releases download slots after failure', async () => {
    const sender = createSenderStub()
    vi.mocked(runYtDlpDownload).mockResolvedValueOnce({
      ok: false,
      stderr: 'ERROR: failed',
      error: 'failed'
    })

    await downloadVideo(
      createAppStub(),
      { url: 'https://youtu.be/fail', format: 'mp3', quality: 'auto' },
      sender
    )

    vi.mocked(runYtDlpDownload).mockResolvedValueOnce({
      ok: true,
      filePath: 'C:\\Downloads\\next.mp3'
    })

    await expect(
      downloadVideo(
        createAppStub(),
        { url: 'https://youtu.be/next', format: 'mp3', quality: 'auto' },
        sender
      )
    ).resolves.toEqual({ ok: true, filePath: 'C:\\Downloads\\next.mp3' })
  })
})
