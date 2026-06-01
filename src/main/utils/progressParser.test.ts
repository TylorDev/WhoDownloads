import { describe, expect, it } from 'vitest'
import { extractPrintedFilePath, parseProgressLine } from './progressParser'

describe('parseProgressLine', () => {
  it('parses percent, speed, and ETA from download output', () => {
    expect(parseProgressLine('[download]  42.5% of 10.00MiB at 1.23MiB/s ETA 00:04', 'mp4')).toEqual({
      status: 'downloading',
      percent: 42.5,
      speed: '1.23MiB/s',
      eta: '00:04'
    })
  })

  it('reports processing messages by format', () => {
    expect(parseProgressLine('[Merger] Merging formats into file.mp4', 'mp4')).toEqual({
      status: 'processing',
      message: 'Procesando MP4...'
    })
    expect(parseProgressLine('[ExtractAudio] Destination: file.mp3', 'mp3')).toEqual({
      status: 'processing',
      message: 'Procesando audio...'
    })
  })

  it('ignores unrelated lines', () => {
    expect(parseProgressLine('[info] Testing only', 'mp4')).toBeNull()
  })
})

describe('extractPrintedFilePath', () => {
  it('extracts final mp4 and mp3 Windows paths', () => {
    expect(extractPrintedFilePath('C:\\Users\\Jimbo\\Downloads\\WhoDownloads\\video.mp4')).toBe(
      'C:\\Users\\Jimbo\\Downloads\\WhoDownloads\\video.mp4'
    )
    expect(extractPrintedFilePath('\\\\server\\share\\song.mp3')).toBe('\\\\server\\share\\song.mp3')
  })

  it('rejects unsupported extensions and non-path lines', () => {
    expect(extractPrintedFilePath('C:\\Users\\Jimbo\\Downloads\\WhoDownloads\\video.webm')).toBeUndefined()
    expect(extractPrintedFilePath('[download] 100%')).toBeUndefined()
  })
})
