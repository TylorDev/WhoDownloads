import { useEffect, useState } from 'react'
import { Copy, Minus, Square, X } from 'lucide-react'
import type { AppPage } from '../../contexts/NavigationContext'
import { useNavigation } from '../../contexts/NavigationContext'
import './AppHeader.scss'

const pages: Array<{ id: AppPage; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'playlist', label: 'Playlist' },
  { id: 'youtube', label: 'Youtube' },
  { id: 'downloads', label: 'Downloads' },
  { id: 'settings', label: 'Settings' }
]

function AppHeader(): JSX.Element {
  const { activePage, setActivePage } = useNavigation()
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    let isMounted = true

    const syncMaximizedState = (): void => {
      void window.whoDownloads.windowControls.isMaximized().then((nextIsMaximized) => {
        if (isMounted) {
          setIsMaximized(nextIsMaximized)
        }
      })
    }

    syncMaximizedState()
    window.addEventListener('resize', syncMaximizedState)

    return () => {
      isMounted = false
      window.removeEventListener('resize', syncMaximizedState)
    }
  }, [])

  const handleToggleMaximize = (): void => {
    void window.whoDownloads.windowControls.toggleMaximize().then(setIsMaximized)
  }

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__mark" aria-hidden="true">WD</span>
        <span>WhoDownloads</span>
      </div>
      <nav className="app-header__nav" aria-label="Principal">
        {pages.map((page) => (
          <button
            key={page.id}
            className={activePage === page.id ? 'app-header__link app-header__link--active' : 'app-header__link'}
            type="button"
            onClick={() => setActivePage(page.id)}
          >
            {page.label}
          </button>
        ))}
      </nav>
      <div className="app-header__window-controls" aria-label="Controles de ventana">
        <button
          className="app-header__window-button"
          type="button"
          aria-label="Minimizar"
          title="Minimizar"
          onClick={() => void window.whoDownloads.windowControls.minimize()}
        >
          <Minus size={15} strokeWidth={2} aria-hidden="true" />
        </button>
        <button
          className="app-header__window-button"
          type="button"
          aria-label={isMaximized ? 'Restaurar' : 'Maximizar'}
          title={isMaximized ? 'Restaurar' : 'Maximizar'}
          onClick={handleToggleMaximize}
        >
          {isMaximized ? (
            <Copy size={14} strokeWidth={2} aria-hidden="true" />
          ) : (
            <Square size={13} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
        <button
          className="app-header__window-button app-header__window-button--close"
          type="button"
          aria-label="Cerrar"
          title="Cerrar"
          onClick={() => void window.whoDownloads.windowControls.close()}
        >
          <X size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}

export default AppHeader
