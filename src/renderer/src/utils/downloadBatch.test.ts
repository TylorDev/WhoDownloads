import { describe, expect, it } from 'vitest'
import { dedupeUrls, runWithConcurrency } from './downloadBatch'

describe('downloadBatch helpers', () => {
  it('dedupes URLs preserving order and trimming values', () => {
    expect(dedupeUrls([' a ', 'b', 'a', '', 'c', 'b'])).toEqual(['a', 'b', 'c'])
  })

  it('runs at most the requested number of tasks concurrently', async () => {
    let active = 0
    let maxActive = 0
    const completed: number[] = []

    await runWithConcurrency([1, 2, 3, 4, 5, 6], 4, async (item) => {
      active += 1
      maxActive = Math.max(maxActive, active)

      await new Promise<void>((resolve) => {
        setTimeout(resolve, 1)
      })

      completed.push(item)
      active -= 1
    })

    expect(maxActive).toBeLessThanOrEqual(4)
    expect(completed.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6])
  })
})
