import type { App } from 'electron'
import { join } from 'node:path'

export function getWindowsNodeRuntimePath(app: App): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'bin', 'win', 'node', 'node.exe')
  }

  return join(app.getAppPath(), 'resources', 'bin', 'win', 'node', 'node.exe')
}

export function getYtDlpJsRuntimeArgs(nodePath: string): string[] {
  return ['--js-runtimes', `node:${nodePath}`]
}
