import { lazy, Suspense } from 'react'
import AppHeader from './components/AppHeader/AppHeader'
import { DownloadProvider } from './contexts/DownloadContext'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'
import { NavigationProvider, useNavigation } from './contexts/NavigationContext'
import { PlaylistProvider } from './contexts/PlaylistContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { UrlIntakeProvider } from './contexts/UrlIntakeContext'
import { YouTubeProvider } from './contexts/YouTubeContext'
import HomePage from './pages/HomePage'
import './App.scss'

const DownloadsPage = lazy(() => import('./pages/DownloadsPage'))
const PlaylistPage = lazy(() => import('./pages/PlaylistPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const YouTubePage = lazy(() => import('./pages/YouTubePage'))

function PageFallback(): JSX.Element {
  const { t } = useLanguage()

  return (
    <section className="page-section" aria-busy="true">
      <div className="page-heading">
        <p className="page-heading__eyebrow">{t('app.loadingEyebrow')}</p>
        <h1>{t('app.loadingTitle')}</h1>
      </div>
    </section>
  )
}

function ActivePage(): JSX.Element {
  const { activePage } = useNavigation()

  if (activePage === 'playlist') {
    return (
      <Suspense fallback={<PageFallback />}>
        <PlaylistPage />
      </Suspense>
    )
  }

  if (activePage === 'youtube') {
    return (
      <Suspense fallback={<PageFallback />}>
        <YouTubePage />
      </Suspense>
    )
  }

  if (activePage === 'settings') {
    return (
      <Suspense fallback={<PageFallback />}>
        <SettingsPage />
      </Suspense>
    )
  }

  if (activePage === 'downloads') {
    return (
      <Suspense fallback={<PageFallback />}>
        <DownloadsPage />
      </Suspense>
    )
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
    <LanguageProvider>
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
    </LanguageProvider>
  )
}

export default App
