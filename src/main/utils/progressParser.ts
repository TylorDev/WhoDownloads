import type { DownloadFormat, DownloadProgress } from '../../shared/downloadTypes'

export function splitProgressLines(chunk: string): string[] {
  return chunk.split(/\r?\n|\r/).filter((line) => line.trim().length > 0)
}

export function parseProgressLine(line: string, format: DownloadFormat): DownloadProgress | null {
  if (/\[Merger\]/i.test(line)) {
    return {
      status: 'processing',
      step: 'merging',
      message: 'Unificando archivo...'
    }
  }

  if (/thumbnail|cover|EmbedThumbnail|ThumbnailsConvertor/i.test(line)) {
    return {
      status: 'processing',
      step: 'downloading-cover',
      message: 'Descargando cover...'
    }
  }

  if (/\[ExtractAudio\]|\[VideoConvertor\]|recode|converting|conversion/i.test(line)) {
    return {
      status: 'processing',
      step: 'converting',
      message: format === 'mp3' ? 'Convirtiendo audio...' : 'Convirtiendo MP4...'
    }
  }

  if (!line.includes('[download]')) {
    return null
  }

  const percentMatch = line.match(/(\d+(?:\.\d+)?)%/)
  const speedMatch = line.match(/at\s+([^\s]+)/)
  const etaMatch = line.match(/ETA\s+([^\s]+)/)

  if (!percentMatch) {
    return { status: 'downloading', step: 'downloading-file', message: line.replace('[download]', '').trim() }
  }

  return {
    status: 'downloading',
    step: 'downloading-file',
    percent: Number(percentMatch[1]),
    speed: speedMatch?.[1],
    eta: etaMatch?.[1]
  }
}

export function extractPrintedFilePath(line: string): string | undefined {
  const trimmed = line.trim()

  if (/^[a-zA-Z]:\\.+\.(mp4|mp3)$/i.test(trimmed) || /^\\\\.+\.(mp4|mp3)$/i.test(trimmed)) {
    return trimmed
  }

  return undefined
}
