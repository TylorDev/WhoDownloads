import type { DownloadInput } from '../../shared/downloadTypes'

export function isYouTubeUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '')

    return host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtu.be'
  } catch {
    return false
  }
}

export function isDownloadInput(value: unknown): value is DownloadInput {
  if (!value || typeof value !== 'object') {
    return false
  }

  const input = value as Record<string, unknown>
  const validMp4Quality = ['auto', '1080', '720', '480'].includes(String(input.quality))
  const validMp3Quality = ['auto', '320', '192', '128'].includes(String(input.quality))

  return (
    typeof input.url === 'string' &&
    ((input.format === 'mp4' && validMp4Quality) || (input.format === 'mp3' && validMp3Quality))
  )
}
