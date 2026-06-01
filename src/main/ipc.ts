import { app, ipcMain } from 'electron'
import type { BrowserWindow } from 'electron'
import { join } from 'node:path'
import type { DownloadResult, MetadataResult, PlaylistResult } from '../shared/downloadTypes'
import { downloadVideo, previewVideo } from './services/downloadService'
import { fetchPlaylistEntries } from './services/playlistService'
import { isDownloadInput } from './utils/validation'
import { getWindowsBinaryPath } from './utils/paths'

let handlersRegistered = false

export function registerIpcHandlers(_mainWindow: BrowserWindow): void {
  if (handlersRegistered) {
    return
  }

  handlersRegistered = true

  ipcMain.handle('preview-video', (_event, url: unknown) => {
    if (typeof url !== 'string') {
      return { ok: false, error: 'URL inválida.' } satisfies MetadataResult
    }

    return previewVideo(app, url)
  })

  ipcMain.handle('download-video', (event, input: unknown) => {
    if (!isDownloadInput(input)) {
      return { ok: false, error: 'Opciones de descarga inválidas.' } satisfies DownloadResult
    }

    return downloadVideo(app, input, event.sender)
  })

  ipcMain.handle('fetch-playlist', (_event, url: unknown) => {
    if (typeof url !== 'string') {
      return { ok: false, error: 'URL inválida.' } satisfies PlaylistResult
    }

    return fetchPlaylistEntries(getWindowsBinaryPath(app, 'yt-dlp'), url.trim())
  })

  ipcMain.handle('get-youtube-webview-preload-path', () =>
    join(__dirname, '../preload/youtubeWebview.js')
  )
  ipcMain.handle('open-youtube-browser', () => undefined)
  ipcMain.handle('close-youtube-browser', () => undefined)
}
