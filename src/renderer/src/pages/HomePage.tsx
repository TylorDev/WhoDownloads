import { DownloadForm, MetadataCard, StatusPanel } from '../components'
import { useDownloadContext } from '../contexts/DownloadContext'
import { useSettings } from '../contexts/SettingsContext'

function HomePage(): JSX.Element {
  const download = useDownloadContext()
  const { settings } = useSettings()

  return (
    <section className="page-section">
      <div className="page-heading">
        <p className="page-heading__eyebrow">Home</p>
        <h1>Descarga un video</h1>
      </div>
      <DownloadForm
        url={download.url}
        format={download.format}
        quality={download.quality}
        isDownloading={download.isDownloading}
        isPreviewLoading={download.isPreviewLoading}
        hasCurrentPreview={download.hasCurrentPreview}
        canSubmit={download.canSubmit}
        quickDownloadEnabled={download.quickDownloadEnabled}
        quickDownloadConfigured={settings.quickDownloadConfigured}
        onUrlChange={download.setVideoUrl}
        onFormatChange={download.setFormat}
        onQualityChange={download.setQuality}
        onQuickDownloadChange={download.setQuickDownloadEnabled}
        onSubmit={download.submitDownload}
      />
      {download.metadata && <MetadataCard metadata={download.metadata} />}
      <StatusPanel progress={download.progress} />
    </section>
  )
}

export default HomePage
