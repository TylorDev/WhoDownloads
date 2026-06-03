import { afterEach, describe, expect, it, vi } from 'vitest'

describe('shouldLogStartupTimings', () => {
  const originalArgv = process.argv
  const originalStartupEnv = process.env['ELECTRON_STARTUP_TIMINGS']
  const originalLogsEnv = process.env['WHODOWNLOADS_LOGS']

  afterEach(() => {
    vi.resetModules()
    process.argv = originalArgv
    if (originalStartupEnv === undefined) {
      delete process.env['ELECTRON_STARTUP_TIMINGS']
    } else {
      process.env['ELECTRON_STARTUP_TIMINGS'] = originalStartupEnv
    }
    if (originalLogsEnv === undefined) {
      delete process.env['WHODOWNLOADS_LOGS']
    } else {
      process.env['WHODOWNLOADS_LOGS'] = originalLogsEnv
    }
  })

  it('logs in development by default', async () => {
    const { shouldLogStartupTimings } = await import('./startupLogging')

    expect(shouldLogStartupTimings({ isPackaged: false })).toBe(true)
  })

  it('does not log packaged startup timings by default', async () => {
    const { shouldLogStartupTimings } = await import('./startupLogging')

    expect(shouldLogStartupTimings({ isPackaged: true })).toBe(false)
  })

  it('logs packaged startup timings with --logs', async () => {
    process.argv = ['WhoDownloads.exe', '--logs']
    const { shouldLogStartupTimings } = await import('./startupLogging')

    expect(shouldLogStartupTimings({ isPackaged: true })).toBe(true)
  })
})
