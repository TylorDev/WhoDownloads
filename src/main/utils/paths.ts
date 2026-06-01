import type { App } from 'electron'
import { join } from 'node:path'

export function getWindowsBinaryPath(app: App, binaryName: string): string {
  const executableName = `${binaryName}.exe`

  if (app.isPackaged) {
    return join(process.resourcesPath, 'bin', 'win', executableName)
  }

  return join(app.getAppPath(), 'resources', 'bin', 'win', executableName)
}

export function getDownloadOutputDirectory(app: App): string {
  return join(app.getPath('downloads'), 'WhoDownloads')
}
