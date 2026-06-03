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

export type YtDlpJsonLogger = {
  prefix: string
  info: (message: string) => void
  warn: (message: string) => void
  error: (message: string) => void
}

export type YtDlpJsonOptions = {
  timeoutMs?: number
  signal?: AbortSignal
  maxStdoutBytes?: number
}

type YtDlpCommandOutput = {
  stdout: string
  stderr: string
  exitCode?: number | null
}

const DEFAULT_JSON_STDOUT_LIMIT_BYTES = 8 * 1024 * 1024

function getSpawnErrorMessage(error: Error): string {
  return error.message.includes('ENOENT')
    ? 'No se encontro resources/bin/win/yt-dlp.exe. Agrega el binario y vuelve a intentar.'
    : error.message
}

function sanitizeArgsForLog(args: string[]): string[] {
  return args.map((arg, index) => (args[index - 1] === '--cookies' ? '[cookies-file]' : arg))
}

export function normalizeYtDlpErrorMessage(message: string): string {
  return /sign in to confirm you.?re not a bot/i.test(message)
    ? 'YouTube pide verificar la sesion. Abre YouTube dentro de la app, inicia sesion y vuelve a intentar.'
    : message
}

export function runYtDlpForJson(
  ytDlpPath: string,
  args: string[],
  logger?: YtDlpJsonLogger,
  options: YtDlpJsonOptions = {}
): Promise<YtDlpMetadataResult> {
  return new Promise<YtDlpMetadataResult>((resolve) => {
    const child = spawn(ytDlpPath, args, {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''
    let isResolved = false
    const maxStdoutBytes = options.maxStdoutBytes ?? DEFAULT_JSON_STDOUT_LIMIT_BYTES
    let timeout: NodeJS.Timeout | undefined

    function cleanup(): void {
      if (timeout) {
        clearTimeout(timeout)
      }
      options.signal?.removeEventListener('abort', handleAbort)
    }

    function killChild(): void {
      if (!child.killed) {
        child.kill()
      }
    }

    function resolveOnce(result: YtDlpMetadataResult): void {
      if (isResolved) {
        return
      }

      isResolved = true
      cleanup()
      resolve(result)
    }

    function handleAbort(): void {
      logger?.warn(`[${logger.prefix}:aborted] yt-dlp metadata request aborted`)
      resolveOnce({ ok: false, error: 'La preview fue cancelada porque se inicio otra solicitud.' })
      killChild()
    }

    logger?.info(`[${logger.prefix}:spawn] yt-dlp ${sanitizeArgsForLog(args).join(' ')}`)

    if (options.signal?.aborted) {
      handleAbort()
      return
    }

    options.signal?.addEventListener('abort', handleAbort, { once: true })

    if (options.timeoutMs && options.timeoutMs > 0) {
      timeout = setTimeout(() => {
        logger?.warn(`[${logger.prefix}:timeout] yt-dlp metadata exceeded ${options.timeoutMs}ms`)
        resolveOnce({
          ok: false,
          error: 'La preview tardo demasiado. Intenta otra vez o usa descarga rapida.'
        })
        killChild()
      }, options.timeoutMs)
    }

    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')

    child.stdout.on('data', (chunk: string) => {
      stdout += chunk
      if (Buffer.byteLength(stdout, 'utf8') > maxStdoutBytes) {
        logger?.warn(`[${logger.prefix}:stdout-limit] yt-dlp metadata stdout exceeded ${maxStdoutBytes} bytes`)
        resolveOnce({
          ok: false,
          error: 'La preview devolvio demasiados datos. Intenta con otra URL.'
        })
        killChild()
      }
    })

    child.stderr.on('data', (chunk: string) => {
      stderr += chunk
      for (const line of splitProgressLines(chunk)) {
        logger?.warn(`[${logger.prefix}:stderr] ${line}`)
      }
    })

    child.on('error', (error) => {
      const message = getSpawnErrorMessage(error)
      logger?.error(`[${logger.prefix}:spawn-error] ${message}`)
      resolveOnce({ ok: false, error: message })
    })

    child.on('close', (code) => {
      if (isResolved) {
        return
      }

      if (code === 0) {
        logger?.info(`[${logger.prefix}:exit] yt-dlp completed with code 0`)
        resolveOnce({ ok: true, stdout })
        return
      }

      const error = normalizeYtDlpErrorMessage(
        stderr.trim().split(/\r?\n/).at(-1) ??
          `yt-dlp termino con codigo ${code ?? 'desconocido'}.`
      )
      logger?.error(`[${logger.prefix}:exit] yt-dlp failed with code ${code ?? 'unknown'}: ${error}`)
      resolveOnce({
        ok: false,
        error
      })
    })
  })
}

function runYtDlpCommand(ytDlpPath: string, args: string[]): Promise<YtDlpCommandOutput> {
  return new Promise<YtDlpCommandOutput>((resolve) => {
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
      resolve({ stdout, stderr: stderr || getSpawnErrorMessage(error) })
    })

    child.on('close', (code) => {
      resolve({ stdout, stderr, exitCode: code })
    })
  })
}

function logCommandOutput(logger: YtDlpDownloadLogger, prefix: string, output: YtDlpCommandOutput): void {
  logger.info(`${prefix}:exitCode=${output.exitCode ?? 'unknown'}`)

  for (const line of splitProgressLines(output.stdout)) {
    logger.info(`${prefix}:stdout ${line}`)
  }

  for (const line of splitProgressLines(output.stderr)) {
    logger.warn(`${prefix}:stderr ${line}`)
  }
}

export async function runYtDlpDiagnostics(
  ytDlpPath: string,
  url: string,
  logger: YtDlpDownloadLogger,
  runtimeArgs: string[] = []
): Promise<void> {
  const version = await runYtDlpCommand(ytDlpPath, ['--version'])
  logCommandOutput(logger, '[download:yt-dlp-version]', version)

  const formats = await runYtDlpCommand(ytDlpPath, [
    ...runtimeArgs,
    '--no-playlist',
    '--list-formats',
    url
  ])
  logCommandOutput(logger, '[download:list-formats]', formats)
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

    function handleDownloadOutput(chunk: string): void {
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
    }

    child.stdout.on('data', handleDownloadOutput)

    child.stderr.on('data', (chunk: string) => {
      stderr += chunk
      for (const line of splitProgressLines(chunk)) {
        logger?.warn(`[download:stderr] ${line}`)
      }
      handleDownloadOutput(chunk)
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
