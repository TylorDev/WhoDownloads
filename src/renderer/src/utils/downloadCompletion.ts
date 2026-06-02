import type { DownloadResult } from '../types/ipc'

export function shouldClearDownloadInput(result: DownloadResult): boolean {
  return result.ok
}

export function isBatchDownloadSuccessful(failedCount: number): boolean {
  return failedCount === 0
}

export function shouldClearPlaylistStateForUrl(value: string): boolean {
  return value.trim().length === 0
}
