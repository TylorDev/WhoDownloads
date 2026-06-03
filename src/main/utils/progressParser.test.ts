import { describe, expect, it } from 'vitest'
import { extractPrintedFilePath, parseProgressLine, splitProgressLines } from './progressParser'

describe('parseProgressLine', () => {
  it('parses percent, speed, and ETA from download output', () => {
    expect(parseProgressLine('[download]  42.5% of 10.00MiB at 1.23MiB/s ETA 00:04', 'mp4')).toEqual({
      status: 'downloading',
      step: 'downloading-file',
      percent: 42.5,
      speed: '1.23MiB/s',
      eta: '00:04'
    })
  })

  it('keeps download lines without percent as indeterminate progress messages', () => {
    expect(parseProgressLine('[download] Destination: video.mp4', 'mp4')).toEqual({
      status: 'downloading',
      step: 'downloading-file',
      message: 'Destination: video.mp4'
    })
  })

  it('reports merge processing as the merging step', () => {
    expect(parseProgressLine('[Merger] Merging formats into file.mp4', 'mp4')).toEqual({
      status: 'processing',
      step: 'merging',
      message: 'Unificando archivo...'
    })
  })

  it('reports audio and video conversion as the converting step', () => {
    expect(parseProgressLine('[ExtractAudio] Destination: file.mp3', 'mp3')).toEqual({
      status: 'processing',
      step: 'converting',
      message: 'Convirtiendo audio...'
    })
    expect(parseProgressLine('[VideoConvertor] Converting video from mp4 to mp4', 'mp4')).toEqual({
      status: 'processing',
      step: 'converting',
      message: 'Convirtiendo MP4...'
    })
  })

  it('reports thumbnail and cover work as the cover step', () => {
    expect(parseProgressLine('[download] Downloading thumbnail 1 ...', 'mp3')).toEqual({
      status: 'processing',
      step: 'downloading-cover',
      message: 'Descargando cover...'
    })
    expect(parseProgressLine('[ThumbnailsConvertor] Converting thumbnail "cover.webp" to jpg', 'mp3')).toEqual({
      status: 'processing',
      step: 'downloading-cover',
      message: 'Descargando cover...'
    })
  })

  it('ignores unrelated lines', () => {
    expect(parseProgressLine('[info] Testing only', 'mp4')).toBeNull()
  })
})

describe('splitProgressLines', () => {
  it('splits yt-dlp progress chunks that use carriage returns', () => {
    expect(
      splitProgressLines(
        '[download]  10.0% of 10.00MiB at 1.00MiB/s ETA 00:09\r[download]  42.5% of 10.00MiB at 1.23MiB/s ETA 00:04\r'
      )
    ).toEqual([
      '[download]  10.0% of 10.00MiB at 1.00MiB/s ETA 00:09',
      '[download]  42.5% of 10.00MiB at 1.23MiB/s ETA 00:04'
    ])
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
