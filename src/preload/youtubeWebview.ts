import { ipcRenderer } from 'electron'
import { getVideoLinkUrlFromContextMenuTarget } from './youtubeLinkExtractor'

function getVideoLinkUrl(target: EventTarget | null): string {
  return getVideoLinkUrlFromContextMenuTarget(target)
}

window.addEventListener(
  'contextmenu',
  (event) => {
    const url =
      getVideoLinkUrlFromContextMenuTarget(event.target, event.composedPath()) ||
      getVideoLinkUrl(event.target)

    if (url) {
      ipcRenderer.sendToHost('youtube-video-context-menu', { url })
    }
  },
  true
)
