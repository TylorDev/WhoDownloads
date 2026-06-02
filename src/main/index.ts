import { app, BrowserWindow, Menu } from 'electron'
import { join } from 'node:path'
import { registerIpcHandlers } from './ipc'
import { forwardConsoleErrorsToTerminal } from './utils/consoleForwarder'

function enableRemoteDebuggingForDevelopment(): void {
  const remoteDebuggingPort = process.env['ELECTRON_REMOTE_DEBUGGING_PORT']

  if (!process.env['ELECTRON_RENDERER_URL'] && !remoteDebuggingPort) {
    return
  }

  app.commandLine.appendSwitch('remote-debugging-port', remoteDebuggingPort || '9222')
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 900,
    minHeight: 600,
    title: 'WhoDownloads',
    icon: join(__dirname, '../../resources/bin/win/logo.svg'),
    frame: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: true
    }
  })

  mainWindow.setMenu(null)

  if (process.env['ELECTRON_RENDERER_URL']) {
    void mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  forwardConsoleErrorsToTerminal(mainWindow.webContents, 'renderer')
  registerIpcHandlers(mainWindow)
}

enableRemoteDebuggingForDevelopment()

app.whenReady().then(() => {
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
