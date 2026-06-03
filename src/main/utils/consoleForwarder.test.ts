import { describe, expect, it, vi } from 'vitest'
import { forwardRendererConsoleToTerminal } from './consoleForwarder'

type ConsoleMessageListener = (
  event: unknown,
  level: number,
  message: string,
  line: number,
  sourceId: string
) => void

function createWebContentsStub(): {
  on: ReturnType<typeof vi.fn>
  emitConsoleMessage: ConsoleMessageListener
} {
  let listener: ConsoleMessageListener | undefined
  const on = vi.fn((eventName: string, nextListener: ConsoleMessageListener) => {
    if (eventName === 'console-message') {
      listener = nextListener
    }
  })

  return {
    on,
    emitConsoleMessage: (...args) => {
      listener?.(...args)
    }
  }
}

function createConsoleSink(): {
  info: ReturnType<typeof vi.fn>
  warn: ReturnType<typeof vi.fn>
  error: ReturnType<typeof vi.fn>
} {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}

describe('forwardRendererConsoleToTerminal', () => {
  it('forwards only renderer errors by default', () => {
    const webContents = createWebContentsStub()
    const consoleSink = createConsoleSink()

    forwardRendererConsoleToTerminal(webContents as never, 'renderer', { consoleSink })
    webContents.emitConsoleMessage({}, 1, 'hello', 10, 'app.js')
    webContents.emitConsoleMessage({}, 3, 'boom', 11, 'app.js')

    expect(consoleSink.info).not.toHaveBeenCalled()
    expect(consoleSink.warn).not.toHaveBeenCalled()
    expect(consoleSink.error).toHaveBeenCalledWith('[renderer:console-error] boom (app.js:11)')
  })

  it('forwards log, warn, and error when all levels are enabled', () => {
    const webContents = createWebContentsStub()
    const consoleSink = createConsoleSink()

    forwardRendererConsoleToTerminal(webContents as never, 'renderer', {
      includeAllLevels: true,
      consoleSink
    })
    webContents.emitConsoleMessage({}, 1, 'hello', 10, 'app.js')
    webContents.emitConsoleMessage({}, 2, 'careful', 11, 'app.js')
    webContents.emitConsoleMessage({}, 3, 'boom', 12, 'app.js')

    expect(consoleSink.info).toHaveBeenCalledWith('[renderer:console-log] hello (app.js:10)')
    expect(consoleSink.warn).toHaveBeenCalledWith('[renderer:console-warn] careful (app.js:11)')
    expect(consoleSink.error).toHaveBeenCalledWith('[renderer:console-error] boom (app.js:12)')
  })
})
