import { AppHeader } from './components'
import { DownloadProvider } from './contexts/DownloadContext'
import { NavigationProvider, useNavigation } from './contexts/NavigationContext'
import { PlaylistProvider } from './contexts/PlaylistContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { UrlIntakeProvider } from './contexts/UrlIntakeContext'
import { YouTubeProvider } from './contexts/YouTubeContext'
import HomePage from './pages/HomePage'
import DownloadsPage from './pages/DownloadsPage'
import PlaylistPage from './pages/PlaylistPage'
import SettingsPage from './pages/SettingsPage'
import YouTubePage from './pages/YouTubePage'
import './App.scss'

function ActivePage(): JSX.Element {
  const { activePage } = useNavigation()

  if (activePage === 'playlist') {
    return <PlaylistPage />
  }

  if (activePage === 'youtube') {
    return <YouTubePage />
  }

  if (activePage === 'settings') {
    return <SettingsPage />
  }

  if (activePage === 'downloads') {
    return <DownloadsPage />
  }

  return <HomePage />
}

function AppContent(): JSX.Element {
  const { activePage } = useNavigation()
  const containerClassName =
    activePage === 'youtube' ? 'app-container app-container--wide' : 'app-container'

  return (
    <UrlIntakeProvider>
      <main className="app-shell">
        <AppHeader />
        <div className={containerClassName}>
          <ActivePage />
        </div>
      </main>
    </UrlIntakeProvider>
  )
}

function App(): JSX.Element {
  return (
    <NavigationProvider>
      <SettingsProvider>
        <DownloadProvider>
          <PlaylistProvider>
            <YouTubeProvider>
              <AppContent />
            </YouTubeProvider>
          </PlaylistProvider>
        </DownloadProvider>
      </SettingsProvider>
    </NavigationProvider>
  )
}

export default App
