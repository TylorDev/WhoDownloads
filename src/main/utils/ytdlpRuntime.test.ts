import { describe, expect, it } from 'vitest'
import type { App } from 'electron'
import { getWindowsNodeRuntimePath, getYtDlpJsRuntimeArgs } from './ytdlpRuntime'

function createAppStub(isPackaged: boolean): App {
  return {
    isPackaged,
    getAppPath: () => 'C:\\App'
  } as unknown as App
}

describe('getWindowsNodeRuntimePath', () => {
  it('resolves the packaged embedded Node runtime path', () => {
    const originalResourcesPath = process.resourcesPath
    Object.defineProperty(process, 'resourcesPath', {
      configurable: true,
      value: 'C:\\Program Files\\WhoDownloads\\resources'
    })

    expect(getWindowsNodeRuntimePath(createAppStub(true))).toBe(
      'C:\\Program Files\\WhoDownloads\\resources\\bin\\win\\node\\node.exe'
    )

    Object.defineProperty(process, 'resourcesPath', {
      configurable: true,
      value: originalResourcesPath
    })
  })

  it('resolves the development embedded Node runtime path', () => {
    expect(getWindowsNodeRuntimePath(createAppStub(false))).toBe(
      'C:\\App\\resources\\bin\\win\\node\\node.exe'
    )
  })
})

describe('getYtDlpJsRuntimeArgs', () => {
  it('builds yt-dlp JavaScript runtime args', () => {
    expect(getYtDlpJsRuntimeArgs('C:\\bin\\node\\node.exe')).toEqual([
      '--js-runtimes',
      'node:C:\\bin\\node\\node.exe'
    ])
  })
})
