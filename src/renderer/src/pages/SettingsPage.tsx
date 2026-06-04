import type { DownloadFormat, DownloadQuality } from '../types/ipc'
import { useLanguage } from '../contexts/LanguageContext'
import { useSettings } from '../contexts/SettingsContext'

function SettingsPage(): JSX.Element {
  const { t } = useLanguage()
  const {
    settings,
    isLoading,
    error,
    updateFormat,
    updateQuality,
    chooseDirectory,
    confirmQuickDownloadSettings
  } = useSettings()

  return (
    <section className="page-section">
      <div className="page-heading">
        <p className="page-heading__eyebrow">{t('settings.eyebrow')}</p>
        <h1>{t('settings.title')}</h1>
      </div>

      <div className="settings-panel">
        <p
          className={
            settings.quickDownloadConfigured
              ? 'settings-panel__status settings-panel__status--ready'
              : 'settings-panel__status'
          }
        >
          {settings.quickDownloadConfigured
            ? t('settings.quickReady')
            : t('settings.quickNeedsConfig')}
        </p>

        <label className="field" htmlFor="download-directory">
          <span className="field__label">{t('settings.directoryLabel')}</span>
          <div className="settings-panel__directory">
            <input
              id="download-directory"
              className="form-control form-control--input"
              value={settings.downloadDirectory}
              readOnly
              disabled={isLoading}
            />
            <button className="secondary-button" type="button" onClick={chooseDirectory}>
              {t('settings.chooseFolder')}
            </button>
          </div>
        </label>

        <div className="control-grid">
          <label className="field" htmlFor="default-format">
            <span className="field__label">{t('settings.defaultFormat')}</span>
            <select
              id="default-format"
              className="form-control form-control--select"
              value={settings.defaultFormat}
              onChange={(event) => void updateFormat(event.target.value as DownloadFormat)}
              disabled={isLoading}
            >
              <option value="mp4">{t('settings.mp4Option')}</option>
              <option value="mp3">{t('settings.mp3Option')}</option>
            </select>
          </label>

          <label className="field" htmlFor="default-quality">
            <span className="field__label">{t('settings.defaultQuality')}</span>
            <select
              id="default-quality"
              className="form-control form-control--select"
              value={settings.defaultQuality}
              onChange={(event) => void updateQuality(event.target.value as DownloadQuality)}
              disabled={isLoading}
            >
              {settings.defaultFormat === 'mp4' ? (
                <>
                  <option value="auto">{t('settings.autoOption')}</option>
                  <option value="1080">1080p</option>
                  <option value="720">720p</option>
                  <option value="480">480p</option>
                </>
              ) : (
                <>
                  <option value="auto">{t('settings.autoOption')}</option>
                  <option value="320">320 kbps</option>
                  <option value="192">192 kbps</option>
                  <option value="128">128 kbps</option>
                </>
              )}
            </select>
          </label>
        </div>

        <button
          className="primary-button"
          type="button"
          disabled={isLoading || !settings.downloadDirectory.trim()}
          onClick={() => void confirmQuickDownloadSettings()}
        >
          {t('settings.confirmQuickDownload')}
        </button>

        {error && <p className="settings-panel__error">{error}</p>}
      </div>
    </section>
  )
}

export default SettingsPage
