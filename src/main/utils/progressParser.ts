import type { DownloadFormat, DownloadProgress } from '../../shared/downloadTypes'

export function splitProgressLines(chunk: string): string[] {
  return chunk.split(/\r?\n|\r/).filter((line) => line.trim().length > 0)
}

export function parseProgressLine(line: string, format: DownloadFormat): DownloadProgress | null {
  if (line.includes('[Merger]') || line.includes('[ExtractAudio]')) {
    return {
      status: 'processing',
      message: format === 'mp3' ? 'Procesando audio...' : 'Procesando MP4...'
    }
  }

  if (!line.includes('[download]')) {
    return null
  }

  const percentMatch = line.match(/(\d+(?:\.\d+)?)%/)
  const speedMatch = line.match(/at\s+([^\s]+)/)
  const etaMatch = line.match(/ETA\s+([^\s]+)/)

  if (!percentMatch) {
    return { status: 'downloading', message: line.replace('[download]', '').trim() }
  }

  return {
    status: 'downloading',
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
