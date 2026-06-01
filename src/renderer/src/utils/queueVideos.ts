import type { PlaylistEntry } from '../types/ipc'
import type { QueueVideo } from '../components/Cola/types'
import { dedupeUrls } from './downloadBatch'

export function playlistEntriesToQueueVideos(entries: PlaylistEntry[]): QueueVideo[] {
  return entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    url: entry.url,
    duration: entry.duration
  }))
}

export function urlsToQueueVideos(urls: string[]): QueueVideo[] {
  return dedupeUrls(urls).map((url) => ({
    id: url,
    title: url,
    url
  }))
}
