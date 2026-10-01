import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import ContentRow from '../components/ContentRow'

export default function FavouritesPage({ catalog, entries, onOpenDetails, onToggleWatchlist, onToggleFavourite, onStatusChange }) {
  const [query, setQuery] = useState('')

  const favouriteItems = useMemo(() => {
    return catalog.filter((item) => entries[item.id]?.favourite)
  }, [catalog, entries])

  const visibleItems = useMemo(() => {
    return favouriteItems.filter((item) => {
      if (!query) return true
      return [item.title, item.originalTitle, item.overview].some((value) =>
        String(value).toLowerCase().includes(query.trim().toLowerCase()),
      )
    })
  }, [favouriteItems, query])

  return (
    <div className="page-block">
      <header className="page-header">
        <div>
          <p className="eyebrow">Saved love list</p>
          <h1>Favourites</h1>
        </div>
        <div className="header-stat">{favouriteItems.length} favourites</div>
      </header>

      <section className="search-panel compact-panel">
        <label className="search-input-wrap" htmlFor="favourites-search">
          <Search size={16} />
          <input
            id="favourites-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your favourites"
          />
        </label>
      </section>

      {visibleItems.length > 0 ? (
        <ContentRow
          title="Your favourite titles"
          items={visibleItems}
          metaMap={entries}
          onOpenDetails={onOpenDetails}
          onToggleWatchlist={onToggleWatchlist}
          onToggleFavourite={onToggleFavourite}
          onStatusChange={onStatusChange}
        />
      ) : (
        <div className="empty-state">
          <h3>No favourites saved yet.</h3>
          <p>Mark the titles you love most to keep them close at hand.</p>
        </div>
      )}
    </div>
  )
}
