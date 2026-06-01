import './ClickedVideosList.scss'

interface ClickedVideosListProps {
  videos: string[]
  isYouTubeOpen: boolean
}

function ClickedVideosList({ videos, isYouTubeOpen }: ClickedVideosListProps): JSX.Element {
  return (
    <div className="clicked-videos">
      <div className="clicked-videos__header">
        <h2 className="clicked-videos__title">Videos clickeados</h2>
        <span className="clicked-videos__count">{videos.length}</span>
      </div>
      {!isYouTubeOpen && videos.length > 0 ? (
        <ol className="clicked-videos__list">
          {videos.map((videoUrl) => (
            <li className="clicked-videos__item" key={videoUrl}>
              <span className="break-anywhere">{videoUrl}</span>
            </li>
          ))}
        </ol>
      ) : !isYouTubeOpen ? (
        <p className="clicked-videos__empty">
          Abre YouTube dentro de la app y entra a videos para agregarlos a esta lista.
        </p>
      ) : null}
    </div>
  )
}

export default ClickedVideosList
