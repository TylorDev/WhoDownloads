import { describe, expect, it } from 'vitest'
import { normalizeYouTubeVideoUrl } from './youtubeUrl'

describe('normalizeYouTubeVideoUrl', () => {
  it('normalizes standard YouTube watch URLs and removes extra params', () => {
    expect(normalizeYouTubeVideoUrl('https://www.youtube.com/watch?v=abc123&list=playlist&t=30')).toBe(
      'https://www.youtube.com/watch?v=abc123'
    )
  })

  it('normalizes youtu.be URLs', () => {
    expect(normalizeYouTubeVideoUrl('https://youtu.be/abc123?si=share')).toBe(
      'https://www.youtube.com/watch?v=abc123'
    )
  })

  it('ignores shorts, channels, and non-YouTube URLs', () => {
    expect(normalizeYouTubeVideoUrl('https://www.youtube.com/shorts/abc123')).toBeNull()
    expect(normalizeYouTubeVideoUrl('https://www.youtube.com/@channel')).toBeNull()
    expect(normalizeYouTubeVideoUrl('https://example.com/watch?v=abc123')).toBeNull()
  })
})
