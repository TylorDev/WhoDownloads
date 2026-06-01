import { describe, expect, it } from 'vitest'
import { getVideoLinkUrlFromContextMenuTarget } from './youtubeLinkExtractor'

type MockNodeOptions = {
  href?: string
  attributes?: Record<string, string>
  closestNode?: EventTarget | null
}

function createMockNode({ href, attributes = {}, closestNode = null }: MockNodeOptions): EventTarget {
  return {
    href,
    getAttribute: (name: string) => attributes[name] ?? null,
    closest: () => closestNode
  } as unknown as EventTarget
}

describe('getVideoLinkUrlFromContextMenuTarget', () => {
  it('extracts watch URLs with playlist params from a direct anchor', () => {
    const url =
      'https://www.youtube.com/watch?v=oFjah8VWR9s&list=RDIBvf7KUEZ78&index=8&pp=8AUB'
    const anchor = createMockNode({ href: url })

    expect(getVideoLinkUrlFromContextMenuTarget(anchor)).toBe(url)
  })

  it('extracts a video URL when the anchor appears in composedPath', () => {
    const anchor = createMockNode({
      href: 'https://www.youtube.com/watch?v=dvQJIgjlR3I&list=RDIBvf7KUEZ78&index=3'
    })
    const target = createMockNode({})

    expect(getVideoLinkUrlFromContextMenuTarget(target, [target, anchor])).toBe(
      'https://www.youtube.com/watch?v=dvQJIgjlR3I&list=RDIBvf7KUEZ78&index=3'
    )
  })

  it('builds a watch URL from data-video-id', () => {
    const node = createMockNode({ attributes: { 'data-video-id': 'E-LiWZBDdho' } })

    expect(getVideoLinkUrlFromContextMenuTarget(node)).toBe(
      'https://www.youtube.com/watch?v=E-LiWZBDdho'
    )
  })

  it('ignores non-video links', () => {
    const anchor = createMockNode({ href: 'https://www.youtube.com/@channel' })

    expect(getVideoLinkUrlFromContextMenuTarget(anchor)).toBe('')
  })
})
