import { contextBridge, ipcRenderer } from 'electron'
import type {
  DownloadInput,
  DownloadProgress,
  DownloadResult,
  MetadataResult,
  OpenDirectoryResult,
  PlaylistResult,
  SelectDirectoryResult,
  SettingsResult,
  AppSettings,
  YouTubeVideoClickedEvent
} from '../shared/downloadTypes'

contextBridge.exposeInMainWorld('whoDownloads', {
  version: '0.0.1',
  windowControls: {
    minimize: (): Promise<void> => ipcRenderer.invoke('window-minimize'),
    toggleMaximize: (): Promise<boolean> => ipcRenderer.invoke('window-toggle-maximize'),
    close: (): Promise<void> => ipcRenderer.invoke('window-close'),
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window-is-maximized')
  },
  getYouTubeWebviewPreloadPath: (): Promise<string> =>
    ipcRenderer.invoke('get-youtube-webview-preload-path'),
  previewVideo: (url: string): Promise<MetadataResult> => ipcRenderer.invoke('preview-video', url),
  downloadVideo: (input: DownloadInput): Promise<DownloadResult> =>
    ipcRenderer.invoke('download-video', input),
  openYouTubeBrowser: (): Promise<void> => ipcRenderer.invoke('open-youtube-browser'),
  closeYouTubeBrowser: (): Promise<void> => ipcRenderer.invoke('close-youtube-browser'),
  fetchPlaylist: (url: string): Promise<PlaylistResult> => ipcRenderer.invoke('fetch-playlist', url),
  getSettings: (): Promise<SettingsResult> => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: AppSettings): Promise<SettingsResult> =>
    ipcRenderer.invoke('save-settings', settings),
  selectDownloadDirectory: (): Promise<SelectDirectoryResult> =>
    ipcRenderer.invoke('select-download-directory'),
  showItemInFolder: (filePath: string): Promise<void> =>
    ipcRenderer.invoke('show-item-in-folder', filePath),
  openDownloadDirectory: (directory: string): Promise<OpenDirectoryResult> =>
    ipcRenderer.invoke('open-download-directory', directory),
  onYouTubeVideoClicked: (callback: (event: YouTubeVideoClickedEvent) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: YouTubeVideoClickedEvent): void => {
      callback(payload)
    }

    ipcRenderer.on('youtube-video-clicked', listener)

    return (): void => {
      ipcRenderer.removeListener('youtube-video-clicked', listener)
    }
  },
  onDownloadProgress: (callback: (progress: DownloadProgress) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, progress: DownloadProgress): void => {
      callback(progress)
    }

    ipcRenderer.on('download-progress', listener)

    return (): void => {
      ipcRenderer.removeListener('download-progress', listener)
    }
  }
})
