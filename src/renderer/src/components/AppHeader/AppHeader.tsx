import { useEffect, useState } from 'react'
import {
  Copy,
  Download,
  FolderOpen,
  Home,
  ListMusic,
  MonitorPlay,
  Minus,
  Settings,
  Square,
  X,
  type LucideIcon
} from 'lucide-react'
import type { AppPage } from '../../contexts/NavigationContext'
import { useNavigation } from '../../contexts/NavigationContext'
import { useSettings } from '../../contexts/SettingsContext'
import logoUrl from '../../assets/logo.svg'
import './AppHeader.scss'

const pages: Array<{ id: AppPage; label: string; Icon: LucideIcon }> = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'playlist', label: 'Playlist', Icon: ListMusic },
  { id: 'youtube', label: 'Youtube', Icon: MonitorPlay },
  { id: 'downloads', label: 'Downloads', Icon: Download },
  { id: 'settings', label: 'Settings', Icon: Settings }
]

function AppHeader(): JSX.Element {
  const { activePage, setActivePage } = useNavigation()
  const { settings, isLoading } = useSettings()
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

  const handleOpenDownloadDirectory = (): void => {
    if (isLoading || !settings.downloadDirectory) {
      return
    }

    void window.whoDownloads.openDownloadDirectory(settings.downloadDirectory)
  }

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__mark" aria-hidden="true">
          <img src={logoUrl} alt="" />
        </span>
       
      </div>
      <nav className="app-header__nav" aria-label="Principal">
        {pages.map((page) => {
          const isActive = activePage === page.id
          const { Icon } = page

          return (
            <button
              key={page.id}
              className={isActive ? 'app-header__link app-header__link--active' : 'app-header__link'}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => setActivePage(page.id)}
            >
              <Icon size={16} strokeWidth={2.1} aria-hidden="true" />
              <span>{page.label}</span>
            </button>
          )
        })}
      </nav>
      <div className="app-header__right">
        <div className="app-header__actions" aria-label="Acciones de descargas">
          <button
            className="app-header__action-button"
            type="button"
            aria-label="Abrir carpeta de descargas"
            title="Abrir carpeta de descargas"
            disabled={isLoading || !settings.downloadDirectory}
            onClick={handleOpenDownloadDirectory}
          >
            <FolderOpen size={16} strokeWidth={2.1} aria-hidden="true" />
          </button>
        </div>
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
      </div>
    </header>
  )
}

export default AppHeader
