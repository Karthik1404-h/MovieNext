import { useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'

export default function TonightPage({ catalog, entries, onOpenDetails, onToggleWatchlist, onMarkWatched }) {
  const [mediaType, setMediaType] = useState('all')
  const [genre, setGenre] = useState('all')
  const [language, setLanguage] = useState('all')
  const [timeLimit, setTimeLimit] = useState('all')
  const [excludeWatched, setExcludeWatched] = useState(true)
  const [excludeNotInterested, setExcludeNotInterested] = useState(true)
  const [pickIndex, setPickIndex] = useState(0)

  const genres = [...new Set(catalog.flatMap((item) => item.genres || []))]
  const languages = [...new Set(catalog.map((item) => item.language))]

  const eligibleTitles = useMemo(() => {
    return catalog.filter((item) => {
      const meta = entries[item.id] || {}
      const matchesType = mediaType === 'all' || item.mediaType === mediaType
      const matchesGenre = genre === 'all' || item.genres.includes(genre)
      const matchesLanguage = language === 'all' || item.language === language
      const runtimeLimit = timeLimit === 'all' ? Infinity : Number(timeLimit)
      const matchesRuntime = item.runtime ? item.runtime <= runtimeLimit : true
      const isWatched = meta.status === 'watched'
      const isNotInterested = meta.status === 'not-interested'

      return (
        matchesType &&
        matchesGenre &&
        matchesLanguage &&
        matchesRuntime &&
        (!excludeWatched || !isWatched) &&
        (!excludeNotInterested || !isNotInterested)
      )
    })
  }, [catalog, entries, mediaType, genre, language, timeLimit, excludeWatched, excludeNotInterested])

  const suggestion = eligibleTitles[pickIndex % Math.max(eligibleTitles.length, 1)] || null

  function pickAnother() {
    if (!eligibleTitles.length) return
    setPickIndex((current) => (current + 1) % eligibleTitles.length)
  }

  function surpriseMe() {
    if (!eligibleTitles.length) return
    const randomIndex = Math.floor(Math.random() * eligibleTitles.length)
    setPickIndex(randomIndex)
  }

  return (
    <div className="page-block">
      <header className="page-header">
        <div>
          <p className="eyebrow">Decision time</p>
          <h1>What should I watch tonight?</h1>
        </div>
      </header>

      <section className="search-panel compact-panel">
        <div className="filters-grid">
          <select value={mediaType} onChange={(event) => setMediaType(event.target.value)}>
            <option value="all">Any media</option>
            <option value="movie">Movies</option>
            <option value="tv">TV shows</option>
            <option value="anime">Anime</option>
          </select>

          <select value={genre} onChange={(event) => setGenre(event.target.value)}>
            <option value="all">Any genre</option>
            {genres.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <select value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option value="all">Any language</option>
            {languages.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <select value={timeLimit} onChange={(event) => setTimeLimit(event.target.value)}>
            <option value="all">Any runtime</option>
            <option value={90}>Up to 90 min</option>
            <option value={120}>Up to 2 hours</option>
            <option value={150}>Up to 2.5 hours</option>
            <option value={180}>Up to 3 hours</option>
          </select>

          <label className="check-row">
            <input type="checkbox" checked={excludeWatched} onChange={() => setExcludeWatched((value) => !value)} />
            Exclude watched
          </label>

          <label className="check-row">
            <input type="checkbox" checked={excludeNotInterested} onChange={() => setExcludeNotInterested((value) => !value)} />
            Exclude not interested
          </label>
        </div>
      </section>

      {suggestion ? (
        <article className="tonight-card">
          <img src={suggestion.poster} alt={suggestion.title} />
          <div className="tonight-content">
            <div className="tonight-topline">
              <span className="pill">{suggestion.mediaType}</span>
              <span>{suggestion.year}</span>
            </div>
            <h2>{suggestion.title}</h2>
            <p className="overview-copy">{suggestion.overview}</p>
            <div className="recommendation-meta">
              <span>{suggestion.genres?.join(' • ')}</span>
              <span>{suggestion.language}</span>
            </div>
            <p className="reason-line">Because this fits your {suggestion.mediaType} mood and matches your {suggestion.genres[0]} preferences.</p>

            <div className="mini-actions">
              <button type="button" className="primary-button small-button" onClick={pickAnother}>
                Pick another
              </button>
              <button type="button" className="secondary-button small-button" onClick={() => onToggleWatchlist(suggestion.id)}>
                Add to watchlist
              </button>
              <button type="button" className="secondary-button small-button" onClick={() => onMarkWatched(suggestion.id)}>
                Mark watched
              </button>
              <button type="button" className="ghost-button small" onClick={() => onOpenDetails(suggestion)}>
                View details
              </button>
              <button type="button" className="ghost-button small" onClick={surpriseMe}>
                Surprise me
              </button>
            </div>
          </div>
        </article>
      ) : (
        <div className="empty-state">
          <Sparkles size={36} />
          <h3>No eligible title matches that filter set.</h3>
          <p>Relax the time limit or include more genres to discover a better evening pick.</p>
        </div>
      )}
    </div>
  )
}
