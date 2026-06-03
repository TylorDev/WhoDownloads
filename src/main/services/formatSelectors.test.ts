import { describe, expect, it } from 'vitest'
import {
  getMp3AudioQuality,
  getMp4FallbackFormatSelector,
  getMp4FormatSelector,
  getYtDlpArgs
} from './formatSelectors'

describe('getMp4FormatSelector', () => {
  it('uses H.264/AAC compatible MP4 filters for auto quality', () => {
    const selector = getMp4FormatSelector('auto')

    expect(selector).toContain('[vcodec^=avc1]')
    expect(selector).toContain('[acodec^=mp4a]')
    expect(selector).toContain('/bv*+ba/b')
    expect(selector).not.toContain('av01')
  })

  it('limits explicit MP4 quality while allowing the best lower available video', () => {
    const selector = getMp4FormatSelector('1080')

    expect(selector).toContain('[height<=1080]')
    expect(selector).toContain('/bv*[height<=1080]+ba/b[height<=1080]')
  })
})

describe('getMp4FallbackFormatSelector', () => {
  it('tries best available video and audio within explicit quality before general fallback', () => {
    const selector = getMp4FallbackFormatSelector('1080')

    expect(selector).toBe('bv*[height<=1080]+ba/b[height<=1080]/bv*+ba/b')
  })

  it('uses general best available formats for auto quality', () => {
    expect(getMp4FallbackFormatSelector('auto')).toBe('bv*+ba/b')
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
    expect(args).toContain('--recode-video')
    expect(args).toContain('--postprocessor-args')
    expect(args.join(' ')).toContain('libx264')
    expect(args.join(' ')).toContain('-c:a aac')
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

  it('includes auth args before the video URL', () => {
    const args = getYtDlpArgs(
      { url: 'https://youtu.be/private', format: 'mp4', quality: 'auto' },
      'C:\\bin\\ffmpeg.exe',
      'C:\\out\\%(title)s.%(ext)s',
      ['--cookies', 'C:\\UserData\\cookies.txt']
    )

    expect(args).toContain('--cookies')
    expect(args).toContain('C:\\UserData\\cookies.txt')
    expect(args.at(-1)).toBe('https://youtu.be/private')
  })

  it('can build MP4 args with the fallback selector', () => {
    const args = getYtDlpArgs(
      { url: 'https://youtu.be/video', format: 'mp4', quality: '1080' },
      'C:\\bin\\ffmpeg.exe',
      'C:\\out\\%(title)s.%(ext)s',
      [],
      { useMp4FallbackSelector: true }
    )

    expect(args[args.indexOf('-f') + 1]).toBe('bv*[height<=1080]+ba/b[height<=1080]/bv*+ba/b')
    expect(args).toContain('--recode-video')
  })
})
