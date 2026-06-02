import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { App, Cookie } from 'electron'
import { writeFile } from 'node:fs/promises'
import {
  exportYouTubeWebviewCookies,
  getYtDlpCookieArgs,
  serializeCookiesForYtDlp,
  YOUTUBE_WEBVIEW_PARTITION
} from './youtubeCookies'
import { session } from 'electron'

vi.mock('electron', () => ({
  session: {
    fromPartition: vi.fn()
  }
}))

vi.mock('node:fs/promises', () => ({
  writeFile: vi.fn(() => Promise.resolve())
}))

function createCookie(overrides: Partial<Cookie>): Cookie {
  return {
    name: 'SID',
    value: 'token',
    domain: '.youtube.com',
    hostOnly: false,
    path: '/',
    secure: true,
    httpOnly: false,
    session: false,
    ...overrides
  } as Cookie
}

function createAppStub(): App {
  return {
    getPath: vi.fn(() => 'C:\\UserData')
  } as unknown as App
}

describe('serializeCookiesForYtDlp', () => {
  it('serializes standard and HttpOnly cookies in Netscape format', () => {
    const output = serializeCookiesForYtDlp([
      createCookie({ name: 'SID', value: 'abc', expirationDate: 1780000000 }),
      createCookie({
        name: 'HSID',
        value: 'def',
        domain: 'youtube.com',
        httpOnly: true,
        secure: false
      })
    ])

    expect(output).toContain('# Netscape HTTP Cookie File')
    expect(output).toContain('.youtube.com\tTRUE\t/\tTRUE\t1780000000\tSID\tabc')
    expect(output).toContain('#HttpOnly_youtube.com\tFALSE\t/\tFALSE\t0\tHSID\tdef')
  })

  it('omits invalid cookies without breaking the file', () => {
    const output = serializeCookiesForYtDlp([
      createCookie({ name: '', value: 'abc' }),
      createCookie({ domain: '', value: 'def' }),
      createCookie({ name: 'VALID', value: 'ok' })
    ])

    expect(output).not.toContain('\tabc')
    expect(output).not.toContain('\tdef')
    expect(output).toContain('\tVALID\tok')
  })
})

describe('exportYouTubeWebviewCookies', () => {
  beforeEach(() => {
    vi.mocked(writeFile).mockClear()
    vi.mocked(session.fromPartition).mockReset()
  })

  it('writes cookies from the embedded YouTube partition and returns the file path', async () => {
    vi.mocked(session.fromPartition).mockReturnValue({
      cookies: {
        get: vi.fn(() => Promise.resolve([createCookie({ name: 'SID', value: 'abc' })]))
      }
    } as unknown as Electron.Session)

    const path = await exportYouTubeWebviewCookies(createAppStub())

    expect(session.fromPartition).toHaveBeenCalledWith(YOUTUBE_WEBVIEW_PARTITION)
    expect(path).toBe('C:\\UserData\\yt-dlp-youtube-cookies.txt')
    expect(writeFile).toHaveBeenCalledWith(
      'C:\\UserData\\yt-dlp-youtube-cookies.txt',
      expect.stringContaining('\tSID\tabc'),
      'utf8'
    )
  })

  it('returns undefined and does not write a file when there are no useful cookies', async () => {
    vi.mocked(session.fromPartition).mockReturnValue({
      cookies: {
        get: vi.fn(() => Promise.resolve([createCookie({ domain: '' })]))
      }
    } as unknown as Electron.Session)

    await expect(exportYouTubeWebviewCookies(createAppStub())).resolves.toBeUndefined()
    expect(writeFile).not.toHaveBeenCalled()
  })

  it('returns yt-dlp cookie args when cookies were exported', async () => {
    vi.mocked(session.fromPartition).mockReturnValue({
      cookies: {
        get: vi.fn(() => Promise.resolve([createCookie({ name: 'SID', value: 'abc' })]))
      }
    } as unknown as Electron.Session)

    await expect(getYtDlpCookieArgs(createAppStub())).resolves.toEqual([
      '--cookies',
      'C:\\UserData\\yt-dlp-youtube-cookies.txt'
    ])
  })
})
