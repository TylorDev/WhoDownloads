import { describe, expect, it } from 'vitest'
import { getMp3AudioQuality, getMp4FormatSelector, getYtDlpArgs } from './formatSelectors'

describe('getMp4FormatSelector', () => {
  it('uses H.264/AAC compatible MP4 filters for auto quality', () => {
    const selector = getMp4FormatSelector('auto')

    expect(selector).toContain('[vcodec^=avc1]')
    expect(selector).toContain('[acodec^=mp4a]')
    expect(selector).not.toContain('av01')
  })

  it('limits MP4 video height for explicit quality', () => {
    expect(getMp4FormatSelector('720')).toContain('[height<=720]')
  })
})

describe('getMp3AudioQuality', () => {
  it('maps auto to best VBR and bitrates to ffmpeg bitrate strings', () => {
    expect(getMp3AudioQuality('auto')).toBe('0')
    expect(getMp3AudioQuality('320')).toBe('320K')
    expect(getMp3AudioQuality('192')).toBe('192K')
    expect(getMp3AudioQuality('128')).toBe('128K')
  })
})

describe('getYtDlpArgs', () => {
  it('builds MP4 args without MP3 post-processing', () => {
    const args = getYtDlpArgs(
      { url: ' https://youtu.be/video ', format: 'mp4', quality: '1080' },
      'C:\\bin\\ffmpeg.exe',
      'C:\\out\\%(title)s.%(ext)s'
    )

    expect(args).toContain('--merge-output-format')
    expect(args).toContain('mp4')
    expect(args).toContain('--embed-metadata')
    expect(args.join(' ')).toContain('[height<=1080]')
    expect(args.join(' ')).toContain('meta_album')
    expect(args).not.toContain('--extract-audio')
    expect(args.at(-1)).toBe('https://youtu.be/video')
  })

  it('builds MP3 args with audio extraction, quality, cover, and metadata tags', () => {
    const args = getYtDlpArgs(
      { url: 'https://youtu.be/song', format: 'mp3', quality: '320' },
      'C:\\bin\\ffmpeg.exe',
      'C:\\out\\%(title)s.%(ext)s'
    )
    const joined = args.join(' ')

    expect(args).toContain('--extract-audio')
    expect(args).toContain('--audio-format')
    expect(args).toContain('mp3')
    expect(args).toContain('--audio-quality')
    expect(args).toContain('320K')
    expect(args).toContain('--embed-thumbnail')
    expect(args).toContain('--embed-metadata')
    expect(joined).toContain('meta_artist')
    expect(joined).toContain('meta_album')
    expect(joined).toContain('-metadata album=%(webpage_url)s')
    expect(joined).toContain('meta_album_artist')
    expect(joined).toContain('meta_author')
    expect(joined).toContain('WOAR')
  })
})
