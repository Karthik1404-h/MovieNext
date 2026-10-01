import test from 'node:test'
import assert from 'node:assert/strict'

import { normalizeUserState, mergeUserEntry, STORAGE_VERSION } from './storage.js'
import { normalizeTmdbTitle } from '../services/tmdb.js'

test('normalizeUserState preserves per-title metadata and migrates legacy entries', () => {
  const migrated = normalizeUserState({
    version: 1,
    entries: {
      'legacy-title': {
        status: 'watched',
        favourite: true,
        personalRating: 9,
        notes: 'Great film',
        dateAdded: '2025-01-01',
        dateWatched: '2025-01-02',
      },
    },
  })

  assert.equal(migrated.version, STORAGE_VERSION)
  assert.deepEqual(migrated.entries['legacy-title'], {
    titleId: 'legacy-title',
    status: 'watched',
    favourite: true,
    personalRating: 9,
    review: 'Great film',
    notes: 'Great film',
    dateAdded: '2025-01-01',
    dateWatched: '2025-01-02',
  })
})

test('mergeUserEntry preserves existing review and status when updating notes', () => {
  const state = {
    version: STORAGE_VERSION,
    entries: {
      'movie-1': {
        titleId: 'movie-1',
        status: 'watched',
        favourite: true,
        personalRating: 8,
        review: 'Loved it',
        notes: 'Loved it',
        dateAdded: '2025-02-01',
        dateWatched: '2025-02-04',
      },
    },
  }

  const updated = mergeUserEntry(state, 'movie-1', { review: 'Updated review' })

  assert.equal(updated.entries['movie-1'].status, 'watched')
  assert.equal(updated.entries['movie-1'].favourite, true)
  assert.equal(updated.entries['movie-1'].personalRating, 8)
  assert.equal(updated.entries['movie-1'].review, 'Updated review')
  assert.equal(updated.entries['movie-1'].notes, 'Updated review')
})

test('normalizeTmdbTitle keeps valid TMDB poster paths and leaves missing posters null for graceful fallback', () => {
  const withPoster = normalizeTmdbTitle({ id: 360814, title: 'Dangal', poster_path: '/cJRPOLEexI7qp2DKtFfCh7YaaUG.jpg', backdrop_path: '/demo.jpg', vote_average: 7.8, original_language: 'hi', origin_country: ['IN'] })
  const withoutPoster = normalizeTmdbTitle({ id: 999999, title: 'No Poster Title', poster_path: null, backdrop_path: null, vote_average: 4.2, original_language: 'en' })

  assert.equal(withPoster.poster, 'https://image.tmdb.org/t/p/w500/cJRPOLEexI7qp2DKtFfCh7YaaUG.jpg')
  assert.equal(withPoster.backdrop, 'https://image.tmdb.org/t/p/original/demo.jpg')
  assert.equal(withoutPoster.poster, null)
  assert.equal(withoutPoster.backdrop, null)
})
