import { BookmarkPlus, Check, Heart, Star } from 'lucide-react'
import { STATUS_OPTIONS } from '../data/catalog'
import { getTmdbFallbackPoster } from '../services/tmdb'

function formatStatus(value) {
  return STATUS_OPTIONS.find((status) => status.value === value)?.label || 'Saved'
}

export default function PosterCard({ item, meta = {}, onOpenDetails, onToggleWatchlist, onToggleFavourite, onStatusChange }) {
  const isFavourite = Boolean(meta.favourite)
  const isInWatchlist = meta.status && meta.status !== 'not-interested' && meta.status !== 'dropped'
  const posterSrc = item.poster || getTmdbFallbackPoster(item.title)

  function handlePosterError(event) {
    event.currentTarget.onerror = null
    event.currentTarget.src = getTmdbFallbackPoster(item.title)
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpenDetails(item)
    }
  }

  return (
    <article
      className="poster-card"
      aria-label={`Open details for ${item.title}`}
      tabIndex={0}
      onClick={() => onOpenDetails(item)}
      onKeyDown={handleKeyDown}
    >
      <div className="poster-image-wrap">
        {item.poster ? (
          <img src={posterSrc} alt={item.title} className="poster-image" loading="lazy" onError={handlePosterError} />
        ) : (
          <div className="poster-fallback">
            <span>{item.title}</span>
          </div>
        )}
        <div className="poster-overlay">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onToggleWatchlist(item.id)
            }}
            className={`ghost-button small ${isInWatchlist ? 'active' : ''}`}
            aria-label={isInWatchlist ? `Remove ${item.title} from watchlist` : `Add ${item.title} to watchlist`}
          >
            <BookmarkPlus size={14} />
            {isInWatchlist ? 'Saved' : 'Watchlist'}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onToggleFavourite(item.id)
            }}
            className={`icon-button ${isFavourite ? 'active' : ''}`}
            aria-label={isFavourite ? `Unfavourite ${item.title}` : `Favourite ${item.title}`}
          >
            <Heart size={14} fill={isFavourite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="poster-body">
        <div className="poster-topline">
          <span className="pill muted">{item.mediaType}</span>
          {item.externalRating ? (
            <span className="rating-pill">
              <Star size={12} fill="currentColor" />
              {item.externalRating.toFixed(1)}
            </span>
          ) : null}
        </div>

        <h3>{item.title}</h3>
        <p className="meta-line">
          {item.year} • {item.language}
        </p>

        <div className="card-footer">
          <span className={`status-badge ${meta.status || 'not-interested'}`}>{formatStatus(meta.status || 'not-interested')}</span>
          <select
            aria-label={`Set status for ${item.title}`}
            value={meta.status || 'not-interested'}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => {
              event.stopPropagation()
              onStatusChange(item.id, event.target.value)
            }}
            className="status-select"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {meta.personalRating ? (
          <div className="mini-rating">
            <Check size={12} />
            Rated {meta.personalRating}/10
          </div>
        ) : null}
      </div>
    </article>
  )
}
