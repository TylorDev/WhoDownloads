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
import { useLanguage, type TranslationKey } from '../../contexts/LanguageContext'
import { useNavigation } from '../../contexts/NavigationContext'
import { useSettings } from '../../contexts/SettingsContext'
import logoUrl from '../../assets/logo.svg'
import './AppHeader.scss'

const pages: Array<{ id: AppPage; labelKey: TranslationKey; Icon: LucideIcon }> = [
  { id: 'home', labelKey: 'nav.home', Icon: Home },
  { id: 'playlist', labelKey: 'nav.playlist', Icon: ListMusic },
  { id: 'youtube', labelKey: 'nav.youtube', Icon: MonitorPlay },
  { id: 'downloads', labelKey: 'nav.downloads', Icon: Download },
  { id: 'settings', labelKey: 'nav.settings', Icon: Settings }
]

function AppHeader(): JSX.Element {
  const { t } = useLanguage()
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
      <nav className="app-header__nav" aria-label={t('app.navAriaLabel')}>
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
              <span>{t(page.labelKey)}</span>
            </button>
          )
        })}
      </nav>
      <div className="app-header__right">
        <div className="app-header__actions" aria-label={t('app.downloadActionsAriaLabel')}>
          <button
            className="app-header__action-button"
            type="button"
            aria-label={t('app.openDownloadsFolder')}
            title={t('app.openDownloadsFolder')}
            disabled={isLoading || !settings.downloadDirectory}
            onClick={handleOpenDownloadDirectory}
          >
            <FolderOpen size={16} strokeWidth={2.1} aria-hidden="true" />
          </button>
        </div>
        <div className="app-header__window-controls" aria-label={t('app.windowControlsAriaLabel')}>
          <button
            className="app-header__window-button"
            type="button"
            aria-label={t('app.minimize')}
            title={t('app.minimize')}
            onClick={() => void window.whoDownloads.windowControls.minimize()}
          >
            <Minus size={15} strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            className="app-header__window-button"
            type="button"
            aria-label={isMaximized ? t('app.restore') : t('app.maximize')}
            title={isMaximized ? t('app.restore') : t('app.maximize')}
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
            aria-label={t('app.close')}
            title={t('app.close')}
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
