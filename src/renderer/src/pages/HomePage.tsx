import { useEffect, useRef } from 'react'
import { normalizeYouTubeVideoUrl } from '../../../shared/youtubeUrl'
import DownloadForm from '../components/DownloadForm/DownloadForm'
import MetadataCard from '../components/MetadataCard/MetadataCard'
import StatusPanel from '../components/StatusPanel/StatusPanel'
import { useDownloadContext } from '../contexts/DownloadContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useSettings } from '../contexts/SettingsContext'

function HomePage(): JSX.Element {
  const { t } = useLanguage()
  const download = useDownloadContext()
  const { settings, isLoading: isSettingsLoading, chooseDirectory } = useSettings()
  const lastQuickDownloadUrlRef = useRef('')

  useEffect(() => {
    const videoUrl = normalizeYouTubeVideoUrl(download.url.trim())

    if (!videoUrl || videoUrl !== lastQuickDownloadUrlRef.current) {
      lastQuickDownloadUrlRef.current = ''
    }

    if (
      !download.quickDownloadEnabled ||
      !settings.quickDownloadConfigured ||
      !videoUrl ||
      lastQuickDownloadUrlRef.current === videoUrl ||
      download.isDownloading ||
      download.isBatchDownloading ||
      download.isPreviewLoading
    ) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      lastQuickDownloadUrlRef.current = videoUrl
      void download.quickDownloadUrl(videoUrl)
    }, 450)

    return () => window.clearTimeout(timeoutId)
  }, [
    download.url,
    download.quickDownloadEnabled,
    download.isDownloading,
    download.isBatchDownloading,
    download.isPreviewLoading,
    download.quickDownloadUrl,
    settings.quickDownloadConfigured
  ])

  return (
    <section className="page-section">
      <div className="page-heading">
        <p className="page-heading__eyebrow">{t('home.eyebrow')}</p>
        <h1>{t('home.title')}</h1>
      </div>
      <DownloadForm
        url={download.url}
        format={download.format}
        quality={download.quality}
        downloadDirectory={settings.downloadDirectory}
        isDownloading={download.isDownloading}
        isPreviewLoading={download.isPreviewLoading}
        isSettingsLoading={isSettingsLoading}
        hasCurrentPreview={download.hasCurrentPreview}
        canSubmit={download.canSubmit}
        quickDownloadEnabled={download.quickDownloadEnabled}
        quickDownloadConfigured={settings.quickDownloadConfigured}
        onUrlChange={download.setVideoUrl}
        onFormatChange={download.setFormat}
        onQualityChange={download.setQuality}
        onChooseDirectory={chooseDirectory}
        onQuickDownloadChange={download.setQuickDownloadEnabled}
        onSubmit={download.submitDownload}
      />
      {download.metadata && <MetadataCard metadata={download.metadata} />}
      <StatusPanel progress={download.progress} />
    </section>
  )
}

export default HomePage
