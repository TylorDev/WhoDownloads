import { describe, expect, it } from 'vitest'
import { playlistEntriesToQueueVideos, urlsToQueueVideos } from './queueVideos'

describe('queueVideos helpers', () => {
  it('maps playlist entries to queue videos', () => {
    expect(
      playlistEntriesToQueueVideos([
        { id: '1', title: 'One', url: 'https://youtu.be/1', duration: 10 }
      ])
    ).toEqual([{ id: '1', title: 'One', url: 'https://youtu.be/1', duration: 10 }])
  })

  it('dedupes URL lists preserving order', () => {
    expect(urlsToQueueVideos(['https://youtu.be/1', 'https://youtu.be/2', 'https://youtu.be/1'])).toEqual([
      { id: 'https://youtu.be/1', title: 'https://youtu.be/1', url: 'https://youtu.be/1' },
      { id: 'https://youtu.be/2', title: 'https://youtu.be/2', url: 'https://youtu.be/2' }
    ])
  })
})
