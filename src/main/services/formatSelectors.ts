import type { DownloadInput, Mp3Quality, Mp4Quality } from '../../shared/downloadTypes'

export function getMp4FormatSelector(quality: Mp4Quality): string {
  const heightFilter = quality === 'auto' ? '' : `[height<=${quality}]`
  const compatibleVideoFilter = `[ext=mp4][vcodec^=avc1]${heightFilter}`
  const audioFilter = '[ext=m4a][acodec^=mp4a]'
  const compatibleMuxedFilter = `[ext=mp4][vcodec^=avc1][acodec^=mp4a]${heightFilter}`
  const fallbackVideoFilter = `bv*${heightFilter}`
  const fallbackMuxedFilter = `b${heightFilter}`

  return `bv*${compatibleVideoFilter}+ba${audioFilter}/${compatibleMuxedFilter}/${fallbackVideoFilter}+ba/${fallbackMuxedFilter}`
}

export function getMp4FallbackFormatSelector(quality: Mp4Quality): string {
  const heightFilter = quality === 'auto' ? '' : `[height<=${quality}]`
  const limitedFallback = quality === 'auto' ? '' : `bv*${heightFilter}+ba/b${heightFilter}/`

  return `${limitedFallback}bv*+ba/b`
}

export function getMp3AudioQuality(quality: Mp3Quality): string {
  return quality === 'auto' ? '0' : `${quality}K`
}

export function getYtDlpArgs(
  input: DownloadInput,
  ffmpegPath: string,
  outputTemplate: string,
  authArgs: string[] = [],
  options: { useMp4FallbackSelector?: boolean; runtimeArgs?: string[] } = {}
): string[] {
  const commonArgs = [
    '--no-playlist',
    '--newline',
    '--windows-filenames',
    '--ffmpeg-location',
    ffmpegPath,
    ...(options.runtimeArgs ?? []),
    ...authArgs
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
      '%(webpage_url)s:%(meta_album)s',
      '--parse-metadata',
      '%(uploader)s:%(meta_author)s',
      '--parse-metadata',
      '%(title)s:%(meta_title)s',
      '--parse-metadata',
      '%(upload_date)s:%(meta_date)s',
      '--parse-metadata',
      '%(webpage_url)s:%(meta_purl)s',
      '--postprocessor-args',
      'ExtractAudio+ffmpeg_o:-metadata artist=%(uploader)s -metadata album=%(webpage_url)s -metadata album_artist=%(uploader)s -metadata author=%(uploader)s -metadata WOAR=%(webpage_url)s',
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
    options.useMp4FallbackSelector
      ? getMp4FallbackFormatSelector(input.quality)
      : getMp4FormatSelector(input.quality),
    '--merge-output-format',
    'mp4',
    '--recode-video',
    'mp4',
    '--postprocessor-args',
    'Merger+ffmpeg_o:-c:v libx264 -preset veryfast -crf 21 -c:a aac -b:a 192k -movflags +faststart',
    '--postprocessor-args',
    'VideoConvertor+ffmpeg_o:-c:v libx264 -preset veryfast -crf 21 -c:a aac -b:a 192k -movflags +faststart',
    '--embed-metadata',
    '--parse-metadata',
    '%(webpage_url)s:%(meta_album)s',
    '--print',
    'after_move:filepath',
    '-o',
    outputTemplate,
    input.url.trim()
  ]
}
