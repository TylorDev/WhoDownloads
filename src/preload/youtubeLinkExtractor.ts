type LinkLikeNode = {
  href?: unknown
  getAttribute?: (name: string) => string | null
  closest?: (selector: string) => LinkLikeNode | null
}

function isYouTubeWatchUrl(value: string): boolean {
  try {
    const parsed = new URL(value, 'https://www.youtube.com')
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '')

    return (
      (host === 'youtube.com' || host.endsWith('.youtube.com')) &&
      parsed.pathname === '/watch' &&
      Boolean(parsed.searchParams.get('v'))
    )
  } catch {
    return false
  }
}

function buildYouTubeWatchUrlFromVideoId(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}

function readAttribute(node: EventTarget | LinkLikeNode | null, attributeName: string): string {
  if (!node || typeof node !== 'object' || !('getAttribute' in node)) {
    return ''
  }

  const value = node.getAttribute?.(attributeName)
  return typeof value === 'string' ? value : ''
}

function readHref(node: EventTarget | LinkLikeNode | null): string {
  if (!node || typeof node !== 'object') {
    return ''
  }

  if ('href' in node && typeof node.href === 'string') {
    return node.href
  }

  return readAttribute(node, 'href')
}

function getUrlFromNode(node: EventTarget | LinkLikeNode | null): string {
  const href = readHref(node)

  if (href && isYouTubeWatchUrl(href)) {
    return href
  }

  const dataUrl = readAttribute(node, 'data-url')

  if (dataUrl && isYouTubeWatchUrl(dataUrl)) {
    return dataUrl
  }

  const videoId = readAttribute(node, 'data-video-id')

  return videoId ? buildYouTubeWatchUrlFromVideoId(videoId) : ''
}

function getClosestAnchorUrl(target: EventTarget | LinkLikeNode | null): string {
  if (!target || typeof target !== 'object' || !('closest' in target)) {
    return ''
  }

  const link = target.closest?.('a[href]')
  return getUrlFromNode(link ?? null)
}

export function getVideoLinkUrlFromContextMenuTarget(
  target: EventTarget | null,
  composedPath: EventTarget[] = []
): string {
  const directUrl = getUrlFromNode(target)

  if (directUrl) {
    return directUrl
  }

  const closestUrl = getClosestAnchorUrl(target)

  if (closestUrl) {
    return closestUrl
  }

  for (const pathNode of composedPath) {
    const pathNodeUrl = getUrlFromNode(pathNode) || getClosestAnchorUrl(pathNode)

    if (pathNodeUrl) {
      return pathNodeUrl
    }
  }

  return ''
}
