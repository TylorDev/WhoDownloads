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
import { getYtDlpCookieArgs } from './services/youtubeCookies'
import { isDetailedLoggingEnabled } from './utils/cliArgs'
import { isDownloadInput } from './utils/validation'
import { getWindowsBinaryPath } from './utils/paths'

let handlersRegistered = false

function logIpc(message: string): void {
  if (isDetailedLoggingEnabled()) {
    console.info(message)
  }
}

export function registerIpcHandlers(_mainWindow: BrowserWindow): void {
  if (handlersRegistered) {
    return
  }

  handlersRegistered = true

  ipcMain.handle('preview-video', async (_event, url: unknown) => {
    if (typeof url !== 'string') {
      logIpc(`[ipc:preview-video] ${JSON.stringify({ ok: false, reason: 'invalid-url-type' })}`)
      return { ok: false, error: 'URL invÃ¡lida.' } satisfies MetadataResult
    }

    logIpc(`[ipc:preview-video] ${JSON.stringify({ url: url.trim(), phase: 'start' })}`)
    const { previewVideo } = await import('./services/downloadService')
    const result = await previewVideo(app, url)
    logIpc(`[ipc:preview-video] ${JSON.stringify({ url: url.trim(), ok: result.ok })}`)
    return result
  })

  ipcMain.handle('download-video', async (event, input: unknown) => {
    if (!isDownloadInput(input)) {
      logIpc(`[ipc:download-video] ${JSON.stringify({ ok: false, reason: 'invalid-input' })}`)
      return { ok: false, error: 'Opciones de descarga invÃ¡lidas.' } satisfies DownloadResult
    }

    logIpc(
      `[ipc:download-video] ${JSON.stringify({
        phase: 'start',
        url: input.url.trim(),
        format: input.format,
        quality: input.quality,
        taskId: input.taskId
      })}`
    )
    const [{ downloadVideo }, settings] = await Promise.all([
      import('./services/downloadService'),
      loadSettings(app)
    ])

    const result = await downloadVideo(app, input, event.sender, settings)
    logIpc(
      `[ipc:download-video] ${JSON.stringify({
        ok: result.ok,
        format: input.format,
        quality: input.quality,
        taskId: input.taskId
      })}`
    )
    return result
  })

  ipcMain.handle('fetch-playlist', async (_event, url: unknown) => {
    if (typeof url !== 'string') {
      logIpc(`[ipc:fetch-playlist] ${JSON.stringify({ ok: false, reason: 'invalid-url-type' })}`)
      return { ok: false, error: 'URL invÃ¡lida.' } satisfies PlaylistResult
    }

    logIpc(`[ipc:fetch-playlist] ${JSON.stringify({ url: url.trim(), phase: 'start' })}`)
    const { fetchPlaylistEntries } = await import('./services/playlistService')
    const authArgs = await getYtDlpCookieArgs(app)
    const result = await fetchPlaylistEntries(getWindowsBinaryPath(app, 'yt-dlp'), url.trim(), authArgs)
    logIpc(
      `[ipc:fetch-playlist] ${JSON.stringify({
        url: url.trim(),
        ok: result.ok,
        entries: result.ok ? result.entries.length : undefined
      })}`
    )
    return result
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
