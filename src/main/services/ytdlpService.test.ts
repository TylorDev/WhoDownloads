import { EventEmitter } from 'node:events'
import { PassThrough } from 'node:stream'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { spawn } from 'node:child_process'
import { normalizeYtDlpErrorMessage, runYtDlpDownload, runYtDlpForJson } from './ytdlpService'

vi.mock('node:child_process', () => ({
  spawn: vi.fn()
}))

type FakeChildProcess = EventEmitter & {
  stdout: PassThrough
  stderr: PassThrough
  killed: boolean
  kill: ReturnType<typeof vi.fn>
}

function createFakeChildProcess(): FakeChildProcess {
  const child = new EventEmitter() as FakeChildProcess
  child.stdout = new PassThrough()
  child.stderr = new PassThrough()
  child.killed = false
  child.kill = vi.fn(() => {
    child.killed = true
    child.emit('close', null)
    return true
  })

  return child
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('normalizeYtDlpErrorMessage', () => {
  it('maps YouTube anti-bot errors to embedded-session guidance', () => {
    expect(
      normalizeYtDlpErrorMessage("ERROR: [youtube] abc: Sign in to confirm you're not a bot.")
    ).toBe(
      'YouTube pide verificar la sesion. Abre YouTube dentro de la app, inicia sesion y vuelve a intentar.'
    )
  })

  it('keeps unrelated errors unchanged', () => {
    expect(normalizeYtDlpErrorMessage('ERROR: Requested format is not available')).toBe(
      'ERROR: Requested format is not available'
    )
  })
})

describe('runYtDlpForJson', () => {
  it('kills yt-dlp and returns a timeout error when metadata hangs', async () => {
    vi.useFakeTimers()
    const child = createFakeChildProcess()
    vi.mocked(spawn).mockReturnValue(child as never)

    const resultPromise = runYtDlpForJson('yt-dlp.exe', ['--dump-single-json'], undefined, {
      timeoutMs: 1000
    })

    await vi.advanceTimersByTimeAsync(1000)

    await expect(resultPromise).resolves.toEqual({
      ok: false,
      error: 'La preview tardo demasiado. Intenta otra vez o usa descarga rapida.'
    })
    expect(child.kill).toHaveBeenCalledTimes(1)
  })

  it('kills yt-dlp when the metadata request is aborted', async () => {
    const child = createFakeChildProcess()
    vi.mocked(spawn).mockReturnValue(child as never)
    const controller = new AbortController()

    const resultPromise = runYtDlpForJson('yt-dlp.exe', ['--dump-single-json'], undefined, {
      signal: controller.signal
    })

    controller.abort()

    await expect(resultPromise).resolves.toEqual({
      ok: false,
      error: 'La preview fue cancelada porque se inicio otra solicitud.'
    })
    expect(child.kill).toHaveBeenCalledTimes(1)
  })

  it('logs spawn args without exposing cookie file paths', async () => {
    const child = createFakeChildProcess()
    vi.mocked(spawn).mockReturnValue(child as never)
    const logger = {
      prefix: 'preview',
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    }

    const resultPromise = runYtDlpForJson(
      'yt-dlp.exe',
      ['--cookies', 'C:\\UserData\\cookies.txt', 'https://youtu.be/abc'],
      logger
    )
    child.stdout.write(JSON.stringify({ title: 'Video' }))
    child.emit('close', 0)

    await expect(resultPromise).resolves.toEqual({
      ok: true,
      stdout: JSON.stringify({ title: 'Video' })
    })
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('--cookies [cookies-file] https://youtu.be/abc')
    )
    expect(logger.info).not.toHaveBeenCalledWith(expect.stringContaining('cookies.txt'))
  })
})

describe('runYtDlpDownload', () => {
  it('emits download progress from stderr output', async () => {
    const child = createFakeChildProcess()
    const onProgress = vi.fn()
    vi.mocked(spawn).mockReturnValue(child as never)

    const resultPromise = runYtDlpDownload('yt-dlp.exe', ['--newline'], 'mp4', onProgress)
    child.stderr.write('[download]  42.5% of 10.00MiB at 1.23MiB/s ETA 00:04\r')
    child.emit('close', 0)

    await expect(resultPromise).resolves.toEqual({ ok: true, filePath: undefined })
    expect(onProgress).toHaveBeenCalledWith({
      status: 'downloading',
      step: 'downloading-file',
      percent: 42.5,
      speed: '1.23MiB/s',
      eta: '00:04'
    })
  })

  it('emits processing steps from stderr output', async () => {
    const child = createFakeChildProcess()
    const onProgress = vi.fn()
    vi.mocked(spawn).mockReturnValue(child as never)

    const resultPromise = runYtDlpDownload('yt-dlp.exe', ['--newline'], 'mp3', onProgress)
    child.stderr.write('[ExtractAudio] Destination: file.mp3\n[Merger] Merging formats into file.mp4\n')
    child.emit('close', 0)

    await expect(resultPromise).resolves.toEqual({ ok: true, filePath: undefined })
    expect(onProgress).toHaveBeenCalledWith({
      status: 'processing',
      step: 'converting',
      message: 'Convirtiendo audio...'
    })
    expect(onProgress).toHaveBeenCalledWith({
      status: 'processing',
      step: 'merging',
      message: 'Unificando archivo...'
    })
  })

  it('extracts the final file path from stderr output', async () => {
    const child = createFakeChildProcess()
    vi.mocked(spawn).mockReturnValue(child as never)

    const resultPromise = runYtDlpDownload('yt-dlp.exe', ['--newline'], 'mp3', vi.fn())
    child.stderr.write('C:\\Downloads\\WhoDownloads\\song.mp3\n')
    child.emit('close', 0)

    await expect(resultPromise).resolves.toEqual({
      ok: true,
      filePath: 'C:\\Downloads\\WhoDownloads\\song.mp3'
    })
  })
})
