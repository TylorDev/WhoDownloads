export function normalizeYouTubeVideoUrl(value: string): string | null {
  try {
    const parsed = new URL(value)
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '')

    if (host === 'youtu.be') {
      const videoId = parsed.pathname.split('/').filter(Boolean)[0]

      return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null
    }

    if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      const videoId = parsed.searchParams.get('v')

      return parsed.pathname === '/watch' && videoId
        ? `https://www.youtube.com/watch?v=${videoId}`
        : null
    }

    return null
  } catch {
    return null
  }
}

export function looksLikeYouTubeUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '')

    return host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtu.be'
  } catch {
    return false
  }
}

export function looksLikeYouTubePlaylistUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '')

    if (host !== 'youtube.com' && !host.endsWith('.youtube.com')) {
      return false
    }

    return Boolean(parsed.searchParams.get('list')) || parsed.searchParams.get('radio') === '1'
  } catch {
    return false
  }
}

export type YouTubeUrlKind = 'video' | 'playlist'

export function classifyYouTubeUrl(value: string): YouTubeUrlKind | null {
  if (looksLikeYouTubePlaylistUrl(value)) {
    return 'playlist'
  }

  if (normalizeYouTubeVideoUrl(value)) {
    return 'video'
  }

  return null
}
