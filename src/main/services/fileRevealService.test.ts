import { describe, expect, it, vi } from 'vitest'
import { openDirectoryInShell, revealFileInFolder } from './fileRevealService'

describe('revealFileInFolder', () => {
  it('opens a valid file path in the shell', () => {
    const shell = { showItemInFolder: vi.fn() }

    expect(revealFileInFolder('C:\\Downloads\\video.mp4', shell)).toBe(true)
    expect(shell.showItemInFolder).toHaveBeenCalledWith('C:\\Downloads\\video.mp4')
  })

  it('rejects invalid file paths', () => {
    const shell = { showItemInFolder: vi.fn() }

    expect(revealFileInFolder('', shell)).toBe(false)
    expect(revealFileInFolder(null, shell)).toBe(false)
    expect(shell.showItemInFolder).not.toHaveBeenCalled()
  })
})

describe('openDirectoryInShell', () => {
  it('opens a valid directory path in the shell', async () => {
    const shell = { showItemInFolder: vi.fn(), openPath: vi.fn(() => Promise.resolve('')) }

    await expect(openDirectoryInShell('C:\\Downloads', shell)).resolves.toBe(true)
    expect(shell.openPath).toHaveBeenCalledWith('C:\\Downloads')
  })

  it('rejects invalid directory paths and shell errors', async () => {
    const shell = { showItemInFolder: vi.fn(), openPath: vi.fn(() => Promise.resolve('failed')) }

    await expect(openDirectoryInShell('', shell)).resolves.toBe(false)
    await expect(openDirectoryInShell(null, shell)).resolves.toBe(false)
    await expect(openDirectoryInShell('C:\\Missing', shell)).resolves.toBe(false)
  })
})
