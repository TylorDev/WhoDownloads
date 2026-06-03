export function hasCliFlag(flag: string, argv: string[] = process.argv): boolean {
  return argv.includes(flag)
}

export function isDetailedLoggingEnabled(
  argv: string[] = process.argv,
  env: NodeJS.ProcessEnv = process.env
): boolean {
  return hasCliFlag('--logs', argv) || env['WHODOWNLOADS_LOGS'] === '1'
}
