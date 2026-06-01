import { describe, expect, it } from 'vitest'
import {
  applyTaskProgress,
  applyTaskResult,
  createDownloadTask,
  getDownloadTaskTitle
} from './downloadTasks'

describe('downloadTasks helpers', () => {
  it('creates queued download tasks', () => {
    expect(
      createDownloadTask({ url: 'https://youtu.be/abc', format: 'mp4', quality: '720', taskId: 't1' })
    ).toMatchObject({
      id: 't1',
      url: 'https://youtu.be/abc',
      format: 'mp4',
      quality: '720',
      status: 'queued'
    })
  })

  it('updates a task by taskId from progress', () => {
    const tasks = [
      createDownloadTask({ url: 'https://youtu.be/abc', format: 'mp4', quality: '720', taskId: 't1' })
    ]

    expect(
      applyTaskProgress(tasks, {
        taskId: 't1',
        status: 'downloading',
        percent: 40,
        speed: '1MiB/s',
        eta: '00:10',
        message: '40%'
      })[0]
    ).toMatchObject({
      status: 'downloading',
      percent: 40,
      speed: '1MiB/s',
      eta: '00:10',
      message: '40%'
    })
  })

  it('stores file paths and errors from final results', () => {
    const tasks = [
      createDownloadTask({ url: 'https://youtu.be/abc', format: 'mp3', quality: '192', taskId: 't1' }),
      createDownloadTask({ url: 'https://youtu.be/def', format: 'mp3', quality: '192', taskId: 't2' })
    ]

    const completedTasks = applyTaskResult(tasks, 't1', {
      ok: true,
      filePath: 'C:\\Downloads\\song.mp3'
    })
    const failedTasks = applyTaskResult(completedTasks, 't2', {
      ok: false,
      error: 'failed'
    })

    expect(failedTasks[0]).toMatchObject({
      status: 'completed',
      filePath: 'C:\\Downloads\\song.mp3'
    })
    expect(failedTasks[1]).toMatchObject({ status: 'failed', error: 'failed' })
  })

  it('uses metadata title with URL fallback for display titles', () => {
    const task = createDownloadTask(
      { url: 'https://youtu.be/abc', format: 'mp4', quality: '720', taskId: 't1' },
      {
        title: 'Video title',
        artist: '',
        year: '',
        authorUrl: 'https://youtu.be/abc',
        url: 'https://youtu.be/abc'
      }
    )
    const taskWithoutMetadata = createDownloadTask({
      url: 'https://youtu.be/no-title',
      format: 'mp4',
      quality: '720',
      taskId: 't2'
    })

    expect(getDownloadTaskTitle(task)).toBe('Video title')
    expect(getDownloadTaskTitle(taskWithoutMetadata)).toBe('https://youtu.be/no-title')
  })
})
