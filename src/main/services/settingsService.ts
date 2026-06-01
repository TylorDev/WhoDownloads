import type { App } from 'electron'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import type {
  AppSettings,
  DownloadFormat,
  DownloadQuality,
  Mp3Quality,
  Mp4Quality
} from '../../shared/downloadTypes'
import { getDownloadOutputDirectory, getSettingsFilePath } from '../utils/paths'

const MP4_QUALITIES = ['auto', '1080', '720', '480'] as const
const MP3_QUALITIES = ['auto', '320', '192', '128'] as const

export function getDefaultSettings(app: App): AppSettings {
  return {
    downloadDirectory: getDownloadOutputDirectory(app),
    defaultFormat: 'mp4',
    defaultQuality: 'auto',
    quickDownloadConfigured: false
  }
}

export function isValidQualityForFormat(
  format: DownloadFormat,
  quality: DownloadQuality
): quality is Mp4Quality | Mp3Quality {
  return format === 'mp4'
    ? (MP4_QUALITIES as readonly string[]).includes(quality)
    : (MP3_QUALITIES as readonly string[]).includes(quality)
}

export function sanitizeSettings(app: App, value: unknown): AppSettings {
  const defaults = getDefaultSettings(app)

  if (!value || typeof value !== 'object') {
    return defaults
  }

  const settings = value as Record<string, unknown>
  const defaultFormat = settings.defaultFormat === 'mp3' ? 'mp3' : 'mp4'
  const rawQuality =
    typeof settings.defaultQuality === 'string' ? settings.defaultQuality : defaults.defaultQuality
  const defaultQuality = isValidQualityForFormat(defaultFormat, rawQuality as DownloadQuality)
    ? (rawQuality as DownloadQuality)
    : 'auto'
  const downloadDirectory =
    typeof settings.downloadDirectory === 'string' && settings.downloadDirectory.trim()
      ? settings.downloadDirectory.trim()
      : defaults.downloadDirectory

  return {
    downloadDirectory,
    defaultFormat,
    defaultQuality,
    quickDownloadConfigured: settings.quickDownloadConfigured === true
  }
}

export async function loadSettings(app: App): Promise<AppSettings> {
  try {
    const rawSettings = await readFile(getSettingsFilePath(app), 'utf8')
    return sanitizeSettings(app, JSON.parse(rawSettings))
  } catch {
    return getDefaultSettings(app)
  }
}

export async function saveSettings(app: App, value: unknown): Promise<AppSettings> {
  const settings = sanitizeSettings(app, value)
  const settingsPath = getSettingsFilePath(app)

  await mkdir(dirname(settingsPath), { recursive: true })
  await writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf8')

  return settings
}
