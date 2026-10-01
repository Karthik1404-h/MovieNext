import { useState } from 'react'
import { X, Star, Heart, BookmarkPlus, Calendar, Clock3, Globe, MapPin, PlayCircle } from 'lucide-react'
import { STATUS_OPTIONS } from '../data/catalog'
import { getTmdbFallbackBackdrop } from '../services/tmdb'

const statusLabelMap = Object.fromEntries(STATUS_OPTIONS.map((option) => [option.value, option.label]))

export default function TitleDetailsModal({ title, meta = {}, onClose, onStatusChange, onToggleFavourite, onToggleWatchlist, onUpdateNotes }) {
  const [reviewDraft, setReviewDraft] = useState(meta.review ?? meta.notes ?? '')
  const [saveMessage, setSaveMessage] = useState('')

  if (!title) {
    return null
  }

  const existingReview = meta.review ?? meta.notes ?? ''
  const reviewChanged = reviewDraft !== existingReview
  const heroBackground = title.backdrop || title.poster || getTmdbFallbackBackdrop(title.title)

  function handleSaveReview() {
    const nextValue = reviewDraft.trim()
    onUpdateNotes?.(title.id, nextValue)
    setReviewDraft(nextValue)
    setSaveMessage(nextValue ? 'Review saved' : 'Review cleared')
  }

  function handleCancelReview() {
    setReviewDraft(existingReview)
    setSaveMessage('')
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="details-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="close-button" onClick={onClose} aria-label="Close title details">
          <X size={18} />
        </button>

        <div className="details-hero" style={{ backgroundImage: `linear-gradient(180deg, rgba(10,10,15,0.2), rgba(10,10,15,0.9)), url(${heroBackground})` }}>
          <div className="details-overlay">
            <div className="details-badges">
              <span className="pill">{title.mediaType}</span>
              {title.externalRating ? (
                <span className="rating-pill">
                  <Star size={12} fill="currentColor" />
                  {title.externalRating.toFixed(1)}
                </span>
              ) : null}
            </div>

            <h2>{title.title}</h2>
            <p className="detail-subtitle">
              {title.originalTitle !== title.title ? `${title.originalTitle} • ` : ''}
              {title.year} • {title.language}
            </p>
          </div>
        </div>

        <div className="details-content">
          <div className="details-actions">
            <button type="button" className="primary-button" onClick={() => onToggleWatchlist(title.id)}>
              <BookmarkPlus size={16} />
              {meta.status && meta.status !== 'not-interested' && meta.status !== 'dropped' ? 'Saved to watchlist' : 'Add to watchlist'}
            </button>
            <button type="button" className={`secondary-button ${meta.favourite ? 'favourite' : ''}`} onClick={() => onToggleFavourite(title.id)}>
              <Heart size={16} fill={meta.favourite ? 'currentColor' : 'none'} />
              {meta.favourite ? 'Favourite' : 'Favourite'}
            </button>
          </div>

          <p className="overview-copy">{title.overview}</p>

          <div className="meta-grid">
            <div><Calendar size={14} /> <span>Year</span><strong>{title.year}</strong></div>
            <div><Clock3 size={14} /> <span>Runtime</span><strong>{title.runtime ? `${title.runtime} min` : title.seasons ? `${title.seasons} seasons` : 'N/A'}</strong></div>
            <div><Globe size={14} /> <span>Language</span><strong>{title.language}</strong></div>
            <div><MapPin size={14} /> <span>Region</span><strong>{title.region}</strong></div>
            <div><PlayCircle size={14} /> <span>Media</span><strong>{title.mediaType}</strong></div>
            <div><Star size={14} /> <span>TMDB Rating</span><strong>{title.externalRating ? `${title.externalRating.toFixed(1)}/10` : 'N/A'}</strong></div>
            <div><Star size={14} /> <span>My Rating</span><strong>{meta.personalRating ? `${meta.personalRating}/10` : 'Not rated'}</strong></div>
          </div>

          <div className="details-info-block">
            <h3>Genres</h3>
            <div className="genre-list">{(title.genres || []).map((genre) => <span key={genre} className="genre-tag">{genre}</span>)}</div>
          </div>

          <div className="details-info-block">
            <h3>Status</h3>
            <div className="status-shell">
              <select value={meta.status || 'not-interested'} onChange={(event) => onStatusChange(title.id, event.target.value)}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className={`status-badge ${meta.status || 'not-interested'}`}>{statusLabelMap[meta.status || 'not-interested']}</span>
            </div>
          </div>

          <div className="details-info-block">
            <h3>My review</h3>
            <label className="review-field">
              <span>Review</span>
              <textarea
                rows={4}
                value={reviewDraft}
                onChange={(event) => setReviewDraft(event.target.value)}
                placeholder="Write a personal review or note"
              />
            </label>
            <div className="review-actions">
              <button type="button" className="primary-button small-button" disabled={!reviewChanged} onClick={handleSaveReview}>
                Save Review
              </button>
              {reviewChanged ? (
                <button type="button" className="ghost-button small" onClick={handleCancelReview}>
                  Cancel
                </button>
              ) : null}
            </div>
            {saveMessage ? <small className="save-status">{saveMessage}</small> : null}
          </div>

          {existingReview ? (
            <div className="details-info-block">
              <h3>Saved review</h3>
              <p>{existingReview}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
