import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { App } from 'electron'
import { loadSettings, sanitizeSettings, saveSettings } from './settingsService'
import { readFile, writeFile } from 'node:fs/promises'

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn(() => Promise.resolve()),
  readFile: vi.fn(),
  writeFile: vi.fn(() => Promise.resolve())
}))

vi.mock('../utils/paths', () => ({
  getDownloadOutputDirectory: vi.fn(() => 'C:\\Downloads\\WhoDownloads'),
  getSettingsFilePath: vi.fn(() => 'C:\\UserData\\settings.json')
}))

function createAppStub(): App {
  return {} as App
}

describe('settingsService', () => {
  beforeEach(() => {
    vi.mocked(readFile).mockReset()
    vi.mocked(writeFile).mockClear()
  })

  it('sanitizes invalid settings with defaults', () => {
    expect(
      sanitizeSettings(createAppStub(), {
        downloadDirectory: '',
        defaultFormat: 'wav',
        defaultQuality: '320'
      })
    ).toEqual({
      downloadDirectory: 'C:\\Downloads\\WhoDownloads',
      defaultFormat: 'mp4',
      defaultQuality: 'auto',
      quickDownloadConfigured: false
    })
  })

  it('keeps valid settings', () => {
    expect(
      sanitizeSettings(createAppStub(), {
        downloadDirectory: 'D:\\Videos',
        defaultFormat: 'mp3',
        defaultQuality: '320',
        quickDownloadConfigured: true
      })
    ).toEqual({
      downloadDirectory: 'D:\\Videos',
      defaultFormat: 'mp3',
      defaultQuality: '320',
      quickDownloadConfigured: true
    })
  })

  it('loads defaults when settings file is missing', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('missing'))

    await expect(loadSettings(createAppStub())).resolves.toEqual({
      downloadDirectory: 'C:\\Downloads\\WhoDownloads',
      defaultFormat: 'mp4',
      defaultQuality: 'auto',
      quickDownloadConfigured: false
    })
  })

  it('saves sanitized settings', async () => {
    const settings = await saveSettings(createAppStub(), {
      downloadDirectory: 'D:\\Videos',
      defaultFormat: 'mp3',
      defaultQuality: '192',
      quickDownloadConfigured: true
    })

    expect(settings.defaultFormat).toBe('mp3')
    expect(writeFile).toHaveBeenCalledWith(
      'C:\\UserData\\settings.json',
      JSON.stringify(settings, null, 2),
      'utf8'
    )
  })
})
