import { spawn } from 'node:child_process'
import { join } from 'node:path'

const env = { ...process.env }
const remoteDebuggingPortArg = process.argv.find((arg) =>
  arg.startsWith('--remote-debugging-port=')
)

if (remoteDebuggingPortArg) {
  env.ELECTRON_REMOTE_DEBUGGING_PORT = remoteDebuggingPortArg.split('=')[1] || '9222'
} else {
  env.ELECTRON_REMOTE_DEBUGGING_PORT ??= '9222'
}

const electronViteBin = join(
  process.cwd(),
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'electron-vite.cmd' : 'electron-vite'
)
const command = process.platform === 'win32' ? (process.env.ComSpec ?? 'cmd.exe') : electronViteBin
const args =
  process.platform === 'win32' ? ['/d', '/c', electronViteBin, 'dev'] : ['dev']

delete env.ELECTRON_RUN_AS_NODE

const child = spawn(command, args, {
  env,
  stdio: 'inherit'
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 0)
})
