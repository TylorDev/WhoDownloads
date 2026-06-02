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
import { runYtDlpDownload } from './ytdlpService'
import { getDownloadOutputDirectory, getWindowsBinaryPath } from '../utils/paths'
import { isYouTubeUrl } from '../utils/validation'

const MAX_PARALLEL_DOWNLOADS = 4
let activeDownloads = 0

function emitProgress(sender: WebContents, progress: DownloadProgress): void {
  sender.send('download-progress', progress)
}

function withTaskId(input: DownloadInput, progress: DownloadProgress): DownloadProgress {
  return input.taskId ? { ...progress, taskId: input.taskId } : progress
}

function getDownloadFailureMessage(input: DownloadInput, stderr: string, fallbackError?: string): string {
  const formatUnavailable = /Requested format is not available|No video formats found/i.test(stderr)

  if (input.format === 'mp3') {
    return formatUnavailable ? 'No se pudo extraer audio MP3 para esta URL.' : fallbackError ?? ''
  }

  return formatUnavailable
    ? 'No se encontró una versión MP4 compatible H.264/AAC para esta calidad.'
    : fallbackError ?? ''
}

export async function previewVideo(app: App, url: string): Promise<MetadataResult> {
  const cleanUrl = url.trim()

  if (!cleanUrl) {
    return { ok: false, error: 'Pega una URL de YouTube primero.' }
  }

  if (!isYouTubeUrl(cleanUrl)) {
    return { ok: false, error: 'La URL debe ser de youtube.com o youtu.be.' }
  }

  return fetchVideoMetadata(getWindowsBinaryPath(app, 'yt-dlp'), cleanUrl)
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
    const args = getYtDlpArgs(input, ffmpegPath, outputTemplate)
    const result = await runYtDlpDownload(ytDlpPath, args, input.format, (progress) => {
      emitProgress(sender, withTaskId(input, progress))
    })

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
    emitProgress(sender, withTaskId(input, { status: 'failed', message }))

    return { ok: false, error: message }
  } finally {
    activeDownloads -= 1
  }
}
