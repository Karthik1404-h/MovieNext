const STORAGE_KEY = 'movienext-user-state'

export const STORAGE_VERSION = 2

export const defaultUserState = {
  version: STORAGE_VERSION,
  entries: {},
}

const validStatuses = new Set([
  'want-to-watch',
  'currently-watching',
  'watched',
  'on-hold',
  'dropped',
  'not-interested',
])

function normalizeDate(value) {
  if (typeof value !== 'string' || !value) return null
  return value.slice(0, 10)
}

export function normalizeEntry(entry = {}, fallbackId = null) {
  const source = entry && typeof entry === 'object' ? entry : {}
  const reviewText = typeof source.review === 'string'
    ? source.review
    : typeof source.notes === 'string'
      ? source.notes
      : ''

  const titleId = source.titleId || source.id || fallbackId || null
  const normalized = {
    titleId,
    status: validStatuses.has(source.status) ? source.status : 'not-interested',
    favourite: Boolean(source.favourite),
    personalRating: Number.isFinite(Number(source.personalRating))
      ? Math.min(10, Math.max(1, Number(source.personalRating)))
      : null,
    review: reviewText,
    notes: reviewText,
    dateWatched: normalizeDate(source.dateWatched),
    dateAdded: normalizeDate(source.dateAdded),
  }

  if (typeof source.source === 'string' && source.source.trim()) {
    normalized.source = source.source
  }

  if (source.sourceId !== undefined && source.sourceId !== null && source.sourceId !== '') {
    normalized.sourceId = String(source.sourceId)
  }

  if (typeof source.mediaType === 'string' && source.mediaType.trim()) {
    normalized.mediaType = source.mediaType
  }

  return normalized
}

export function normalizeUserState(raw) {
  if (!raw || typeof raw !== 'object') {
    return { ...defaultUserState }
  }

  const sourceEntries = raw.entries && typeof raw.entries === 'object' && !Array.isArray(raw.entries)
    ? raw.entries
    : raw

  const entries = {}

  Object.entries(sourceEntries).forEach(([id, value]) => {
    if (!value || typeof value !== 'object') {
      return
    }

    const normalized = normalizeEntry(value, id)
    if (normalized.titleId) {
      entries[normalized.titleId] = normalized
    }
  })

  return {
    version: STORAGE_VERSION,
    entries,
  }
}

export function mergeUserEntry(state, titleId, patch = {}) {
  const currentState = normalizeUserState(state)
  const previousEntry = currentState.entries[titleId] || {
    titleId,
    status: 'not-interested',
    favourite: false,
    personalRating: null,
    review: '',
    notes: '',
    dateAdded: null,
    dateWatched: null,
  }

  const merged = normalizeEntry({ ...previousEntry, ...patch }, titleId)

  return {
    version: STORAGE_VERSION,
    entries: {
      ...currentState.entries,
      [titleId]: merged,
    },
  }
}

export function loadUserState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { ...defaultUserState }
    }

    return normalizeUserState(JSON.parse(raw))
  } catch {
    return { ...defaultUserState }
  }
}

export function saveUserState(state) {
  try {
    const safeState = normalizeUserState(state)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeState))
    return true
  } catch {
    return false
  }
}

export function getEntryMeta(state, titleId) {
  const entry = state?.entries?.[titleId]

  if (entry) {
    return entry
  }

  return {
    titleId,
    status: 'not-interested',
    favourite: false,
    personalRating: null,
    review: '',
    notes: '',
    dateWatched: null,
    dateAdded: null,
    mediaType: null,
  }
}
