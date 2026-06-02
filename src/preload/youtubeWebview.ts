import { ipcRenderer } from 'electron'
import { getVideoLinkUrlFromContextMenuEvent } from './youtubeLinkExtractor'

window.addEventListener(
  'contextmenu',
  (event) => {
    const url = getVideoLinkUrlFromContextMenuEvent(event)

    if (url) {
      ipcRenderer.sendToHost('youtube-video-context-menu', { url })
    }
  },
  true
)
