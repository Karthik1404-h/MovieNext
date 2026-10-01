const TMDB_BASE = 'https://api.themoviedb.org/3'
const IMAGE_BASE = 'https://image.tmdb.org/t/p'
const tmdbCache = new Map()

const LANGUAGE_LABELS = {
  en: 'English',
  hi: 'Hindi',
  ja: 'Japanese',
  ko: 'Korean',
  ta: 'Tamil',
  te: 'Telugu',
  ml: 'Malayalam',
  kn: 'Kannada',
  bn: 'Bengali',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  zh: 'Mandarin',
  mr: 'Marathi',
  gu: 'Gujarati',
}

const COUNTRY_LABELS = {
  IN: 'India',
  JP: 'Japan',
  KR: 'South Korea',
  US: 'United States',
  GB: 'United Kingdom',
  FR: 'France',
  ES: 'Spain',
  DE: 'Germany',
}

function getTmdbToken() {
  return import.meta.env.VITE_TMDB_ACCESS_TOKEN || import.meta.env.VITE_TMDB_API_KEY || ''
}

export function hasTmdbConfig() {
  return Boolean(getTmdbToken())
}

export function getTmdbFallbackPoster(title = 'MovieNext') {
  const safeTitle = String(title).slice(0, 22).replace(/&/g, '&amp;')
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#201632"/>
          <stop offset="55%" stop-color="#100d1d"/>
          <stop offset="100%" stop-color="#090b12"/>
        </linearGradient>
      </defs>
      <rect width="500" height="750" fill="url(#g)"/>
      <circle cx="395" cy="146" r="110" fill="rgba(164,126,255,0.22)"/>
      <path d="M85 610L220 285L330 480L407 380L425 610Z" fill="rgba(130,108,255,0.3)"/>
      <text x="250" y="640" font-size="40" fill="#F5F3FF" text-anchor="middle" font-family="Arial, sans-serif" letter-spacing="2">${safeTitle}</text>
    </svg>
  `
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function getTmdbFallbackBackdrop(title = 'MovieNext') {
  const safeTitle = String(title).slice(0, 18).replace(/&/g, '&amp;')
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#120d1c"/>
          <stop offset="60%" stop-color="#1d2133"/>
          <stop offset="100%" stop-color="#090b12"/>
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#bg)"/>
      <circle cx="1280" cy="190" r="220" fill="rgba(131,112,255,0.22)"/>
      <path d="M0 670L280 390L520 710L690 480L980 760L1210 430L1600 695V900H0Z" fill="rgba(99,130,255,0.2)"/>
      <text x="800" y="510" font-size="64" fill="#F5F3FF" text-anchor="middle" font-family="Arial, sans-serif" letter-spacing="5">${safeTitle}</text>
    </svg>
  `
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function normalizeTmdbImagePath(path) {
  if (typeof path !== 'string') {
    return null
  }

  const normalized = path.trim()
  if (!normalized || normalized === 'null' || normalized === 'undefined') {
    return null
  }

  return normalized.startsWith('/') ? normalized : `/${normalized}`
}

export function getTmdbImageUrl(path, size = 'w500') {
  const normalizedPath = normalizeTmdbImagePath(path)
  if (!normalizedPath) {
    return null
  }

  return `${IMAGE_BASE}/${size}${normalizedPath}`
}

export function getTmdbBackdropUrl(path, size = 'original') {
  const normalizedPath = normalizeTmdbImagePath(path)
  if (!normalizedPath) {
    return null
  }

  return `${IMAGE_BASE}/${size}${normalizedPath}`
}

async function fetchTmdb(endpoint, params = {}) {
  const token = getTmdbToken()

  if (!token) {
    throw new Error('TMDB access token is not configured.')
  }

  const url = new URL(`${TMDB_BASE}${endpoint}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`TMDB request failed for ${endpoint}: ${response.status}`)
  }

  return response.json()
}

function cachedFetch(key, fetcher) {
  if (tmdbCache.has(key)) {
    return tmdbCache.get(key)
  }

  const promise = fetcher()
  tmdbCache.set(key, promise)
  return promise
}

function resolveGenres(item) {
  if (Array.isArray(item.genres)) {
    return item.genres.map((genre) => genre.name)
  }

  if (Array.isArray(item.genre_ids)) {
    return item.genre_ids.map((id) => String(id))
  }

  return []
}

function resolveLanguageCode(item) {
  return item.original_language || item.originalLanguage || 'en'
}

function resolveOriginCountry(item) {
  if (Array.isArray(item.origin_country) && item.origin_country.length > 0) {
    return item.origin_country[0]
  }

  if (Array.isArray(item.production_countries) && item.production_countries.length > 0) {
    return item.production_countries[0].iso_3166_1 || item.production_countries[0].name || 'International'
  }

  return 'International'
}

function resolveLanguageLabel(languageCode) {
  if (!languageCode) {
    return 'Unknown'
  }

  return LANGUAGE_LABELS[languageCode.toLowerCase()] || languageCode.toUpperCase()
}

export function classifyTmdbTitle(item, fallbackMediaType = 'movie') {
  const genreNames = resolveGenres(item)
  const genreIds = Array.isArray(item.genre_ids) ? item.genre_ids : []
  const mediaType = item.media_type || fallbackMediaType

  const hasAnimationGenre = genreIds.includes(16) || genreNames.some((name) => /animation|anime/i.test(name))
  const isJapanese = (item.original_language || '').toLowerCase() === 'ja'

  if (mediaType === 'anime') {
    return 'anime'
  }

  // TMDB does not expose an authoritative anime flag for all titles.
  // This heuristic is intentionally conservative and should be revisited with a dedicated anime source later.
  if (hasAnimationGenre && (isJapanese || mediaType === 'tv')) {
    return 'anime'
  }

  return mediaType === 'tv' ? 'tv' : 'movie'
}

export function normalizeTmdbTitle(item, mediaType = 'movie') {
  const kind = classifyTmdbTitle(item, mediaType)
  const title = item.title || item.name || 'Untitled'
  const originalTitle = item.original_title || item.original_name || title
  const releaseDate = item.release_date || item.first_air_date || ''
  const languageCode = resolveLanguageCode(item)
  const originCountry = resolveOriginCountry(item)
  const posterPath = item.poster_path || item.posterPath || item.poster || null
  const backdropPath = item.backdrop_path || item.backdropPath || item.backdrop || null

  return {
    id: `tmdb-${kind}-${item.id}`,
    source: 'tmdb',
    sourceId: String(item.id),
    title,
    originalTitle,
    overview: item.overview || 'No overview is available for this title yet.',
    poster: getTmdbImageUrl(posterPath, 'w500'),
    backdrop: getTmdbBackdropUrl(backdropPath, 'original'),
    year: Number((releaseDate || '').slice(0, 4) || 0),
    mediaType: kind,
    genres: resolveGenres(item),
    language: resolveLanguageLabel(languageCode),
    originalLanguage: languageCode || 'Unknown',
    region: COUNTRY_LABELS[originCountry] || originCountry || 'International',
    originCountry: originCountry || 'International',
    runtime: item.runtime || item.episode_run_time?.[0] || (kind === 'tv' ? null : null),
    seasons: item.number_of_seasons || null,
    externalRating: Number.isFinite(item.vote_average) ? Number(item.vote_average) : null,
    featured: false,
  }
}

function dedupeById(items) {
  const seen = new Set()
  return items.filter((item) => {
    if (!item || seen.has(item.id)) {
      return false
    }

    seen.add(item.id)
    return true
  })
}

export async function searchTmdb(query, page = 1, mediaType = 'all', filters = {}) {
  const trimmedQuery = String(query || '').trim()
  if (!trimmedQuery) {
    return []
  }

  const response = await cachedFetch(`tmdb-search:${mediaType}:${trimmedQuery}:${page}`, () =>
    fetchTmdb('/search/multi', {
      query: trimmedQuery,
      page,
      include_adult: false,
      language: 'en-US',
    }),
  )

  const results = Array.isArray(response.results) ? response.results : []
  const effectiveMediaType = mediaType === 'anime' ? 'anime' : mediaType

  return dedupeById(
    results
      .filter((item) => item && item.media_type && item.media_type !== 'person')
      .filter((item) => {
        const normalizedMediaType = classifyTmdbTitle(item, item.media_type === 'tv' ? 'tv' : 'movie')

        if (effectiveMediaType !== 'all' && normalizedMediaType !== effectiveMediaType) {
          return false
        }

        const genreNames = resolveGenres(item)
        if (filters.genre && filters.genre !== 'all' && !genreNames.includes(filters.genre)) {
          return false
        }

        const languageValue = resolveLanguageLabel(item.original_language || 'en')
        if (filters.language && filters.language !== 'all' && languageValue !== filters.language) {
          return false
        }

        const countryValue = resolveOriginCountry(item)
        if (filters.originCountry && filters.originCountry !== 'all' && countryValue !== filters.originCountry) {
          return false
        }

        if (filters.releaseYear && Number(filters.releaseYear) > 0) {
          const year = Number((item.release_date || item.first_air_date || '').slice(0, 4) || 0)
          if (year !== Number(filters.releaseYear)) {
            return false
          }
        }

        if (filters.minRating && Number(item.vote_average || 0) < Number(filters.minRating)) {
          return false
        }

        return true
      })
      .map((item) => normalizeTmdbTitle(item, item.media_type === 'tv' ? 'tv' : 'movie')),
  )
}

export async function discoverTmdb({
  page = 1,
  mediaType = 'movie',
  query = '',
  genre = '',
  language = '',
  originCountry = '',
  releaseYear = '',
  minRating = '',
  sortBy = 'popularity.desc',
}) {
  if (query && String(query).trim()) {
    return searchTmdb(query, page, mediaType, {
      genre,
      language,
      originCountry,
      releaseYear,
      minRating,
    })
  }

  const isAnime = mediaType === 'anime'
  const endpoint = isAnime ? '/discover/movie' : mediaType === 'tv' ? '/discover/tv' : '/discover/movie'

  const params = {
    page,
    sort_by: sortBy,
    include_adult: false,
    with_original_language: language || undefined,
    region: originCountry || undefined,
    primary_release_year: releaseYear || undefined,
    'vote_average.gte': minRating || undefined,
    with_genres: isAnime ? '16' : genre || undefined,
    with_origin_country: originCountry || undefined,
  }

  const response = await cachedFetch(`tmdb-discover:${mediaType}:${page}:${genre || 'all'}:${language || 'all'}:${originCountry || 'all'}:${releaseYear || 'all'}:${minRating || 'all'}`, () =>
    fetchTmdb(endpoint, params),
  )

  const results = Array.isArray(response.results) ? response.results : []

  return dedupeById(
    results
      .filter((item) => item && !item.adult)
      .filter((item) => {
        const normalizedMediaType = classifyTmdbTitle(item, mediaType)
        if (mediaType !== 'all' && normalizedMediaType !== mediaType) {
          return mediaType === 'anime' ? normalizedMediaType === 'anime' : false
        }
        return true
      })
      .map((item) => normalizeTmdbTitle(item, mediaType === 'tv' ? 'tv' : 'movie')),
  )
}

export async function getTmdbGenres(mediaType = 'movie') {
  const response = await cachedFetch(`tmdb-genres:${mediaType}`, () =>
    fetchTmdb(`/genre/${mediaType}/list`),
  )
  return Array.isArray(response.genres) ? response.genres : []
}

export async function getTmdbDetails(mediaType, id) {
  const endpoint = mediaType === 'tv' ? `/tv/${id}` : `/movie/${id}`
  const response = await cachedFetch(`tmdb-detail:${mediaType}:${id}`, () => fetchTmdb(endpoint))
  return normalizeTmdbTitle(response, mediaType)
}

export async function getTmdbHomeSections() {
  const response = await Promise.all([
    cachedFetch('tmdb-trending:week', () => fetchTmdb('/trending/all/week')),
    cachedFetch('tmdb-movie-popular', () => fetchTmdb('/movie/popular', { page: 1 })),
    cachedFetch('tmdb-tv-popular', () => fetchTmdb('/tv/popular', { page: 1 })),
    cachedFetch('tmdb-movie-top-rated', () => fetchTmdb('/movie/top_rated', { page: 1 })),
    cachedFetch('tmdb-india-movies', () => fetchTmdb('/discover/movie', { page: 1, with_origin_country: 'IN', sort_by: 'popularity.desc' })),
    cachedFetch('tmdb-anime', () => fetchTmdb('/discover/movie', { page: 1, with_genres: '16', sort_by: 'popularity.desc' })),
  ])

  return {
    trending: (response[0]?.results || []).map((item) => normalizeTmdbTitle(item, item.media_type === 'tv' ? 'tv' : 'movie')).slice(0, 8),
    popularMovies: (response[1]?.results || []).map((item) => normalizeTmdbTitle(item, 'movie')).slice(0, 8),
    popularTv: (response[2]?.results || []).map((item) => normalizeTmdbTitle(item, 'tv')).slice(0, 8),
    topRated: (response[3]?.results || []).map((item) => normalizeTmdbTitle(item, 'movie')).slice(0, 8),
    indianCinema: (response[4]?.results || []).map((item) => normalizeTmdbTitle(item, 'movie')).slice(0, 8),
    anime: (response[5]?.results || []).map((item) => normalizeTmdbTitle(item, 'movie')).slice(0, 8),
  }
}
