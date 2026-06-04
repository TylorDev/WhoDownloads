import { describe, expect, it } from 'vitest'
import { detectLanguage, translate } from './LanguageContext'

describe('LanguageContext helpers', () => {
  it('detects supported base languages from browser language lists', () => {
    expect(detectLanguage(['es-ES', 'en-US'])).toBe('es')
    expect(detectLanguage(['pt-BR', 'en-US'])).toBe('pt')
    expect(detectLanguage(['en-US'])).toBe('en')
  })

  it('falls back to English for unsupported languages', () => {
    expect(detectLanguage(['fr-FR', 'de-DE'])).toBe('en')
  })

  it('interpolates values in translated strings', () => {
    expect(translate('en', 'status.downloadedAt', { path: 'C:\\Downloads\\song.mp3' })).toBe(
      'Downloaded to C:\\Downloads\\song.mp3'
    )
  })

  it('falls back to English when a locale key is not overridden', () => {
    expect(translate('es', 'downloadForm.urlPlaceholder')).toBe(
      'https://www.youtube.com/watch?v=...'
    )
  })
})
