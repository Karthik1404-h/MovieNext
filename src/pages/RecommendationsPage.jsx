import { buildRecommendations } from '../utils/recommendations'
import { getTmdbFallbackPoster } from '../services/tmdb'

export default function RecommendationsPage({ catalog, entries, onOpenDetails, onToggleWatchlist }) {
  const suggestions = buildRecommendations({ catalog, entries, limit: 10 })

  return (
    <div className="page-block">
      <header className="page-header">
        <div>
          <p className="eyebrow">Tailored picks</p>
          <h1>Recommendations</h1>
        </div>
      </header>

      <p className="recommendation-intro">
        Based on your favourites, ratings, watched history, and watchlist patterns.
      </p>

      <div className="recommendation-grid">
        {suggestions.map((item) => (
          <article key={item.id} className="recommendation-card">
            <img src={item.poster || getTmdbFallbackPoster(item.title)} alt={item.title} onError={(event) => {
              event.currentTarget.onerror = null
              event.currentTarget.src = getTmdbFallbackPoster(item.title)
            }} />
            <div className="recommendation-body">
              <div className="recommendation-header">
                <h3>{item.title}</h3>
                <span>{item.year}</span>
              </div>
              <p className="reason-line">{item.reason}</p>
              <div className="recommendation-meta">
                <span>{item.mediaType}</span>
                <span>{item.language}</span>
              </div>
              <div className="mini-actions">
                <button type="button" className="primary-button small-button" onClick={() => onOpenDetails(item)}>
                  View details
                </button>
                <button type="button" className="secondary-button small-button" onClick={() => onToggleWatchlist(item.id)}>
                  Watchlist
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
