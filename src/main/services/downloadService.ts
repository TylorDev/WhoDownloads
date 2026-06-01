import type { App, WebContents } from 'electron'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import type { DownloadInput, DownloadProgress, DownloadResult, MetadataResult } from '../../shared/downloadTypes'
import { getYtDlpArgs } from './formatSelectors'
import { fetchVideoMetadata } from './metadataService'
import { runYtDlpDownload } from './ytdlpService'
import { getDownloadOutputDirectory, getWindowsBinaryPath } from '../utils/paths'
import { isYouTubeUrl } from '../utils/validation'

let activeDownload = false

function emitProgress(sender: WebContents, progress: DownloadProgress): void {
  sender.send('download-progress', progress)
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
  sender: WebContents
): Promise<DownloadResult> {
  const cleanUrl = input.url.trim()

  if (!cleanUrl) {
    return { ok: false, error: 'Pega una URL de YouTube primero.' }
  }

  if (!isYouTubeUrl(cleanUrl)) {
    return { ok: false, error: 'La URL debe ser de youtube.com o youtu.be.' }
  }

  if (activeDownload) {
    return { ok: false, error: 'Ya hay una descarga activa. Espera a que termine.' }
  }

  activeDownload = true
  emitProgress(sender, { status: 'starting', message: 'Preparando descarga...' })

  try {
    const outputDirectory = getDownloadOutputDirectory(app)
    await mkdir(outputDirectory, { recursive: true })

    const ytDlpPath = getWindowsBinaryPath(app, 'yt-dlp')
    const ffmpegPath = getWindowsBinaryPath(app, 'ffmpeg')
    const outputTemplate = join(outputDirectory, '%(title).180B [%(id)s].%(ext)s')
    const args = getYtDlpArgs(input, ffmpegPath, outputTemplate)
    const result = await runYtDlpDownload(ytDlpPath, args, input.format, (progress) => {
      emitProgress(sender, progress)
    })

    if (result.ok) {
      emitProgress(sender, {
        status: 'completed',
        percent: 100,
        message: result.filePath ? `Descargado: ${result.filePath}` : 'Descarga completada.'
      })

      return { ok: true, filePath: result.filePath }
    }

    const message = getDownloadFailureMessage(input, result.stderr, result.error)
    emitProgress(sender, { status: 'failed', message })

    return { ok: false, error: message }
  } finally {
    activeDownload = false
  }
}
