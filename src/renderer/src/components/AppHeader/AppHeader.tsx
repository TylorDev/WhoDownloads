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

  return (
    <header className="app-header">
      <div className="app-header__brand">WhoDownloads</div>
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
    </header>
  )
}

export default AppHeader
