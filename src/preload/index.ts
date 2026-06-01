import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('whoDownloads', {
  version: '0.0.1'
})
