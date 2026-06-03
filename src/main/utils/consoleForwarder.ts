import type { WebContents } from 'electron'

type ConsoleSink = Pick<typeof console, 'info' | 'warn' | 'error'>

function getConsoleLevelName(level: number): 'log' | 'warn' | 'error' {
  if (level >= 3) {
    return 'error'
  }

  if (level === 2) {
    return 'warn'
  }

  return 'log'
}

export function forwardRendererConsoleToTerminal(
  webContents: WebContents,
  label: string,
  options: { includeAllLevels?: boolean; consoleSink?: ConsoleSink } = {}
): void {
  const consoleSink = options.consoleSink ?? console

  webContents.on('console-message', (_event, level, message, line, sourceId) => {
    if (!options.includeAllLevels && level < 3) {
      return
    }

    const location = sourceId ? `${sourceId}:${line}` : `line ${line}`
    const levelName = getConsoleLevelName(level)
    const formatted = `[${label}:console-${levelName}] ${message} (${location})`

    if (levelName === 'error') {
      consoleSink.error(formatted)
      return
    }

    if (levelName === 'warn') {
      consoleSink.warn(formatted)
      return
    }

    consoleSink.info(formatted)
  })
}

export const forwardConsoleErrorsToTerminal = forwardRendererConsoleToTerminal
