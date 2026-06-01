import { describe, expect, it } from 'vitest'
import { mapMetadataPreview } from './metadataService'

describe('mapMetadataPreview', () => {
  it('maps yt-dlp JSON into preview metadata', () => {
    const result = mapMetadataPreview(
      JSON.stringify({
        title: 'Song title',
        uploader: 'Channel name',
        upload_date: '20240517',
        webpage_url: 'https://www.youtube.com/watch?v=abc',
        thumbnail: 'https://i.ytimg.com/vi/abc/maxresdefault.jpg',
        duration: 185
      }),
      'https://youtu.be/abc'
    )

    expect(result).toEqual({
      ok: true,
      metadata: {
        title: 'Song title',
        artist: 'Channel name',
        year: '2024',
        authorUrl: 'https://www.youtube.com/watch?v=abc',
        thumbnailUrl: 'https://i.ytimg.com/vi/abc/maxresdefault.jpg',
        duration: 185,
        url: 'https://www.youtube.com/watch?v=abc'
      }
    })
  })

  it('falls back to channel, fallback URL, and latest thumbnail from the list', () => {
    const result = mapMetadataPreview(
      JSON.stringify({
        title: 'Fallback song',
        channel: 'Fallback channel',
        thumbnails: [{ url: 'small.jpg' }, { url: 'large.jpg' }]
      }),
      'https://youtu.be/fallback'
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.metadata.artist).toBe('Fallback channel')
      expect(result.metadata.year).toBe('')
      expect(result.metadata.authorUrl).toBe('https://youtu.be/fallback')
      expect(result.metadata.thumbnailUrl).toBe('large.jpg')
    }
  })

  it('returns an error for invalid JSON', () => {
    expect(mapMetadataPreview('{bad json', 'https://youtu.be/abc')).toEqual({
      ok: false,
      error: 'No se pudo leer la metadata del video.'
    })
  })
})
