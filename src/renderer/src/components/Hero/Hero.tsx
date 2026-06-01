import './Hero.scss'

function Hero(): JSX.Element {
  return (
    <div className="hero">
      <p className="hero__eyebrow">WhoDownloads</p>
      <h1 className="hero__title">Descarga YouTube en MP4 o MP3</h1>
      <p className="hero__copy">
        Pega una URL publica de YouTube. Descarga video MP4 compatible o audio MP3 en
        Downloads/WhoDownloads.
      </p>
    </div>
  )
}

export default Hero
