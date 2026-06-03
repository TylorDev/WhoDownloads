import { describe, expect, it } from 'vitest'
import { hasCliFlag, isDetailedLoggingEnabled } from './cliArgs'

describe('cliArgs', () => {
  it('detects exact CLI flags', () => {
    expect(hasCliFlag('--logs', ['WhoDownloads.exe', '--logs'])).toBe(true)
    expect(hasCliFlag('--logs', ['WhoDownloads.exe', '--log'])).toBe(false)
  })

  it('enables detailed logging from --logs or the dev env bridge', () => {
    expect(isDetailedLoggingEnabled(['WhoDownloads.exe', '--logs'], {})).toBe(true)
    expect(isDetailedLoggingEnabled(['WhoDownloads.exe'], { WHODOWNLOADS_LOGS: '1' })).toBe(true)
    expect(isDetailedLoggingEnabled(['WhoDownloads.exe'], {})).toBe(false)
  })
})
