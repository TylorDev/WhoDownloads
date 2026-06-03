import type { PlaylistEntry, PlaylistResult } from '../../shared/downloadTypes'
import { runYtDlpForJson } from './ytdlpService'
import { isDetailedLoggingEnabled } from '../utils/cliArgs'

function getStringField(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function getNumberField(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function buildVideoUrl(idOrUrl: string): string {
  if (idOrUrl.startsWith('http')) {
    return idOrUrl
  }

  return `https://www.youtube.com/watch?v=${idOrUrl}`
}

export function mapPlaylistEntries(rawJson: string): PlaylistResult {
  try {
    const data = JSON.parse(rawJson) as Record<string, unknown>
    const title = getStringField(data.title) || 'Playlist sin título'
    const rawEntries = Array.isArray(data.entries)
      ? (data.entries as Array<Record<string, unknown>>)
      : []

    const entries: PlaylistEntry[] = rawEntries
      .filter((entry) => getStringField(entry.id) || getStringField(entry.url))
      .map((entry) => {
        const id = getStringField(entry.id)
        const url = getStringField(entry.url)

        return {
          id: id || url,
          title: getStringField(entry.title) || 'Sin título',
          url: buildVideoUrl(id || url),
          duration: getNumberField(entry.duration)
        }
      })

    return { ok: true, title, entries }
  } catch {
    return { ok: false, error: 'No se pudo leer la información de la playlist.' }
  }
}

export async function fetchPlaylistEntries(
  ytDlpPath: string,
  playlistUrl: string,
  authArgs: string[] = []
): Promise<PlaylistResult> {
  if (isDetailedLoggingEnabled()) {
    console.info(
      `[playlist:start] ${JSON.stringify({
        url: playlistUrl,
        ytDlpPath,
        usesCookies: authArgs.includes('--cookies')
      })}`
    )
  }

  const result = await runYtDlpForJson(ytDlpPath, [
    '--flat-playlist',
    '--dump-single-json',
    '--no-warnings',
    ...authArgs,
    playlistUrl
  ], isDetailedLoggingEnabled()
    ? {
        prefix: 'playlist',
        info: (message) => console.info(message),
        warn: (message) => console.warn(message),
        error: (message) => console.error(message)
      }
    : undefined)

  if (!result.ok) {
    if (isDetailedLoggingEnabled()) {
      console.error(`[playlist:failed] ${result.error}`)
    }

    return result
  }

  const mapped = mapPlaylistEntries(result.stdout)
  if (isDetailedLoggingEnabled()) {
    console.info(
      `[playlist:result] ${JSON.stringify({
        ok: mapped.ok,
        entries: mapped.ok ? mapped.entries.length : undefined
      })}`
    )
  }

  return mapped
}
