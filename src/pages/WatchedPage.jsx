import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { getTmdbFallbackPoster } from '../services/tmdb'

export default function WatchedPage({ catalog, entries, onOpenDetails, onToggleWatchlist, onToggleFavourite, onStatusChange, onUpdateRating, onUpdateNotes }) {
  const [query, setQuery] = useState('')

  const watchedItems = useMemo(() => {
    return catalog.filter((item) => (entries[item.id]?.status || 'not-interested') === 'watched')
  }, [catalog, entries])

  const visibleItems = useMemo(() => {
    return watchedItems.filter((item) => {
      const matchesQuery =
        !query ||
        [item.title, item.originalTitle, item.overview].some((value) =>
          String(value).toLowerCase().includes(query.trim().toLowerCase()),
        )
      return matchesQuery
    })
  }, [watchedItems, query])

  return (
    <div className="page-block">
      <header className="page-header">
        <div>
          <p className="eyebrow">History</p>
          <h1>Watched</h1>
        </div>
        <div className="header-stat">{watchedItems.length} finished</div>
      </header>

      <section className="search-panel compact-panel">
        <label className="search-input-wrap" htmlFor="watched-search">
          <Search size={16} />
          <input
            id="watched-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your watched list"
          />
        </label>
      </section>

      {visibleItems.length > 0 ? (
        <div className="watched-grid">
          {visibleItems.map((item) => {
            const meta = entries[item.id] || {}
            return (
              <article key={item.id} className="watched-card">
                <div className="watched-card-header">
                  <img
                    src={item.poster || getTmdbFallbackPoster(item.title)}
                    alt={item.title}
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = getTmdbFallbackPoster(item.title)
                    }}
                  />
                  <div>
                    <h3>{item.title}</h3>
                    <p>
                      {item.year} • {item.language}
                    </p>
                  </div>
                </div>

                <div className="watched-controls">
                  <label>
                    <span>Personal rating</span>
                    <select
                      value={meta.personalRating || 0}
                      onChange={(event) => onUpdateRating(item.id, Number(event.target.value))}
                    >
                      <option value={0}>No rating</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                        <option key={value} value={value}>
                          {value}/10
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Status</span>
                    <select value={meta.status || 'watched'} onChange={(event) => onStatusChange(item.id, event.target.value)}>
                      <option value="watched">Watched</option>
                      <option value="currently-watching">Currently Watching</option>
                      <option value="on-hold">On Hold</option>
                      <option value="dropped">Dropped</option>
                    </select>
                  </label>
                </div>

                <label className="notes-field">
                  <span>Review</span>
                  <textarea
                    rows={3}
                    value={meta.notes || ''}
                    onChange={(event) => onUpdateNotes(item.id, event.target.value)}
                    placeholder="Add a quick review or note"
                  />
                </label>

                <div className="mini-actions">
                  <button type="button" className="secondary-button small-button" onClick={() => onOpenDetails(item)}>
                    View details
                  </button>
                  <button type="button" className="ghost-button small" onClick={() => onToggleWatchlist(item.id)}>
                    Toggle watchlist
                  </button>
                  <button type="button" className="ghost-button small" onClick={() => onToggleFavourite(item.id)}>
                    {meta.favourite ? 'Unfavourite' : 'Favourite'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No watched titles yet.</h3>
          <p>Mark a film as watched to build your viewing history and richer recommendations.</p>
        </div>
      )}
    </div>
  )
}
