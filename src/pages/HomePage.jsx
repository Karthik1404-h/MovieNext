import { useEffect, useMemo, useState } from 'react'
import { BookmarkPlus, Play, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import ContentRow from '../components/ContentRow'
import { getTmdbFallbackBackdrop, getTmdbHomeSections, hasTmdbConfig } from '../services/tmdb'

function getSectionItems(items, predicate) {
  return items.filter(predicate)
}

export default function HomePage({ catalog, entries, onOpenDetails, onToggleWatchlist, onToggleFavourite, onStatusChange }) {
  const [tmdbSections, setTmdbSections] = useState(null)
  const [tmdbError, setTmdbError] = useState('')

  useEffect(() => {
    if (!hasTmdbConfig()) {
      return undefined
    }

    let active = true

    async function loadSections() {
      try {
        const data = await getTmdbHomeSections()
        if (active) {
          setTmdbSections(data)
          setTmdbError('')
        }
      } catch {
        if (active) {
          setTmdbError('Live TMDB sections are temporarily unavailable. The local catalogue remains available.')
        }
      }
    }

    loadSections()
    return () => {
      active = false
    }
  }, [])

  const featuredTitle = useMemo(() => {
    if (tmdbSections?.trending?.length) {
      return tmdbSections.trending[0]
    }
    return catalog.find((item) => item.featured) || catalog[0]
  }, [catalog, tmdbSections])

  const featuredMeta = entries[featuredTitle.id] || {}
  const heroBackground = featuredTitle.backdrop || featuredTitle.poster || getTmdbFallbackBackdrop(featuredTitle.title)

  const continueWatching = getSectionItems(catalog, (item) => (entries[item.id]?.status || '') === 'currently-watching')
  const trending = tmdbSections?.trending?.length ? tmdbSections.trending : [...catalog].sort((a, b) => (b.externalRating || 0) - (a.externalRating || 0)).slice(0, 6)
  const popularMovies = tmdbSections?.popularMovies?.length ? tmdbSections.popularMovies : catalog.filter((item) => item.mediaType === 'movie').slice(0, 6)
  const popularTv = tmdbSections?.popularTv?.length ? tmdbSections.popularTv : catalog.filter((item) => item.mediaType === 'tv').slice(0, 6)
  const anime = tmdbSections?.anime?.length ? tmdbSections.anime : catalog.filter((item) => item.mediaType === 'anime').slice(0, 6)
  const indianCinema = tmdbSections?.indianCinema?.length ? tmdbSections.indianCinema : catalog.filter((item) => item.region === 'India').slice(0, 6)
  const favouriteItems = catalog.filter((item) => entries[item.id]?.favourite).slice(0, 6)
  const recentWatchlist = catalog.filter((item) => entries[item.id]?.status && entries[item.id].status !== 'not-interested').slice(0, 6)

  return (
    <div className="home-page">
      <section className="hero-section" style={{ backgroundImage: `linear-gradient(90deg, rgba(8,8,12,0.8), rgba(8,8,12,0.3)), url(${heroBackground})` }}>
        <div className="hero-copy">
          <p className="eyebrow">Featured tonight</p>
          <h1>{featuredTitle.title}</h1>
          <div className="hero-meta">
            <span>{featuredTitle.year}</span>
            <span>{featuredTitle.mediaType}</span>
            <span>{featuredTitle.genres?.join(' • ')}</span>
          </div>
          <p className="hero-overview">{featuredTitle.overview}</p>
          <div className="hero-actions">
            <button type="button" className="primary-button" onClick={() => onOpenDetails(featuredTitle)}>
              <Play size={16} />
              View Details
            </button>
            <button type="button" className="secondary-button" onClick={() => onToggleWatchlist(featuredTitle.id)}>
              <BookmarkPlus size={16} />
              {featuredMeta.status && featuredMeta.status !== 'not-interested' && featuredMeta.status !== 'dropped' ? 'Saved' : 'Add to Watchlist'}
            </button>
          </div>
          {featuredTitle.externalRating ? (
            <div className="rank-row">
              <Star size={15} />
              {featuredTitle.externalRating.toFixed(1)} external rating
            </div>
          ) : null}
        </div>
      </section>

      {tmdbError ? <div className="empty-state compact-state"><p>{tmdbError}</p></div> : null}

      <div className="content-stack">
        {continueWatching.length > 0 ? (
          <ContentRow
            title="Continue Watching"
            items={continueWatching}
            metaMap={entries}
            onOpenDetails={onOpenDetails}
            onToggleWatchlist={onToggleWatchlist}
            onToggleFavourite={onToggleFavourite}
            onStatusChange={onStatusChange}
          />
        ) : null}

        <ContentRow
          title="Trending Now"
          items={trending}
          metaMap={entries}
          onOpenDetails={onOpenDetails}
          onToggleWatchlist={onToggleWatchlist}
          onToggleFavourite={onToggleFavourite}
          onStatusChange={onStatusChange}
        />

        <ContentRow
          title="Popular Movies"
          items={popularMovies}
          metaMap={entries}
          onOpenDetails={onOpenDetails}
          onToggleWatchlist={onToggleWatchlist}
          onToggleFavourite={onToggleFavourite}
          onStatusChange={onStatusChange}
        />

        <ContentRow
          title="Anime to Explore"
          items={anime}
          metaMap={entries}
          onOpenDetails={onOpenDetails}
          onToggleWatchlist={onToggleWatchlist}
          onToggleFavourite={onToggleFavourite}
          onStatusChange={onStatusChange}
        />

        <ContentRow
          title="Indian Cinema"
          items={indianCinema}
          metaMap={entries}
          onOpenDetails={onOpenDetails}
          onToggleWatchlist={onToggleWatchlist}
          onToggleFavourite={onToggleFavourite}
          onStatusChange={onStatusChange}
        />

        {recentWatchlist.length > 0 ? (
          <ContentRow
            title="Recently Added to My Watchlist"
            items={recentWatchlist}
            metaMap={entries}
            onOpenDetails={onOpenDetails}
            onToggleWatchlist={onToggleWatchlist}
            onToggleFavourite={onToggleFavourite}
            onStatusChange={onStatusChange}
          />
        ) : null}

        {favouriteItems.length > 0 ? (
          <ContentRow
            title="Your Favourites"
            items={favouriteItems}
            metaMap={entries}
            onOpenDetails={onOpenDetails}
            onToggleWatchlist={onToggleWatchlist}
            onToggleFavourite={onToggleFavourite}
            onStatusChange={onStatusChange}
          />
        ) : null}

        <ContentRow
          title="Popular TV Shows"
          items={popularTv}
          metaMap={entries}
          onOpenDetails={onOpenDetails}
          onToggleWatchlist={onToggleWatchlist}
          onToggleFavourite={onToggleFavourite}
          onStatusChange={onStatusChange}
        />

        <section className="mini-cta">
          <div>
            <p className="eyebrow">Need a quick pick?</p>
            <h3>Let MovieNext choose your next watch.</h3>
          </div>
          <Link to="/tonight" className="primary-button inline-link">
            What should I watch tonight?
          </Link>
        </section>
      </div>
    </div>
  )
}
