export function getFavouriteGenres(titles = []) {
  return [...new Set(titles.flatMap((title) => title.genres || []))]
}

export function buildRecommendations({ catalog, entries, limit = 8 }) {
  const userShows = []
  const favTitles = []
  const watchlistTitles = []
  const ratedTitles = []
  const genreWeight = new Map()
  const mediaWeight = new Map()
  const languageWeight = new Map()
  const regionWeight = new Map()

  Object.entries(entries || {}).forEach(([id, value]) => {
    if (!value || !value.titleId) return
    const title = catalog.find((item) => item.id === id)
    if (!title) return

    if (value.favourite) {
      favTitles.push(title)
    }

    if (value.status && value.status !== 'not-interested' && value.status !== 'dropped') {
      watchlistTitles.push(title)
    }

    if (value.status === 'watched') {
      userShows.push(title)
    }

    if (Number.isFinite(Number(value.personalRating))) {
      const rating = Number(value.personalRating)
      ratedTitles.push({ title, rating })
    }
  })

  const allLikedTitles = [...favTitles, ...userShows, ...watchlistTitles]

  allLikedTitles.forEach((title) => {
    const genres = Array.isArray(title.genres) ? title.genres : []
    genres.forEach((genre) => {
      genreWeight.set(genre, (genreWeight.get(genre) || 0) + 2)
    })

    mediaWeight.set(title.mediaType, (mediaWeight.get(title.mediaType) || 0) + 1)
    if (title.language) languageWeight.set(title.language, (languageWeight.get(title.language) || 0) + 1)
    if (title.region) regionWeight.set(title.region, (regionWeight.get(title.region) || 0) + 1)
  })

  ratedTitles.forEach(({ title, rating }) => {
    const genres = Array.isArray(title.genres) ? title.genres : []
    genres.forEach((genre) => {
      genreWeight.set(genre, (genreWeight.get(genre) || 0) + Math.max(2, rating))
    })
  })

  const dislikedIds = new Set()
  Object.entries(entries || {}).forEach(([id, value]) => {
    if (!value) return
    if (value.status === 'watched' || value.status === 'dropped' || value.status === 'not-interested') {
      dislikedIds.add(id)
    }
  })

  const scored = catalog
    .filter((title) => !dislikedIds.has(title.id) && !allLikedTitles.some((liked) => liked.id === title.id))
    .map((title) => {
      let score = 10
      const reasons = []

      const sharedGenreMatches = (title.genres || []).filter((genre) => genreWeight.has(genre))
      if (sharedGenreMatches.length > 0) {
        score += sharedGenreMatches.length * 16
        reasons.push(`This matches ${sharedGenreMatches.slice(0, 2).join(' and ')} — genres you have already rated or saved.`)
      }

      const highlyRatedShared = ratedTitles.filter(({ title: ratedTitle }) => {
        const shared = (title.genres || []).filter((genre) => (ratedTitle.genres || []).includes(genre))
        return shared.length > 0 && ratedTitle.id !== title.id
      })

      if (highlyRatedShared.length > 0) {
        const strongest = highlyRatedShared.sort((a, b) => b.rating - a.rating)[0]
        score += 10
        reasons.push(`You rated ${strongest.title.title} ${strongest.rating}/10, and this shares its genre mix.`)
      }

      const favouriteMatches = favTitles.filter((fav) => (fav.genres || []).some((genre) => (title.genres || []).includes(genre)))
      if (favouriteMatches.length > 0) {
        score += 12
        reasons.push(`It overlaps with ${favouriteMatches[0].title} and genres you keep as favourites.`)
      }

      if (watchlistTitles.some((saved) => (saved.genres || []).some((genre) => (title.genres || []).includes(genre)))) {
        score += 7
        reasons.push('It matches the kinds of films and shows you keep adding to your watchlist.')
      }

      if (title.mediaType && mediaWeight.has(title.mediaType)) {
        score += 6
        reasons.push(`Your activity leans toward ${title.mediaType} titles.`)
      }

      if (title.language && languageWeight.has(title.language)) {
        score += 5
        reasons.push(`This uses ${title.language}, a language you have already explored.`)
      }

      if (title.region && regionWeight.has(title.region)) {
        score += 4
        reasons.push(`This comes from ${title.region}, a region you have already shown interest in.`)
      }

      if (title.externalRating && title.externalRating >= 8.2) {
        score += 3
      }

      return {
        ...title,
        score,
        reasons: reasons.length > 0 ? reasons.slice(0, 3) : ['This is a strong fit for your current taste profile.'],
        reason: reasons[0] || 'This is a strong fit for your current taste profile.',
      }
    })
    .sort((a, b) => b.score - a.score)

  const diversified = []
  const seenGenres = new Set()

  scored.forEach((entry) => {
    const uniqueGenres = (entry.genres || []).filter((genre) => !seenGenres.has(genre))
    const shouldAdd = diversified.length < limit && (!entry.genres || uniqueGenres.length > 0 || diversified.length === 0)

    if (shouldAdd) {
      diversified.push(entry)
      ;(entry.genres || []).forEach((genre) => seenGenres.add(genre))
    }
  })

  if (diversified.length === 0) {
    return catalog
      .filter((title) => !dislikedIds.has(title.id))
      .slice(0, Math.min(limit, catalog.length))
      .map((title, index) => ({
        ...title,
        reasons: ['Starter recommendation while your watch habits grow.'],
        reason: 'Starter recommendation while your watch habits grow.',
        score: limit - index,
      }))
  }

  return diversified.slice(0, limit)
}
