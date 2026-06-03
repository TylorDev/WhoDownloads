import type { App, WebContents } from 'electron'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import type {
  AppSettings,
  DownloadInput,
  DownloadProgress,
  DownloadResult,
  MetadataResult
} from '../../shared/downloadTypes'
import { getYtDlpArgs } from './formatSelectors'
import { fetchVideoMetadata } from './metadataService'
import { runYtDlpDownload, type YtDlpDownloadLogger } from './ytdlpService'
import { getYtDlpCookieArgs } from './youtubeCookies'
import { getDownloadOutputDirectory, getWindowsBinaryPath } from '../utils/paths'
import { isYouTubeUrl } from '../utils/validation'

const MAX_PARALLEL_DOWNLOADS = 4
let activeDownloads = 0

const downloadLogger: YtDlpDownloadLogger = {
  info: (message) => console.info(message),
  warn: (message) => console.warn(message),
  error: (message) => console.error(message)
}

function emitProgress(sender: WebContents, progress: DownloadProgress): void {
  sender.send('download-progress', progress)
}

function withTaskId(input: DownloadInput, progress: DownloadProgress): DownloadProgress {
  return input.taskId ? { ...progress, taskId: input.taskId } : progress
}

function getDownloadFailureMessage(input: DownloadInput, stderr: string, fallbackError?: string): string {
  const formatUnavailable = /Requested format is not available|No video formats found/i.test(stderr)
  const needsSession = /sign in to confirm you.?re not a bot/i.test(stderr)
  const ffmpegFailure = /ffmpeg|Postprocessing|Conversion failed|Error re-encoding/i.test(stderr)

  if (needsSession) {
    return 'YouTube pide verificar la sesion. Abre YouTube dentro de la app, inicia sesion y vuelve a intentar.'
  }

  if (input.format === 'mp3') {
    return formatUnavailable ? 'No se pudo extraer audio MP3 para esta URL.' : fallbackError ?? ''
  }

  if (ffmpegFailure) {
    return 'No se pudo convertir el video a MP4 compatible H.264/AAC. Revisa los logs de ffmpeg en la consola.'
  }

  return formatUnavailable
    ? 'No se encontró un formato descargable para esta calidad. Se intentó MP4 H.264/AAC directo y fallback con conversión.'
    : fallbackError ?? ''
}

function getArgValue(args: string[], name: string): string | undefined {
  const index = args.indexOf(name)

  return index >= 0 ? args[index + 1] : undefined
}

function logDownloadStart(input: DownloadInput, args: string[], outputDirectory: string, authArgs: string[]): void {
  const selector = getArgValue(args, '-f') ?? 'unknown'
  const usesCookies = authArgs.includes('--cookies')
  const mode =
    input.format === 'mp4'
      ? 'prefers H.264/AAC, falls back to best available and converts to MP4 H.264/AAC'
      : 'extracts best audio and converts to MP3'

  console.info(
    `[download:start] ${JSON.stringify({
      taskId: input.taskId,
      url: input.url.trim(),
      format: input.format,
      quality: input.quality,
      outputDirectory,
      usesCookies,
      mode
    })}`
  )
  console.info(`[download:selector] ${selector}`)
}

export async function previewVideo(app: App, url: string): Promise<MetadataResult> {
  const cleanUrl = url.trim()

  if (!cleanUrl) {
    return { ok: false, error: 'Pega una URL de YouTube primero.' }
  }

  if (!isYouTubeUrl(cleanUrl)) {
    return { ok: false, error: 'La URL debe ser de youtube.com o youtu.be.' }
  }

  const authArgs = await getYtDlpCookieArgs(app)

  return fetchVideoMetadata(getWindowsBinaryPath(app, 'yt-dlp'), cleanUrl, authArgs)
}

export async function downloadVideo(
  app: App,
  input: DownloadInput,
  sender: WebContents,
  settings?: AppSettings
): Promise<DownloadResult> {
  const cleanUrl = input.url.trim()

  if (!cleanUrl) {
    return { ok: false, error: 'Pega una URL de YouTube primero.' }
  }

  if (!isYouTubeUrl(cleanUrl)) {
    return { ok: false, error: 'La URL debe ser de youtube.com o youtu.be.' }
  }

  if (activeDownloads >= MAX_PARALLEL_DOWNLOADS) {
    return { ok: false, error: 'Ya hay 4 descargas activas. Espera a que termine una.' }
  }

  activeDownloads += 1
  emitProgress(sender, withTaskId(input, { status: 'starting', message: 'Preparando descarga...' }))

  try {
    const outputDirectory = settings?.downloadDirectory || getDownloadOutputDirectory(app)
    await mkdir(outputDirectory, { recursive: true })

    const ytDlpPath = getWindowsBinaryPath(app, 'yt-dlp')
    const ffmpegPath = getWindowsBinaryPath(app, 'ffmpeg')
    const outputTemplate = join(outputDirectory, '%(title).180B.%(ext)s')
    const authArgs = await getYtDlpCookieArgs(app)
    const args = getYtDlpArgs({ ...input, url: cleanUrl } as DownloadInput, ffmpegPath, outputTemplate, authArgs)
    logDownloadStart({ ...input, url: cleanUrl } as DownloadInput, args, outputDirectory, authArgs)
    const result = await runYtDlpDownload(
      ytDlpPath,
      args,
      input.format,
      (progress) => {
        emitProgress(sender, withTaskId(input, progress))
      },
      downloadLogger
    )

    if (result.ok) {
      emitProgress(
        sender,
        withTaskId(input, {
          status: 'completed',
          percent: 100,
          filePath: result.filePath,
          message: result.filePath ? `Descargado: ${result.filePath}` : 'Descarga completada.'
        })
      )

      return { ok: true, filePath: result.filePath }
    }

    const message = getDownloadFailureMessage(input, result.stderr, result.error)
    console.error(
      `[download:failed] ${JSON.stringify({
        taskId: input.taskId,
        format: input.format,
        quality: input.quality,
        exitCode: result.exitCode,
        message
      })}`
    )
    emitProgress(sender, withTaskId(input, { status: 'failed', message }))

    return { ok: false, error: message }
  } finally {
    activeDownloads -= 1
  }
}
