import { describe, expect, it } from 'vitest'
import { normalizeYtDlpErrorMessage } from './ytdlpService'

describe('normalizeYtDlpErrorMessage', () => {
  it('maps YouTube anti-bot errors to embedded-session guidance', () => {
    expect(
      normalizeYtDlpErrorMessage("ERROR: [youtube] abc: Sign in to confirm you're not a bot.")
    ).toBe(
      'YouTube pide verificar la sesion. Abre YouTube dentro de la app, inicia sesion y vuelve a intentar.'
    )
  })

  it('keeps unrelated errors unchanged', () => {
    expect(normalizeYtDlpErrorMessage('ERROR: Requested format is not available')).toBe(
      'ERROR: Requested format is not available'
    )
  })
})
