type LinkLikeNode = {
  href?: unknown
  getAttribute?: (name: string) => string | null
  closest?: (selector: string) => LinkLikeNode | null
  querySelector?: (selector: string) => LinkLikeNode | null
}

type ContextMenuLikeEvent = {
  target: EventTarget | null
  clientX?: number
  clientY?: number
  composedPath?: () => EventTarget[]
}

type ElementLookup = {
  elementFromPoint?: (x: number, y: number) => Element | null
}

const videoContainerSelector = [
  'a[href]',
  'ytd-video-renderer',
  'ytd-rich-item-renderer',
  'ytd-grid-video-renderer',
  'ytd-compact-video-renderer',
  'ytd-playlist-video-renderer',
  'ytd-reel-item-renderer',
  'ytd-rich-grid-media',
  'ytd-compact-link-renderer'
].join(', ')

const watchLinkSelector = [
  'a[href*="/watch"]',
  'a[href^="/watch"]',
  'a#thumbnail[href]',
  'a#video-title[href]'
].join(', ')

function getYouTubeWatchUrl(value: string): string {
  try {
    const parsed = new URL(value, 'https://www.youtube.com')
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '')

    const isWatchUrl =
      (host === 'youtube.com' || host.endsWith('.youtube.com')) &&
      parsed.pathname === '/watch' &&
      Boolean(parsed.searchParams.get('v'))

    return isWatchUrl ? parsed.href : ''
  } catch {
    return ''
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
  const watchHref = href ? getYouTubeWatchUrl(href) : ''

  if (watchHref) {
    return watchHref
  }

  const dataUrl = readAttribute(node, 'data-url')
  const watchDataUrl = dataUrl ? getYouTubeWatchUrl(dataUrl) : ''

  if (watchDataUrl) {
    return watchDataUrl
  }

  const videoId = readAttribute(node, 'data-video-id')

  if (videoId) {
    return buildYouTubeWatchUrlFromVideoId(videoId)
  }

  const contextItemId = readAttribute(node, 'data-context-item-id')

  return contextItemId ? buildYouTubeWatchUrlFromVideoId(contextItemId) : ''
}

function getClosestAnchorUrl(target: EventTarget | LinkLikeNode | null): string {
  if (!target || typeof target !== 'object' || !('closest' in target)) {
    return ''
  }

  const link = target.closest?.('a[href]')
  return getUrlFromNode(link ?? null)
}

function getDescendantAnchorUrl(target: EventTarget | LinkLikeNode | null): string {
  if (!target || typeof target !== 'object' || !('querySelector' in target)) {
    return ''
  }

  const link = target.querySelector?.(watchLinkSelector)
  return getUrlFromNode(link ?? null)
}

function getClosestVideoContainerUrl(target: EventTarget | LinkLikeNode | null): string {
  if (!target || typeof target !== 'object' || !('closest' in target)) {
    return ''
  }

  const container = target.closest?.(videoContainerSelector)
  return (
    getUrlFromNode(container ?? null) ||
    getClosestAnchorUrl(container ?? null) ||
    getDescendantAnchorUrl(container ?? null)
  )
}

function getUrlFromCandidate(target: EventTarget | LinkLikeNode | null): string {
  return (
    getUrlFromNode(target) ||
    getClosestAnchorUrl(target) ||
    getDescendantAnchorUrl(target) ||
    getClosestVideoContainerUrl(target)
  )
}

export function getVideoLinkUrlFromContextMenuTarget(
  target: EventTarget | null,
  composedPath: EventTarget[] = [],
  pointTarget: EventTarget | null = null
): string {
  const directUrl = getUrlFromCandidate(target)

  if (directUrl) {
    return directUrl
  }

  for (const pathNode of composedPath) {
    const pathNodeUrl = getUrlFromCandidate(pathNode)

    if (pathNodeUrl) {
      return pathNodeUrl
    }
  }

  return getUrlFromCandidate(pointTarget)
}

export function getVideoLinkUrlFromContextMenuEvent(
  event: ContextMenuLikeEvent,
  documentLike: ElementLookup = document
): string {
  const composedPath = event.composedPath?.() ?? []
  const pointTarget =
    typeof event.clientX === 'number' && typeof event.clientY === 'number'
      ? documentLike.elementFromPoint?.(event.clientX, event.clientY) ?? null
      : null

  return getVideoLinkUrlFromContextMenuTarget(event.target, composedPath, pointTarget)
}
