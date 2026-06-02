import { describe, expect, it } from 'vitest'
import {
  getVideoLinkUrlFromContextMenuEvent,
  getVideoLinkUrlFromContextMenuTarget
} from './youtubeLinkExtractor'

type MockNodeOptions = {
  href?: string
  attributes?: Record<string, string>
  closestNode?: EventTarget | null
  queryNode?: EventTarget | null
}

function createMockNode({
  href,
  attributes = {},
  closestNode = null,
  queryNode = null
}: MockNodeOptions): EventTarget {
  return {
    href,
    getAttribute: (name: string) => attributes[name] ?? null,
    closest: () => closestNode,
    querySelector: () => queryNode
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

  it('extracts a video URL from a deep child inside a video container', () => {
    const anchor = createMockNode({ href: '/watch?v=Tu72s5xLZ0Q' })
    const container = createMockNode({ queryNode: anchor })
    const child = createMockNode({ closestNode: container })

    expect(getVideoLinkUrlFromContextMenuTarget(child)).toBe(
      'https://www.youtube.com/watch?v=Tu72s5xLZ0Q'
    )
  })

  it('builds a watch URL from data-context-item-id', () => {
    const node = createMockNode({ attributes: { 'data-context-item-id': '9bZkp7q19f0' } })

    expect(getVideoLinkUrlFromContextMenuTarget(node)).toBe(
      'https://www.youtube.com/watch?v=9bZkp7q19f0'
    )
  })

  it('uses the element under the click point when target and composedPath do not resolve', () => {
    const pointTarget = createMockNode({ attributes: { 'data-video-id': 'aqz-KE-bpKQ' } })
    const event = {
      target: createMockNode({}),
      clientX: 120,
      clientY: 80,
      composedPath: () => []
    }
    const documentLike = {
      elementFromPoint: (x: number, y: number) => (x === 120 && y === 80 ? pointTarget : null)
    }

    expect(getVideoLinkUrlFromContextMenuEvent(event, documentLike)).toBe(
      'https://www.youtube.com/watch?v=aqz-KE-bpKQ'
    )
  })

  it('ignores non-video links', () => {
    const anchor = createMockNode({ href: 'https://www.youtube.com/@channel' })

    expect(getVideoLinkUrlFromContextMenuTarget(anchor)).toBe('')
  })
})
