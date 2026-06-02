import { lazy, Suspense } from 'react'
import AppHeader from './components/AppHeader/AppHeader'
import { DownloadProvider } from './contexts/DownloadContext'
import { NavigationProvider, useNavigation } from './contexts/NavigationContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { UrlIntakeProvider } from './contexts/UrlIntakeContext'
import HomePage from './pages/HomePage'
import './App.scss'

const DownloadsPage = lazy(() => import('./pages/DownloadsPage'))
const PlaylistPage = lazy(() => import('./pages/PlaylistPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const YouTubePage = lazy(() => import('./pages/YouTubePage'))

function PageFallback(): JSX.Element {
  return (
    <section className="page-section" aria-busy="true">
      <div className="page-heading">
        <p className="page-heading__eyebrow">Cargando</p>
        <h1>Preparando vista</h1>
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
    <NavigationProvider>
      <SettingsProvider>
        <DownloadProvider>
          <AppContent />
        </DownloadProvider>
      </SettingsProvider>
    </NavigationProvider>
  )
}

export default App
