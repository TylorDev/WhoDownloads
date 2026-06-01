import { describe, expect, it, vi } from 'vitest'
import { revealFileInFolder } from './fileRevealService'

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
