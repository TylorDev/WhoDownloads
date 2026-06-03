import { spawn } from 'node:child_process'
import type { DownloadFormat, DownloadProgress } from '../../shared/downloadTypes'
import { extractPrintedFilePath, parseProgressLine, splitProgressLines } from '../utils/progressParser'

export type YtDlpMetadataResult =
  | { ok: true; stdout: string }
  | { ok: false; error: string }

export type YtDlpDownloadResult =
  | { ok: true; filePath?: string }
  | { ok: false; stderr: string; error?: string; exitCode?: number | null }

export type YtDlpDownloadLogger = {
  info: (message: string) => void
  warn: (message: string) => void
  error: (message: string) => void
}

function getSpawnErrorMessage(error: Error): string {
  return error.message.includes('ENOENT')
    ? 'No se encontro resources/bin/win/yt-dlp.exe. Agrega el binario y vuelve a intentar.'
    : error.message
}

export function normalizeYtDlpErrorMessage(message: string): string {
  return /sign in to confirm you.?re not a bot/i.test(message)
    ? 'YouTube pide verificar la sesion. Abre YouTube dentro de la app, inicia sesion y vuelve a intentar.'
    : message
}

export function runYtDlpForJson(ytDlpPath: string, args: string[]): Promise<YtDlpMetadataResult> {
  return new Promise<YtDlpMetadataResult>((resolve) => {
    const child = spawn(ytDlpPath, args, {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''

    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')

    child.stdout.on('data', (chunk: string) => {
      stdout += chunk
    })

    child.stderr.on('data', (chunk: string) => {
      stderr += chunk
    })

    child.on('error', (error) => {
      resolve({ ok: false, error: getSpawnErrorMessage(error) })
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ ok: true, stdout })
        return
      }

      resolve({
        ok: false,
        error: normalizeYtDlpErrorMessage(
          stderr.trim().split(/\r?\n/).at(-1) ??
            `yt-dlp termino con codigo ${code ?? 'desconocido'}.`
        )
      })
    })
  })
}

export function runYtDlpDownload(
  ytDlpPath: string,
  args: string[],
  format: DownloadFormat,
  onProgress: (progress: DownloadProgress) => void,
  logger?: YtDlpDownloadLogger
): Promise<YtDlpDownloadResult> {
  return new Promise<YtDlpDownloadResult>((resolve) => {
    const child = spawn(ytDlpPath, args, {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe']
    })

    let stderr = ''
    let filePath: string | undefined

    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')

    child.stdout.on('data', (chunk: string) => {
      for (const line of splitProgressLines(chunk)) {
        const printedPath = extractPrintedFilePath(line)
        if (printedPath) {
          filePath = printedPath
        }

        const progress = parseProgressLine(line, format)
        if (progress) {
          onProgress(progress)
        }
      }
    })

    child.stderr.on('data', (chunk: string) => {
      stderr += chunk
      for (const line of splitProgressLines(chunk)) {
        logger?.warn(`[download:stderr] ${line}`)
      }
    })

    child.on('error', (error) => {
      const message = getSpawnErrorMessage(error)
      logger?.error(`[download:spawn-error] ${message}`)
      resolve({ ok: false, stderr, error: message })
    })

    child.on('close', (code) => {
      if (code === 0) {
        logger?.info(`[download:exit] yt-dlp completed with code 0`)
        resolve({ ok: true, filePath })
        return
      }

      const error = normalizeYtDlpErrorMessage(
        stderr.trim().split(/\r?\n/).at(-1) ??
          `yt-dlp termino con codigo ${code ?? 'desconocido'}.`
      )
      logger?.error(`[download:exit] yt-dlp failed with code ${code ?? 'unknown'}: ${error}`)
      resolve({
        ok: false,
        exitCode: code,
        stderr,
        error
      })
    })
  })
}
