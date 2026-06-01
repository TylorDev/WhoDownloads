import { describe, expect, it } from 'vitest'
import { isDownloadInput, isYouTubeUrl } from './validation'

describe('isYouTubeUrl', () => {
  it('accepts youtube.com, subdomains, and youtu.be URLs', () => {
    expect(isYouTubeUrl('https://youtube.com/watch?v=abc')).toBe(true)
    expect(isYouTubeUrl('https://www.youtube.com/watch?v=abc')).toBe(true)
    expect(isYouTubeUrl('https://music.youtube.com/watch?v=abc')).toBe(true)
    expect(isYouTubeUrl('https://youtu.be/abc')).toBe(true)
  })

  it('rejects non-YouTube and malformed URLs', () => {
    expect(isYouTubeUrl('https://example.com/watch?v=abc')).toBe(false)
    expect(isYouTubeUrl('https://notyoutube.com/watch?v=abc')).toBe(false)
    expect(isYouTubeUrl('not a url')).toBe(false)
  })
})

describe('isDownloadInput', () => {
  it('accepts valid mp4 and mp3 download inputs', () => {
    expect(isDownloadInput({ url: 'https://youtu.be/abc', format: 'mp4', quality: '720' })).toBe(true)
    expect(isDownloadInput({ url: 'https://youtu.be/abc', format: 'mp3', quality: '192' })).toBe(true)
  })

  it('rejects mismatched format and quality combinations', () => {
    expect(isDownloadInput({ url: 'https://youtu.be/abc', format: 'mp4', quality: '320' })).toBe(false)
    expect(isDownloadInput({ url: 'https://youtu.be/abc', format: 'mp3', quality: '1080' })).toBe(false)
  })

  it('rejects invalid payload shapes', () => {
    expect(isDownloadInput(null)).toBe(false)
    expect(isDownloadInput({ format: 'mp4', quality: '720' })).toBe(false)
    expect(isDownloadInput({ url: 'https://youtu.be/abc', format: 'wav', quality: 'auto' })).toBe(false)
  })
})
