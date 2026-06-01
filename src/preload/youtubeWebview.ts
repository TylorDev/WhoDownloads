import { ipcRenderer } from 'electron'

function getVideoLinkUrl(target: EventTarget | null): string {
  if (!(target instanceof Element)) {
    return ''
  }

  const link = target.closest<HTMLAnchorElement>('a[href]')

  return link?.href ?? ''
}

window.addEventListener(
  'contextmenu',
  (event) => {
    const url = getVideoLinkUrl(event.target)

    if (url) {
      ipcRenderer.sendToHost('youtube-video-context-menu', { url })
    }
  },
  true
)
