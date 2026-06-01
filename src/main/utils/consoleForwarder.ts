import type { WebContents } from 'electron'

export function forwardConsoleErrorsToTerminal(webContents: WebContents, label: string): void {
  webContents.on('console-message', (_event, level, message, line, sourceId) => {
    if (level < 3) {
      return
    }

    const location = sourceId ? `${sourceId}:${line}` : `line ${line}`
    console.error(`[${label}:console-error] ${message} (${location})`)
  })
}
