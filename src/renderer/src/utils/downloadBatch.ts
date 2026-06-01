export const MAX_PARALLEL_BATCH_DOWNLOADS = 4

export function dedupeUrls(urls: string[]): string[] {
  const seenUrls = new Set<string>()
  const uniqueUrls: string[] = []

  for (const rawUrl of urls) {
    const url = rawUrl.trim()

    if (!url || seenUrls.has(url)) {
      continue
    }

    seenUrls.add(url)
    uniqueUrls.push(url)
  }

  return uniqueUrls
}

export async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>
): Promise<void> {
  let nextIndex = 0
  const workerCount = Math.min(concurrency, items.length)

  async function runWorker(): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex
      nextIndex += 1
      await worker(items[currentIndex], currentIndex)
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => runWorker()))
}
