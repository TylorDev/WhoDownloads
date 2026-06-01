type FileRevealShell = {
  showItemInFolder: (filePath: string) => void
}

export function revealFileInFolder(filePath: unknown, shell: FileRevealShell): boolean {
  if (typeof filePath !== 'string' || !filePath.trim()) {
    return false
  }

  shell.showItemInFolder(filePath)
  return true
}
