import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import ContentRow from '../components/ContentRow'

export default function WatchlistPage({ catalog, entries, onOpenDetails, onToggleWatchlist, onToggleFavourite, onStatusChange }) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  const watchlistItems = useMemo(() => {
    return catalog.filter((item) => {
      const meta = entries[item.id] || {}
      return meta.status && meta.status !== 'not-interested'
    })
  }, [catalog, entries])

  const visibleItems = useMemo(() => {
    const filtered = watchlistItems.filter((item) => {
      const meta = entries[item.id] || {}
      const matchesStatus = statusFilter === 'all' || meta.status === statusFilter
      const matchesQuery =
        !query ||
        [item.title, item.originalTitle, item.overview].some((value) =>
          String(value).toLowerCase().includes(query.trim().toLowerCase()),
        )

      return matchesStatus && matchesQuery
    })

    return filtered.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'year') return (b.year || 0) - (a.year || 0)
      if (sortBy === 'rating') return (b.externalRating || 0) - (a.externalRating || 0)
      return (entries[b.id]?.dateAdded || '').localeCompare(entries[a.id]?.dateAdded || '')
    })
  }, [watchlistItems, entries, query, statusFilter, sortBy])

  return (
    <div className="page-block">
      <header className="page-header">
        <div>
          <p className="eyebrow">Your saved picks</p>
          <h1>My Watchlist</h1>
        </div>
        <div className="header-stat">{watchlistItems.length} titles</div>
      </header>

      <section className="search-panel compact-panel">
        <label className="search-input-wrap" htmlFor="watchlist-search">
          <Search size={16} />
          <input
            id="watchlist-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your watchlist"
          />
        </label>

        <div className="filters-grid">
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="want-to-watch">Want to Watch</option>
            <option value="currently-watching">Currently Watching</option>
            <option value="watched">Watched</option>
            <option value="on-hold">On Hold</option>
            <option value="dropped">Dropped</option>
          </select>

          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="recent">Recently added</option>
            <option value="title">Title</option>
            <option value="year">Release year</option>
            <option value="rating">External rating</option>
          </select>
        </div>
      </section>

      {visibleItems.length > 0 ? (
        <ContentRow
          title="Saved titles"
          items={visibleItems}
          metaMap={entries}
          onOpenDetails={onOpenDetails}
          onToggleWatchlist={onToggleWatchlist}
          onToggleFavourite={onToggleFavourite}
          onStatusChange={onStatusChange}
        />
      ) : (
        <div className="empty-state">
          <h3>Your watchlist is empty.</h3>
          <p>Save titles you want to revisit later from the discover page or details view.</p>
        </div>
      )}
    </div>
  )
}
