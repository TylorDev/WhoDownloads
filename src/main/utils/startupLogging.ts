import type { App } from 'electron'
import { isDetailedLoggingEnabled } from './cliArgs'

export function shouldLogStartupTimings(app: Pick<App, 'isPackaged'>): boolean {
  return !app.isPackaged || process.env['ELECTRON_STARTUP_TIMINGS'] === '1' || isDetailedLoggingEnabled()
}
