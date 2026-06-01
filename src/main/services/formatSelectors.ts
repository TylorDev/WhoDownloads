import type { DownloadInput, Mp3Quality, Mp4Quality } from '../../shared/downloadTypes'

export function getMp4FormatSelector(quality: Mp4Quality): string {
  const videoFilter =
    quality === 'auto'
      ? '[ext=mp4][vcodec^=avc1]'
      : `[ext=mp4][vcodec^=avc1][height<=${quality}]`
  const audioFilter = '[ext=m4a][acodec^=mp4a]'

  return `bv*${videoFilter}+ba${audioFilter}/b[ext=mp4][vcodec^=avc1][acodec^=mp4a]${
    quality === 'auto' ? '' : `[height<=${quality}]`
  }`
}

export function getMp3AudioQuality(quality: Mp3Quality): string {
  return quality === 'auto' ? '0' : `${quality}K`
}

export function getYtDlpArgs(input: DownloadInput, ffmpegPath: string, outputTemplate: string): string[] {
  const commonArgs = [
    '--no-playlist',
    '--newline',
    '--windows-filenames',
    '--ffmpeg-location',
    ffmpegPath
  ]

  if (input.format === 'mp3') {
    return [
      ...commonArgs,
      '-f',
      'ba/bestaudio',
      '--extract-audio',
      '--audio-format',
      'mp3',
      '--audio-quality',
      getMp3AudioQuality(input.quality),
      '--embed-thumbnail',
      '--convert-thumbnails',
      'jpg',
      '--embed-metadata',
      '--parse-metadata',
      '%(uploader)s:%(meta_artist)s',
      '--parse-metadata',
      '%(uploader)s:%(meta_album_artist)s',
      '--parse-metadata',
      '%(uploader)s:%(meta_author)s',
      '--parse-metadata',
      '%(title)s:%(meta_title)s',
      '--parse-metadata',
      '%(upload_date)s:%(meta_date)s',
      '--parse-metadata',
      '%(webpage_url)s:%(meta_purl)s',
      '--postprocessor-args',
      'ExtractAudio+ffmpeg_o:-metadata artist=%(uploader)s -metadata album_artist=%(uploader)s -metadata author=%(uploader)s -metadata WOAR=%(webpage_url)s',
      '--print',
      'after_move:filepath',
      '-o',
      outputTemplate,
      input.url.trim()
    ]
  }

  return [
    ...commonArgs,
    '-f',
    getMp4FormatSelector(input.quality),
    '--merge-output-format',
    'mp4',
    '--print',
    'after_move:filepath',
    '-o',
    outputTemplate,
    input.url.trim()
  ]
}
