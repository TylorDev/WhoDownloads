import { spawn } from 'node:child_process'
import { join } from 'node:path'

const env = { ...process.env }
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
