import { useLanguage } from '../../contexts/LanguageContext'
import './Hero.scss'

function Hero(): JSX.Element {
  const { t } = useLanguage()

  return (
    <div className="hero">
      <p className="hero__eyebrow">{t('hero.eyebrow')}</p>
      <h1 className="hero__title">{t('hero.title')}</h1>
      <p className="hero__copy">{t('hero.copy')}</p>
    </div>
  )
}

export default Hero
