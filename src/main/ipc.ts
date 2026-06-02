import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { join } from 'node:path'
import type {
  DownloadResult,
  MetadataResult,
  OpenDirectoryResult,
  PlaylistResult,
  SelectDirectoryResult,
  SettingsResult
} from '../shared/downloadTypes'
import { openDirectoryInShell, revealFileInFolder } from './services/fileRevealService'
import { loadSettings, saveSettings } from './services/settingsService'
import { isDownloadInput } from './utils/validation'
import { getWindowsBinaryPath } from './utils/paths'

let handlersRegistered = false

export function registerIpcHandlers(_mainWindow: BrowserWindow): void {
  if (handlersRegistered) {
    return
  }

  handlersRegistered = true

  ipcMain.handle('preview-video', async (_event, url: unknown) => {
    if (typeof url !== 'string') {
      return { ok: false, error: 'URL inválida.' } satisfies MetadataResult
    }

    const { previewVideo } = await import('./services/downloadService')
    return previewVideo(app, url)
  })

  ipcMain.handle('download-video', async (event, input: unknown) => {
    if (!isDownloadInput(input)) {
      return { ok: false, error: 'Opciones de descarga inválidas.' } satisfies DownloadResult
    }

    const [{ downloadVideo }, settings] = await Promise.all([
      import('./services/downloadService'),
      loadSettings(app)
    ])

    return downloadVideo(app, input, event.sender, settings)
  })

  ipcMain.handle('fetch-playlist', async (_event, url: unknown) => {
    if (typeof url !== 'string') {
      return { ok: false, error: 'URL inválida.' } satisfies PlaylistResult
    }

    const { fetchPlaylistEntries } = await import('./services/playlistService')
    return fetchPlaylistEntries(getWindowsBinaryPath(app, 'yt-dlp'), url.trim())
  })

  ipcMain.handle('get-youtube-webview-preload-path', () =>
    join(__dirname, '../preload/youtubeWebview.js')
  )
  ipcMain.handle('get-settings', async () => {
    try {
      return { ok: true, settings: await loadSettings(app) } satisfies SettingsResult
    } catch {
      return { ok: false, error: 'No se pudieron cargar los settings.' } satisfies SettingsResult
    }
  })
  ipcMain.handle('save-settings', async (_event, settings: unknown) => {
    try {
      return { ok: true, settings: await saveSettings(app, settings) } satisfies SettingsResult
    } catch {
      return { ok: false, error: 'No se pudieron guardar los settings.' } satisfies SettingsResult
    }
  })
  ipcMain.handle('select-download-directory', async () => {
    try {
      const result = await dialog.showOpenDialog(_mainWindow, {
        properties: ['openDirectory', 'createDirectory']
      })

      if (result.canceled || !result.filePaths[0]) {
        return { ok: false, canceled: true } satisfies SelectDirectoryResult
      }

      return { ok: true, directory: result.filePaths[0] } satisfies SelectDirectoryResult
    } catch {
      return { ok: false, error: 'No se pudo abrir el selector de carpeta.' } satisfies SelectDirectoryResult
    }
  })
  ipcMain.handle('show-item-in-folder', (_event, filePath: unknown) => {
    revealFileInFolder(filePath, shell)
  })
  ipcMain.handle('open-download-directory', async (_event, directory: unknown) => {
    try {
      const opened = await openDirectoryInShell(directory, shell)

      return opened
        ? ({ ok: true } satisfies OpenDirectoryResult)
        : ({ ok: false, error: 'No se pudo abrir la carpeta de descargas.' } satisfies OpenDirectoryResult)
    } catch {
      return { ok: false, error: 'No se pudo abrir la carpeta de descargas.' } satisfies OpenDirectoryResult
    }
  })
  ipcMain.handle('window-minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })
  ipcMain.handle('window-toggle-maximize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)

    if (!window) {
      return false
    }

    if (window.isMaximized()) {
      window.unmaximize()
      return false
    }

    window.maximize()
    return true
  })
  ipcMain.handle('window-close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })
  ipcMain.handle('window-is-maximized', (event) => {
    return BrowserWindow.fromWebContents(event.sender)?.isMaximized() ?? false
  })
  ipcMain.handle('open-youtube-browser', () => undefined)
  ipcMain.handle('close-youtube-browser', () => undefined)
}
