import { app, BrowserWindow, Menu } from 'electron'
import { join } from 'node:path'
import { registerIpcHandlers } from './ipc'
import { forwardRendererConsoleToTerminal } from './utils/consoleForwarder'
import { isDetailedLoggingEnabled } from './utils/cliArgs'
import { getAppIconPath, getDownloadOutputDirectory, getWindowsBinaryPath } from './utils/paths'
import { shouldLogStartupTimings } from './utils/startupLogging'
import { getWindowsNodeRuntimePath } from './utils/ytdlpRuntime'

const WINDOW_BACKGROUND_COLOR = '#050505'
const WINDOW_SHOW_FALLBACK_MS = 2500
const startupStartedAt = Date.now()

function logStartupTiming(mark: string): void {
  if (!shouldLogStartupTimings(app)) {
    return
  }

  console.info(`[startup] ${mark}: ${Date.now() - startupStartedAt}ms`)
}

function logStartupEnvironment(): void {
  if (!isDetailedLoggingEnabled()) {
    return
  }

  console.info(
    `[startup:environment] ${JSON.stringify({
      isPackaged: app.isPackaged,
      resourcesPath: process.resourcesPath,
      userData: app.getPath('userData'),
      downloads: getDownloadOutputDirectory(app),
      ytDlpPath: getWindowsBinaryPath(app, 'yt-dlp'),
      ffmpegPath: getWindowsBinaryPath(app, 'ffmpeg'),
      jsRuntimePath: getWindowsNodeRuntimePath(app),
      username: process.env['USERNAME'] || process.env['USER'] || ''
    })}`
  )
}

function enableRemoteDebuggingForDevelopment(): void {
  const remoteDebuggingPort = process.env['ELECTRON_REMOTE_DEBUGGING_PORT']

  if (!process.env['ELECTRON_RENDERER_URL'] && !remoteDebuggingPort) {
    return
  }

  app.commandLine.appendSwitch('remote-debugging-port', remoteDebuggingPort || '9222')
}

function createWindow(): void {
  logStartupTiming('createWindow:start')

  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 900,
    minHeight: 600,
    title: 'WhoDownloads',
    icon: getAppIconPath(app),
    show: false,
    backgroundColor: WINDOW_BACKGROUND_COLOR,
    frame: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: true
    }
  })

  let windowHasShown = false
  const showFallbackTimer = setTimeout(() => {
    showMainWindow('fallback-timeout')
  }, WINDOW_SHOW_FALLBACK_MS)

  function showMainWindow(reason: string): void {
    if (windowHasShown || mainWindow.isDestroyed()) {
      return
    }

    windowHasShown = true
    clearTimeout(showFallbackTimer)
    logStartupTiming(`window:show:${reason}`)
    mainWindow.show()
  }

  mainWindow.setMenu(null)
  mainWindow.once('ready-to-show', () => {
    logStartupTiming('ready-to-show')
    showMainWindow('ready-to-show')
  })
  mainWindow.webContents.once('dom-ready', () => {
    logStartupTiming('dom-ready')
  })
  mainWindow.webContents.once('did-finish-load', () => {
    logStartupTiming('did-finish-load')
    showMainWindow('did-finish-load')

    if (shouldLogStartupTimings(app)) {
      setTimeout(() => {
        if (mainWindow.isDestroyed()) {
          return
        }

        void mainWindow.webContents
          .executeJavaScript(
            `(() => {
            const nav = performance.getEntriesByType('navigation')[0];
            const paints = performance.getEntriesByType('paint');
            return {
              domContentLoaded: Math.round(nav?.domContentLoadedEventEnd ?? 0),
              loadEventEnd: Math.round(nav?.loadEventEnd ?? 0),
              firstPaint: Math.round(paints.find((paint) => paint.name === 'first-paint')?.startTime ?? 0),
              firstContentfulPaint: Math.round(paints.find((paint) => paint.name === 'first-contentful-paint')?.startTime ?? 0)
            };
          })()`
          )
          .then((metrics) => {
            console.info(`[startup] renderer:${JSON.stringify(metrics)}`)
          })
          .catch((error: unknown) => {
            console.error('[startup] renderer-metrics:failed', error)
          })
      }, 1000)
    }
  })
  mainWindow.webContents.once('did-fail-load', (_event, errorCode, errorDescription) => {
    logStartupTiming(`did-fail-load:${errorCode}:${errorDescription}`)
    showMainWindow('did-fail-load')
  })

  logStartupTiming('load:start')
  if (process.env['ELECTRON_RENDERER_URL']) {
    void mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']).catch((error: unknown) => {
      console.error('[startup] loadURL:failed', error)
      showMainWindow('load-failed')
    })
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html')).catch((error: unknown) => {
      console.error('[startup] loadFile:failed', error)
      showMainWindow('load-failed')
    })
  }

  forwardRendererConsoleToTerminal(mainWindow.webContents, 'renderer', {
    includeAllLevels: isDetailedLoggingEnabled()
  })
  registerIpcHandlers(mainWindow)
}

enableRemoteDebuggingForDevelopment()

app.whenReady().then(() => {
  logStartupTiming('app:ready')
  logStartupEnvironment()
  Menu.setApplicationMenu(null)
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
