import { describe, expect, it } from 'vitest'
import { classifyYouTubeUrl } from './youtubeUrl'

describe('classifyYouTubeUrl', () => {
  it('classifies individual YouTube video URLs', () => {
    expect(classifyYouTubeUrl('https://youtu.be/abc')).toBe('video')
    expect(classifyYouTubeUrl('https://www.youtube.com/watch?v=abc')).toBe('video')
  })

  it('normalizes watch URLs from playlist items to individual videos', async () => {
    const { normalizeYouTubeVideoUrl } = await import('./youtubeUrl')

    expect(
      normalizeYouTubeVideoUrl(
        'https://www.youtube.com/watch?v=oFjah8VWR9s&list=RDIBvf7KUEZ78&index=8&pp=8AUB'
      )
    ).toBe('https://www.youtube.com/watch?v=oFjah8VWR9s')
  })

  it('classifies playlist URLs', () => {
    expect(classifyYouTubeUrl('https://www.youtube.com/playlist?list=PLabc')).toBe('playlist')
  })

  it('classifies YouTube radio links as playlist URLs', () => {
    expect(classifyYouTubeUrl('https://www.youtube.com/watch?v=abc&radio=1')).toBe('playlist')
    expect(classifyYouTubeUrl('https://www.youtube.com/watch?v=abc&list=RDabc&radio=1')).toBe(
      'playlist'
    )
  })

  it('returns null for unsupported URLs', () => {
    expect(classifyYouTubeUrl('https://example.com/watch?v=abc')).toBeNull()
  })
})
