import { createWriteStream } from 'node:fs'
import { mkdir, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import https from 'node:https'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const nodeVersion = process.env.WHODOWNLOADS_NODE_RUNTIME_VERSION || '22.16.0'
const nodeDistName = `node-v${nodeVersion}-win-x64`
const nodeRuntimeDir = join(repoRoot, 'resources', 'bin', 'win', 'node')
const nodeRuntimePath = join(nodeRuntimeDir, 'node.exe')
const archiveUrl = `https://nodejs.org/dist/v${nodeVersion}/${nodeDistName}.zip`
const tempRoot = join(tmpdir(), 'whodownloads-node-runtime')
const archivePath = join(tempRoot, basename(archiveUrl))
const extractedDir = join(tempRoot, nodeDistName)

async function exists(filePath) {
  try {
    await stat(filePath)
    return true
  } catch {
    return false
  }
}

function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadFile(response.headers.location, destination).then(resolve).catch(reject)
        return
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Download failed with HTTP ${response.statusCode ?? 'unknown'}`))
        return
      }

      const file = createWriteStream(destination)
      response.pipe(file)
      file.on('finish', () => {
        file.close(resolve)
      })
      file.on('error', reject)
    })

    request.on('error', reject)
  })
}

function runPowerShell(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', ...args], {
      windowsHide: true,
      stdio: 'inherit'
    })

    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`PowerShell exited with code ${code ?? 'unknown'}`))
    })
  })
}

async function main() {
  if (await exists(nodeRuntimePath)) {
    console.info(`[prepare-node-runtime] Node runtime already exists: ${nodeRuntimePath}`)
    return
  }

  await mkdir(nodeRuntimeDir, { recursive: true })
  await rm(tempRoot, { recursive: true, force: true })
  await mkdir(tempRoot, { recursive: true })

  console.info(`[prepare-node-runtime] Downloading ${archiveUrl}`)
  await downloadFile(archiveUrl, archivePath)

  console.info('[prepare-node-runtime] Extracting Node runtime')
  await runPowerShell([
    '-Command',
    `Expand-Archive -LiteralPath '${archivePath.replaceAll("'", "''")}' -DestinationPath '${tempRoot.replaceAll("'", "''")}' -Force`
  ])

  await runPowerShell([
    '-Command',
    `Copy-Item -LiteralPath '${join(extractedDir, 'node.exe').replaceAll("'", "''")}' -Destination '${nodeRuntimePath.replaceAll("'", "''")}' -Force`
  ])

  console.info(`[prepare-node-runtime] Ready: ${nodeRuntimePath}`)
}

main().catch((error) => {
  console.error(`[prepare-node-runtime] ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
})
