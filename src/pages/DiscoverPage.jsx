import { useEffect, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import ContentRow from '../components/ContentRow'
import { discoverTmdb, getTmdbGenres, hasTmdbConfig } from '../services/tmdb'

const languageOptions = ['English', 'Hindi', 'Japanese', 'Korean', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'French', 'Spanish']
const originCountryOptions = [
  { value: 'all', label: 'Any origin country' },
  { value: 'IN', label: 'India' },
  { value: 'JP', label: 'Japan' },
  { value: 'KR', label: 'South Korea' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'FR', label: 'France' },
  { value: 'ES', label: 'Spain' },
  { value: 'DE', label: 'Germany' },
]

function applyLocalSort(items, entries, sortBy) {
  return [...items].sort((a, b) => {
    if (sortBy === 'year') return (b.year || 0) - (a.year || 0)
    if (sortBy === 'rating') return (b.externalRating || 0) - (a.externalRating || 0)
    if (sortBy === 'user') return (entries[b.id]?.personalRating || 0) - (entries[a.id]?.personalRating || 0)
    if (sortBy === 'title') return String(a.title).localeCompare(String(b.title))
    return (b.year || 0) - (a.year || 0)
  })
}

export default function DiscoverPage({ catalog, entries, onOpenDetails, onToggleWatchlist, onToggleFavourite, onStatusChange }) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [mediaType, setMediaType] = useState('all')
  const [genre, setGenre] = useState('all')
  const [language, setLanguage] = useState('all')
  const [originCountry, setOriginCountry] = useState('all')
  const [releaseYear, setReleaseYear] = useState('')
  const [minRating, setMinRating] = useState('')
  const [status, setStatus] = useState('all')
  const [favouriteOnly, setFavouriteOnly] = useState(false)
  const [sortBy, setSortBy] = useState('title')
  const [tmdbResults, setTmdbResults] = useState([])
  const [tmdbGenres, setTmdbGenres] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (!hasTmdbConfig()) {
      return undefined
    }

    let active = true

    async function fetchLiveResults() {
      try {
        setLoading(true)
        setError('')

        let nextResults = []
        const requestedMediaType = mediaType === 'all' ? 'movie' : mediaType

        if (debouncedQuery) {
          nextResults = await discoverTmdb({ query: debouncedQuery, page: 1, mediaType: requestedMediaType, genre, language, originCountry, releaseYear, minRating })
        } else if (mediaType === 'all') {
          const [movieResults, tvResults] = await Promise.all([
            discoverTmdb({ page: 1, mediaType: 'movie', genre, language, originCountry, releaseYear, minRating }),
            discoverTmdb({ page: 1, mediaType: 'tv', genre, language, originCountry, releaseYear, minRating }),
          ])
          nextResults = [...movieResults, ...tvResults]
        } else {
          nextResults = await discoverTmdb({ page: 1, mediaType: requestedMediaType, genre, language, originCountry, releaseYear, minRating })
        }

        if (!active) {
          return
        }

        setTmdbResults(nextResults)
        setPage(1)
        setHasMore(nextResults.length >= 20)
      } catch (loadError) {
        if (!active) {
          return
        }

        setError(loadError.message || 'Unable to load TMDB results right now.')
        setTmdbResults([])
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchLiveResults()
    return () => {
      active = false
    }
  }, [debouncedQuery, mediaType, genre, language, originCountry, releaseYear, minRating])

  useEffect(() => {
    if (!hasTmdbConfig()) {
      return undefined
    }

    let active = true

    async function loadGenres() {
      try {
        const [movieGenres, tvGenres] = await Promise.all([
          getTmdbGenres('movie'),
          getTmdbGenres('tv'),
        ])

        if (!active) {
          return
        }

        const combined = [...movieGenres, ...tvGenres]
        const unique = [...new Map(combined.map((genre) => [genre.name, genre])).values()]
        setTmdbGenres(unique)
      } catch {
        setTmdbGenres([])
      }
    }

    loadGenres()
    return () => {
      active = false
    }
  }, [])

  const genreOptions = useMemo(() => {
    const combined = [...new Set([...catalog.flatMap((item) => item.genres || []), ...tmdbGenres.map((genre) => genre.name)])]
    return combined.sort((a, b) => a.localeCompare(b))
  }, [catalog, tmdbGenres])

  const allLanguages = useMemo(() => {
    const combined = [...new Set([...catalog.map((item) => item.language), ...languageOptions])]
    return combined.filter(Boolean).sort((a, b) => a.localeCompare(b))
  }, [catalog])

  const baseResults = useMemo(() => {
    if (hasTmdbConfig()) {
      if (error) {
        return catalog
      }

      if (tmdbResults.length > 0) {
        return tmdbResults
      }

      if (debouncedQuery || mediaType !== 'all' || genre !== 'all' || language !== 'all' || originCountry !== 'all' || releaseYear || minRating) {
        return tmdbResults
      }

      return tmdbResults.length > 0 ? tmdbResults : catalog
    }

    return catalog
  }, [catalog, debouncedQuery, error, mediaType, genre, language, originCountry, releaseYear, minRating, tmdbResults])

  const filteredTitles = useMemo(() => {
    const normalizedQuery = debouncedQuery.toLowerCase()

    return applyLocalSort(
      [...baseResults].filter((item) => {
        const matchesQuery =
          !normalizedQuery ||
          [item.title, item.originalTitle, item.overview, ...(item.genres || [])].some((value) =>
            String(value).toLowerCase().includes(normalizedQuery),
          )

        const matchesType = mediaType === 'all' || item.mediaType === mediaType || (mediaType === 'anime' && item.mediaType === 'anime')
        const matchesGenre = genre === 'all' || (item.genres || []).includes(genre)
        const matchesLanguage = language === 'all' || item.language === language || item.originalLanguage === language
        const matchesOrigin = originCountry === 'all' || item.originCountry === originCountry || item.region === originCountry || item.region === 'India' && originCountry === 'IN'
        const matchesYear = !releaseYear || Number(item.year) === Number(releaseYear)
        const matchesMinRating = !minRating || (item.externalRating || 0) >= Number(minRating)

        const meta = entries[item.id] || {}
        const matchesStatus = status === 'all' || meta.status === status
        const matchesFavourite = !favouriteOnly || Boolean(meta.favourite)

        return matchesQuery && matchesType && matchesGenre && matchesLanguage && matchesOrigin && matchesYear && matchesMinRating && matchesStatus && matchesFavourite
      }),
      entries,
      sortBy,
    )
  }, [baseResults, debouncedQuery, mediaType, genre, language, originCountry, releaseYear, minRating, entries, status, favouriteOnly, sortBy])

  async function handleLoadMore() {
    if (!hasTmdbConfig()) {
      return
    }

    const nextPage = page + 1
    setLoading(true)

    try {
      const requestedMediaType = mediaType === 'all' ? 'movie' : mediaType
      const nextResults = debouncedQuery
        ? await discoverTmdb({ query: debouncedQuery, page: nextPage, mediaType: requestedMediaType, genre, language, originCountry, releaseYear, minRating })
        : mediaType === 'all'
          ? [...(await discoverTmdb({ page: nextPage, mediaType: 'movie', genre, language, originCountry, releaseYear, minRating })), ...(await discoverTmdb({ page: nextPage, mediaType: 'tv', genre, language, originCountry, releaseYear, minRating }))]
          : await discoverTmdb({ page: nextPage, mediaType: requestedMediaType, genre, language, originCountry, releaseYear, minRating })

      const combined = [...tmdbResults, ...nextResults]
      const unique = [...new Map(combined.map((item) => [item.id, item])).values()]
      setTmdbResults(unique)
      setPage(nextPage)
      setHasMore(nextResults.length >= 20)
    } catch (loadError) {
      setError(loadError.message || 'Could not load more results.')
    } finally {
      setLoading(false)
    }
  }

  function resetFilters() {
    setQuery('')
    setDebouncedQuery('')
    setMediaType('all')
    setGenre('all')
    setLanguage('all')
    setOriginCountry('all')
    setReleaseYear('')
    setMinRating('')
    setStatus('all')
    setFavouriteOnly(false)
    setSortBy('title')
  }

  return (
    <div className="page-block">
      <header className="page-header">
        <div>
          <p className="eyebrow">Discovery</p>
          <h1>Explore the catalogue</h1>
        </div>
      </header>

      <section className="search-panel">
        <label className="search-input-wrap" htmlFor="catalog-search">
          <Search size={16} />
          <input
            id="catalog-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search titles, genres, or notes"
          />
          {query ? (
            <button type="button" className="clear-search" onClick={() => setQuery('')} aria-label="Clear search">
              <X size={14} />
            </button>
          ) : null}
        </label>

        <div className="filters-grid">
          <select value={mediaType} onChange={(event) => setMediaType(event.target.value)}>
            <option value="all">All</option>
            <option value="movie">Movies</option>
            <option value="tv">TV shows</option>
            <option value="anime">Anime</option>
          </select>

          <select value={genre} onChange={(event) => setGenre(event.target.value)}>
            <option value="all">All genres</option>
            {genreOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <select value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option value="all">All languages</option>
            {allLanguages.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <select value={originCountry} onChange={(event) => setOriginCountry(event.target.value)}>
            {originCountryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1900"
            max="2100"
            value={releaseYear}
            onChange={(event) => setReleaseYear(event.target.value)}
            placeholder="Year"
            aria-label="Release year"
          />

          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={minRating}
            onChange={(event) => setMinRating(event.target.value)}
            placeholder="Min rating"
            aria-label="Minimum rating"
          />

          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="want-to-watch">Want to Watch</option>
            <option value="currently-watching">Currently Watching</option>
            <option value="watched">Watched</option>
            <option value="on-hold">On Hold</option>
            <option value="dropped">Dropped</option>
          </select>

          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="title">Title</option>
            <option value="year">Release year</option>
            <option value="rating">TMDB rating</option>
            <option value="user">My rating</option>
          </select>

          <label className="check-row">
            <input type="checkbox" checked={favouriteOnly} onChange={() => setFavouriteOnly((value) => !value)} />
            Favourites only
          </label>

          <button type="button" className="secondary-button small-button" onClick={resetFilters}>
            Reset filters
          </button>
        </div>
      </section>

      {loading ? <div className="empty-state"><h3>Loading titles…</h3></div> : null}
      {error ? <div className="empty-state"><h3>Unable to load results.</h3><p>{error}</p></div> : null}

      {!loading && !error && filteredTitles.length > 0 ? (
        <>
          <ContentRow
            title={`${filteredTitles.length} titles found`}
            items={filteredTitles}
            metaMap={entries}
            onOpenDetails={onOpenDetails}
            onToggleWatchlist={onToggleWatchlist}
            onToggleFavourite={onToggleFavourite}
            onStatusChange={onStatusChange}
          />

          {hasTmdbConfig() && hasMore ? (
            <div className="pagination-row">
              <button type="button" className="primary-button" onClick={handleLoadMore} disabled={loading}>
                Load more
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {!loading && !error && filteredTitles.length === 0 ? (
        <div className="empty-state">
          <h3>No titles match your current filters.</h3>
          <p>Try broadening the search or clearing a few filters.</p>
        </div>
      ) : null}
    </div>
  )
}
