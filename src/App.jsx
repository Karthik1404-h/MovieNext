import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import TitleDetailsModal from './components/TitleDetailsModal'
import DiscoverPage from './pages/DiscoverPage'
import FavouritesPage from './pages/FavouritesPage'
import HomePage from './pages/HomePage'
import RecommendationsPage from './pages/RecommendationsPage'
import TonightPage from './pages/TonightPage'
import WatchedPage from './pages/WatchedPage'
import WatchlistPage from './pages/WatchlistPage'
import { sampleCatalog } from './data/catalog'
import { loadUserState, mergeUserEntry, saveUserState } from './data/storage'
import { discoverTmdb, hasTmdbConfig } from './services/tmdb'

function App() {
  const [catalog, setCatalog] = useState(sampleCatalog)
  const [userState, setUserState] = useState(() => loadUserState())
  const [selectedTitleId, setSelectedTitleId] = useState(null)

  useEffect(() => {
    if (!hasTmdbConfig()) {
      return undefined
    }

    let active = true

    async function hydrateTmdbCatalog() {
      try {
        const [movieResults, tvResults] = await Promise.all([
          discoverTmdb({ mediaType: 'movie', page: 1 }),
          discoverTmdb({ mediaType: 'tv', page: 1 }),
        ])

        if (!active) {
          return
        }

        const liveCatalog = [...movieResults, ...tvResults].slice(0, 18)
        setCatalog((current) => [...sampleCatalog, ...current.filter((item) => item.source !== 'tmdb'), ...liveCatalog])
      } catch {
        if (active) {
          setCatalog(sampleCatalog)
        }
      }
    }

    hydrateTmdbCatalog()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    saveUserState(userState)
  }, [userState])

  const entries = userState.entries || {}

  function updateMeta(titleId, patch) {
    setUserState((current) => {
      const nextState = mergeUserEntry(current, titleId, patch)

      if (!nextState.entries[titleId].dateAdded && nextState.entries[titleId].status && nextState.entries[titleId].status !== 'not-interested') {
        nextState.entries[titleId].dateAdded = new Date().toISOString().slice(0, 10)
      }

      return nextState
    })
  }

  function onToggleWatchlist(titleId) {
    const meta = entries[titleId] || {}

    if (meta.status === 'watched') {
      return
    }

    const isSaved = meta.status && meta.status !== 'not-interested' && meta.status !== 'dropped'
    const nextStatus = isSaved ? 'not-interested' : 'want-to-watch'

    updateMeta(titleId, {
      status: nextStatus,
      dateAdded: meta.dateAdded || new Date().toISOString().slice(0, 10),
    })
  }

  function onToggleFavourite(titleId) {
    const meta = entries[titleId] || {}
    updateMeta(titleId, {
      favourite: !meta.favourite,
    })
  }

  function onStatusChange(titleId, status) {
    const currentMeta = entries[titleId] || {}
    const nextEntry = {
      status,
      dateAdded: currentMeta.dateAdded || new Date().toISOString().slice(0, 10),
    }

    if (status === 'watched' && !currentMeta.dateWatched) {
      nextEntry.dateWatched = new Date().toISOString().slice(0, 10)
    }

    updateMeta(titleId, nextEntry)
  }

  function onMarkWatched(titleId) {
    updateMeta(titleId, {
      status: 'watched',
      dateWatched: new Date().toISOString().slice(0, 10),
      dateAdded: entries[titleId]?.dateAdded || new Date().toISOString().slice(0, 10),
    })
  }

  function onUpdateRating(titleId, value) {
    updateMeta(titleId, {
      personalRating: value || null,
    })
  }

  function onUpdateNotes(titleId, value) {
    const safeValue = typeof value === 'string' ? value : ''
    updateMeta(titleId, {
      review: safeValue,
      notes: safeValue,
    })
  }

  const selectedTitle = catalog.find((item) => item.id === selectedTitleId) || null
  const selectedMeta = selectedTitle ? entries[selectedTitle.id] || {} : {}

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                catalog={catalog}
                entries={entries}
                onOpenDetails={(item) => setSelectedTitleId(item.id)}
                onToggleWatchlist={onToggleWatchlist}
                onToggleFavourite={onToggleFavourite}
                onStatusChange={onStatusChange}
                onMarkWatched={onMarkWatched}
              />
            }
          />
          <Route
            path="/discover"
            element={
              <DiscoverPage
                catalog={catalog}
                entries={entries}
                onOpenDetails={(item) => setSelectedTitleId(item.id)}
                onToggleWatchlist={onToggleWatchlist}
                onToggleFavourite={onToggleFavourite}
                onStatusChange={onStatusChange}
              />
            }
          />
          <Route
            path="/watchlist"
            element={
              <WatchlistPage
                catalog={catalog}
                entries={entries}
                onOpenDetails={(item) => setSelectedTitleId(item.id)}
                onToggleWatchlist={onToggleWatchlist}
                onToggleFavourite={onToggleFavourite}
                onStatusChange={onStatusChange}
              />
            }
          />
          <Route
            path="/watched"
            element={
              <WatchedPage
                catalog={catalog}
                entries={entries}
                onOpenDetails={(item) => setSelectedTitleId(item.id)}
                onToggleWatchlist={onToggleWatchlist}
                onToggleFavourite={onToggleFavourite}
                onStatusChange={onStatusChange}
                onUpdateRating={onUpdateRating}
                onUpdateNotes={onUpdateNotes}
              />
            }
          />
          <Route
            path="/favourites"
            element={
              <FavouritesPage
                catalog={catalog}
                entries={entries}
                onOpenDetails={(item) => setSelectedTitleId(item.id)}
                onToggleWatchlist={onToggleWatchlist}
                onToggleFavourite={onToggleFavourite}
                onStatusChange={onStatusChange}
              />
            }
          />
          <Route
            path="/recommendations"
            element={
              <RecommendationsPage
                catalog={catalog}
                entries={entries}
                onOpenDetails={(item) => setSelectedTitleId(item.id)}
                onToggleWatchlist={onToggleWatchlist}
                onToggleFavourite={onToggleFavourite}
                onStatusChange={onStatusChange}
              />
            }
          />
          <Route
            path="/tonight"
            element={
              <TonightPage
                catalog={catalog}
                entries={entries}
                onOpenDetails={(item) => setSelectedTitleId(item.id)}
                onToggleWatchlist={onToggleWatchlist}
                onToggleFavourite={onToggleFavourite}
                onStatusChange={onStatusChange}
                onMarkWatched={onMarkWatched}
              />
            }
          />
        </Routes>
      </Layout>

      <TitleDetailsModal
        key={selectedTitle?.id || 'empty-details'}
        title={selectedTitle}
        meta={selectedMeta}
        onClose={() => setSelectedTitleId(null)}
        onToggleWatchlist={onToggleWatchlist}
        onToggleFavourite={onToggleFavourite}
        onStatusChange={onStatusChange}
        onUpdateNotes={onUpdateNotes}
      />
    </BrowserRouter>
  )
}

export default App
