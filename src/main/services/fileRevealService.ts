type FileRevealShell = {
  showItemInFolder: (filePath: string) => void
  openPath?: (path: string) => Promise<string>
}

export function revealFileInFolder(filePath: unknown, shell: FileRevealShell): boolean {
  if (typeof filePath !== 'string' || !filePath.trim()) {
    return false
  }

  shell.showItemInFolder(filePath)
  return true
}

export async function openDirectoryInShell(directory: unknown, shell: FileRevealShell): Promise<boolean> {
  if (typeof directory !== 'string' || !directory.trim() || !shell.openPath) {
    return false
  }

  const error = await shell.openPath(directory)
  return !error
}
