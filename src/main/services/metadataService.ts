import type { MetadataResult } from '../../shared/downloadTypes'
import { runYtDlpForJson, type YtDlpJsonOptions } from './ytdlpService'
import { isDetailedLoggingEnabled } from '../utils/cliArgs'

const PREVIEW_TIMEOUT_MS = 25_000

function getStringField(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function getNumberField(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

export function mapMetadataPreview(rawJson: string, fallbackUrl: string): MetadataResult {
  try {
    const data = JSON.parse(rawJson) as Record<string, unknown>
    const uploadDate = getStringField(data.upload_date)
    const thumbnails = Array.isArray(data.thumbnails)
      ? (data.thumbnails as Array<Record<string, unknown>>)
      : []
    const thumbnailFromList = thumbnails
      .map((thumbnail) => getStringField(thumbnail.url))
      .filter(Boolean)
      .at(-1)

    return {
      ok: true,
      metadata: {
        title: getStringField(data.title) || 'Sin título',
        artist: getStringField(data.uploader) || getStringField(data.channel) || 'Canal desconocido',
        year: uploadDate.slice(0, 4),
        authorUrl: getStringField(data.webpage_url) || fallbackUrl,
        thumbnailUrl: getStringField(data.thumbnail) || thumbnailFromList,
        duration: getNumberField(data.duration),
        url: getStringField(data.webpage_url) || fallbackUrl
      }
    }
  } catch {
    return { ok: false, error: 'No se pudo leer la metadata del video.' }
  }
}

export async function fetchVideoMetadata(
  ytDlpPath: string,
  cleanUrl: string,
  authArgs: string[] = [],
  runtimeArgs: string[] = [],
  options: YtDlpJsonOptions = {}
): Promise<MetadataResult> {
  if (isDetailedLoggingEnabled()) {
    console.info(
      `[preview:start] ${JSON.stringify({
        url: cleanUrl,
        ytDlpPath,
        jsRuntime: runtimeArgs.includes('--js-runtimes') ? runtimeArgs[runtimeArgs.indexOf('--js-runtimes') + 1] : undefined,
        usesCookies: authArgs.includes('--cookies')
      })}`
    )
  }

  const result = await runYtDlpForJson(
    ytDlpPath,
    [
      '--dump-single-json',
      '--skip-download',
      '--no-playlist',
      ...runtimeArgs,
      ...authArgs,
      cleanUrl
    ],
    isDetailedLoggingEnabled()
      ? {
          prefix: 'preview',
          info: (message) => console.info(message),
          warn: (message) => console.warn(message),
          error: (message) => console.error(message)
        }
      : undefined,
    {
      timeoutMs: PREVIEW_TIMEOUT_MS,
      ...options
    }
  )

  if (!result.ok) {
    if (isDetailedLoggingEnabled()) {
      console.error(`[preview:failed] ${result.error}`)
    }

    return result
  }

  const mapped = mapMetadataPreview(result.stdout, cleanUrl)
  if (isDetailedLoggingEnabled()) {
    console.info(`[preview:result] ${JSON.stringify({ ok: mapped.ok })}`)
  }

  return mapped
}
