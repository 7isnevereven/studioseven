'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Project, Track, TrackBadge, getCoverUrl, ProjectRating, ARTISTS } from '@/data/projects'
import { supabase } from '@/utils/supabase'
import CollectibleWizard from '@/components/CollectibleWizard'
import VerifyCollectibleModal from '@/components/VerifyCollectibleModal'

const LOGO_URL = 'https://flrwvmfjjuyoyjeeosls.supabase.co/storage/v1/object/public/misc/ss7.png'

function ArrowLeftIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  )
}

function SpotifyIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

function StarIcon({ filled, onClick, onMouseEnter, onMouseLeave, size = 16 }: any) {
  return (
    <svg 
      width={size}
      height={size}
      viewBox="0 0 24 24" 
      fill={filled ? "#eab308" : "none"} 
      stroke={filled ? "#eab308" : "var(--text-faint)"} 
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, fill 0.2s ease',
        transform: filled && onClick ? 'scale(1.15)' : 'scale(1)',
        flexShrink: 0
      }}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

function Badge({ type }: { type: TrackBadge }) {
  const styles: Record<TrackBadge, { bg: string; text: string; border: string }> = {
    LEAD:   { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' },
    SINGLE: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
    BONUS:  { bg: 'rgba(234, 179, 8, 0.15)', text: '#facc15', border: 'rgba(234, 179, 8, 0.3)' },
    DELUXE: { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' },
    POEM:   { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.3)' }
  }
  const conf = styles[type] || styles.SINGLE
  return (
    <span
      className="liquid-badge"
      style={{
        background: conf.bg,
        color: conf.text,
        border: `1px solid ${conf.border}`
      }}
    >
      {type}
    </span>
  )
}

export default function ProjectPageClient({ project }: { project: Project }) {
  const [tab, setTab] = useState<'tracklist' | 'history' | 'ratings'>('tracklist')
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const [isLight, setIsLight] = useState(false)

  // Collectible Wizard Modal States
  const [showCollectibleWizard, setShowCollectibleWizard] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)

  const [allProjectRatings, setAllProjectRatings] = useState<ProjectRating[]>([])
  const [newRating, setNewRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewerName, setReviewerName] = useState('')
  const [reviewerDesc, setReviewerDesc] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isDeclassified = project.id === 'cuts-chances-declassified'
  const coverUrl = getCoverUrl(project.coverFile)
  const artist = ARTISTS.find(a => a.id === project.artistId)

  useEffect(() => {
    setIsLight(document.body.classList.contains('light-mode'))

    const fetchRatings = async () => {
      const { data, error } = await supabase.from('ratings')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false })
      if (!error && data) {
        setAllProjectRatings(data)
      }
    }

    fetchRatings()

    const channel = supabase.channel(`ratings_${project.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ratings', filter: `project_id=eq.${project.id}` }, () => {
        fetchRatings() 
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [project.id])

  const toggleTheme = () => {
    const nextIsLight = !isLight
    setIsLight(nextIsLight)
    if (nextIsLight) {
      document.body.classList.add('light-mode')
    } else {
      document.body.classList.remove('light-mode')
    }
  }

  const resetForm = () => {
    setNewRating(0)
    setHoverRating(0)
    setReviewerName('')
    setReviewerDesc('')
  }

  const submitRating = async () => {
    if (!newRating || !reviewerName.trim()) return
    setIsSubmitting(true)
    
    const { data, error } = await supabase.from('ratings').insert([{
      project_id: project.id,
      track_title: selectedTrack ? selectedTrack.title : null,
      rating: newRating,
      name: reviewerName.trim(),
      description: reviewerDesc.trim()
    }]).select()

    if (!error && data) {
      setAllProjectRatings(prev => {
        if (prev.some(r => r.id === data[0].id)) return prev
        return [data[0], ...prev]
      })
      resetForm()
    }
    setIsSubmitting(false)
  }

  const currentRatings = allProjectRatings.filter(r => 
    selectedTrack ? r.track_title === selectedTrack.title : r.track_title === null
  )
  const avgRating = currentRatings.length ? currentRatings.reduce((a, b) => a + b.rating, 0) / currentRatings.length : 0

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Floating Liquid Navbar */}
      <header className="navbar-wrapper">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/#projects" className="liquid-btn liquid-pill-sm" style={{ gap: 8, textDecoration: 'none' }}>
            <ArrowLeftIcon />
            <span>Projects</span>
          </Link>
          <Link href="/" title="studioseven" style={{ display: 'flex', alignItems: 'center' }}>
            <img src={LOGO_URL} alt="studioseven" className="brand-logo-img" />
          </Link>
        </div>

        <nav className="liquid-dock nav-links">
          <Link href="/" className="liquid-btn liquid-pill-sm" style={{ border: 'none', background: 'transparent' }}>Home</Link>
          <Link href="/#newsroom" className="liquid-btn liquid-pill-sm" style={{ border: 'none', background: 'transparent' }}>Newsroom</Link>
          <Link href="/#projects" className="liquid-btn liquid-pill-sm active" style={{ border: 'none' }}>Projects</Link>
          <Link href="/#artists" className="liquid-btn liquid-pill-sm" style={{ border: 'none', background: 'transparent' }}>Artists</Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={toggleTheme} className="liquid-btn liquid-icon-sm" title="Toggle theme">
            {isLight ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </header>

      {/* Navbar spacer for fixed header */}
      <div className="navbar-spacer" />

      {/* Main Project Full-Page Body */}
      <main style={{ maxWidth: 1180, margin: '0 auto', width: '100%', padding: '24px 28px 80px 28px', display: 'flex', flexDirection: 'column', gap: 48 }}>
        
        {/* Project Hero Banner */}
        <section
          className="liquid-glass-card"
          style={{
            padding: '36px 40px',
            display: 'grid',
            gridTemplateColumns: 'minmax(240px, 320px) 1fr',
            gap: 40,
            alignItems: 'center',
            borderColor: `${project.accentColor}35`,
          }}
        >
          {/* Cover Art */}
          <div style={{
            width: '100%',
            aspectRatio: '1',
            borderRadius: 24,
            overflow: 'hidden',
            backgroundColor: 'var(--bg-surface-solid)',
            border: '1px solid var(--glass-border-outer)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)'
          }}>
            {coverUrl && (
              <img src={coverUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="liquid-badge" style={{ background: 'var(--liquid-glass-hover)', color: 'var(--text-muted)', border: '1px solid var(--glass-border-outer)' }}>
                {project.type ? project.type.toUpperCase() : 'PROJECT'}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {project.releaseLabel}
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(28px, 4.5vw, 44px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: 'var(--text-main)'
            }}>
              {project.title}
            </h1>

            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              {artist && (
                <>Created by <Link href={`/artists/${artist.id}`} style={{ color: 'var(--text-main)', fontWeight: 600, textDecoration: 'none' }}>{artist.name}</Link> · </>
              )}
              {project.releaseLabel}
            </p>

            {/* Ratings Summary */}
            {avgRating > 0 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(234, 179, 8, 0.12)', border: '1px solid rgba(234, 179, 8, 0.3)', padding: '5px 12px', borderRadius: 99, width: 'fit-content' }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} filled={s <= Math.round(avgRating)} size={13} />)}
                </div>
                <span style={{ fontSize: 12.5, color: '#facc15', fontWeight: 700 }}>{avgRating.toFixed(1)}</span>
                <span style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>({allProjectRatings.length} reviews)</span>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
              {project.spotifyUrl && (
                <a
                  href={project.spotifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="liquid-btn liquid-pill"
                  style={{ gap: 8, color: '#22c55e', background: 'rgba(34, 197, 94, 0.08)', borderColor: 'rgba(34, 197, 94, 0.3)' }}
                >
                  <SpotifyIcon /> <span>Spotify</span>
                </a>
              )}
              {project.youtubeUrl && (
                <a
                  href={project.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="liquid-btn liquid-pill"
                  style={{ gap: 8, color: '#ef4444', background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  <YouTubeIcon /> <span>YouTube</span>
                </a>
              )}
              {isDeclassified && (
                <>
                  <button
                    onClick={() => setShowCollectibleWizard(true)}
                    className="liquid-btn liquid-pill"
                    style={{ gap: 8, color: '#facc15', borderColor: 'rgba(234, 179, 8, 0.4)' }}
                  >
                    <StarIcon filled={true} size={14} /> <span>Create Virtual Collectible</span>
                  </button>
                  <button
                    onClick={() => setShowVerifyModal(true)}
                    className="liquid-btn liquid-pill"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Verify Card
                  </button>
                </>
              )}
            </div>

          </div>
        </section>

        {/* Content Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--glass-border-subtle)', paddingBottom: 16 }}>
          <button
            onClick={() => { setTab('tracklist'); setSelectedTrack(null); resetForm(); }}
            className={`liquid-btn liquid-pill ${tab === 'tracklist' && !selectedTrack ? 'active' : ''}`}
          >
            Tracklist ({project.tracks.length})
          </button>
          <button
            onClick={() => { setTab('history'); setSelectedTrack(null); resetForm(); }}
            className={`liquid-btn liquid-pill ${tab === 'history' && !selectedTrack ? 'active' : ''}`}
          >
            History & Story
          </button>
          <button
            onClick={() => { setTab('ratings'); setSelectedTrack(null); resetForm(); }}
            className={`liquid-btn liquid-pill ${tab === 'ratings' && !selectedTrack ? 'active' : ''}`}
          >
            Reviews & Ratings ({allProjectRatings.length})
          </button>
        </div>

        {/* Selected Track Detail (Lyrics / Poem View) */}
        {selectedTrack ? (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                onClick={() => { setSelectedTrack(null); resetForm(); }}
                className="liquid-btn liquid-pill-sm"
                style={{ gap: 8 }}
              >
                <ArrowLeftIcon /> <span>Back to Full Tracklist</span>
              </button>
            </div>

            <div className="liquid-glass-card" style={{ padding: '36px 40px' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
                  {selectedTrack.title}
                </h2>
                <div style={{ display: 'flex', gap: 6 }}>
                  {selectedTrack.badges?.map(b => <Badge key={b} type={b} />)}
                </div>
              </div>

              {selectedTrack.content ? (
                <div style={{ marginTop: 24, fontSize: 16, lineHeight: 1.85, whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
                  {selectedTrack.content}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  No lyrics or written content available for this track.
                </p>
              )}
            </div>

            {/* Track Reviews */}
            <div className="liquid-glass-card" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--text-main)' }}>
                Track Ratings for "{selectedTrack.title}"
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <StarIcon 
                      key={star} 
                      size={24}
                      filled={star <= (hoverRating || newRating)}
                      onClick={() => setNewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  ))}
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>
                    {newRating ? `${newRating} of 5 Stars` : 'Tap stars to rate'}
                  </span>
                </div>
                <input 
                  type="text" 
                  className="liquid-input liquid-pill-sm" 
                  placeholder="Your Name *" 
                  value={reviewerName} 
                  onChange={e => setReviewerName(e.target.value)} 
                  style={{ maxWidth: 360, padding: '12px 18px', borderRadius: 14 }}
                />
                <textarea 
                  className="liquid-input" 
                  placeholder="Share a short review..." 
                  value={reviewerDesc}
                  onChange={e => setReviewerDesc(e.target.value)}
                  style={{ minHeight: 80 }}
                />
                <button 
                  className="liquid-btn liquid-pill" 
                  onClick={submitRating} 
                  disabled={!newRating || !reviewerName.trim() || isSubmitting}
                  style={{ width: 'fit-content', background: 'var(--liquid-glass-active)', fontWeight: 700 }}
                >
                  {isSubmitting ? 'Posting...' : 'Submit Track Rating'}
                </button>
              </div>

              {currentRatings.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {currentRatings.map(r => (
                    <div key={r.id} className="liquid-glass-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</span>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} filled={s <= r.rating} size={12} />)}
                        </div>
                      </div>
                      {r.description && <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>{r.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Tab: Tracklist */}
            {tab === 'tracklist' && (
              <section className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {project.tracks.map((track, i) => {
                  const trackRatings = allProjectRatings.filter(r => r.track_title === track.title)
                  const trackAvg = trackRatings.length ? trackRatings.reduce((a, b) => a + b.rating, 0) / trackRatings.length : 0

                  return (
                    <div
                      key={i}
                      onClick={() => { setSelectedTrack(track); resetForm(); }}
                      className="liquid-track-row"
                      style={{
                        padding: '16px 22px',
                        borderRadius: 20,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16
                      }}
                    >
                      <span style={{ fontSize: 13, color: 'var(--text-faint)', width: 26, fontWeight: 600 }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                        {track.title}
                      </span>

                      {trackAvg > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
                          <StarIcon filled={true} size={12} />
                          <span style={{ fontSize: 12, color: '#facc15', fontWeight: 600 }}>{trackAvg.toFixed(1)}</span>
                        </div>
                      )}

                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                        {track.badges?.map(b => <Badge key={b} type={b} />)}
                        {track.content && (
                          <span style={{ fontSize: 11, color: 'var(--accent-color)', fontWeight: 600 }}>
                            Lyrics
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </section>
            )}

            {/* Tab: History */}
            {tab === 'history' && (
              <section className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {project.history.map((sec, idx) => (
                  <div key={idx} className="liquid-glass-card" style={{ padding: '32px 36px' }}>
                    <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 12, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                      {sec.heading}
                    </h3>
                    <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                      {sec.body}
                    </p>
                  </div>
                ))}
              </section>
            )}

            {/* Tab: Community Reviews */}
            {tab === 'ratings' && (
              <section className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {/* Form */}
                <div className="liquid-glass-card" style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                    Leave an Album Review
                  </h3>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <StarIcon 
                        key={star} 
                        size={28}
                        filled={star <= (hoverRating || newRating)}
                        onClick={() => setNewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      />
                    ))}
                    <span style={{ fontSize: 13.5, color: 'var(--text-muted)', marginLeft: 8, fontWeight: 600 }}>
                      {newRating ? `${newRating} of 5 Stars` : 'Tap to rate'}
                    </span>
                  </div>
                  <input 
                    type="text" 
                    className="liquid-input liquid-pill-sm" 
                    placeholder="Your Name or Alias *" 
                    value={reviewerName} 
                    onChange={e => setReviewerName(e.target.value)} 
                    style={{ maxWidth: 380, padding: '12px 18px', borderRadius: 14 }}
                  />
                  <textarea 
                    className="liquid-input" 
                    placeholder="Share your thoughts on this release..." 
                    value={reviewerDesc}
                    onChange={e => setReviewerDesc(e.target.value)}
                    style={{ minHeight: 90 }}
                  />
                  <button 
                    className="liquid-btn liquid-pill" 
                    onClick={submitRating} 
                    disabled={!newRating || !reviewerName.trim() || isSubmitting}
                    style={{ width: 'fit-content', background: 'var(--liquid-glass-active)', fontWeight: 700 }}
                  >
                    {isSubmitting ? 'Posting...' : 'Post Review'}
                  </button>
                </div>

                {/* Review Feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {allProjectRatings.filter(r => r.track_title === null).length === 0 ? (
                    <p style={{ color: 'var(--text-faint)', fontSize: 14 }}>No reviews yet. Be the first to share your thoughts!</p>
                  ) : (
                    allProjectRatings.filter(r => r.track_title === null).map(r => (
                      <div key={r.id} className="liquid-glass-card" style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-main)' }}>{r.name}</span>
                          <div style={{ display: 'flex', gap: 3 }}>
                            {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} filled={s <= r.rating} size={13} />)}
                          </div>
                        </div>
                        {r.description && (
                          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65 }}>
                            {r.description}
                          </p>
                        )}
                        <span style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>
                          {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}
          </>
        )}

      </main>

      {/* RENDER MODAL OVERLAYS (For virtual collectibles) */}
      {showCollectibleWizard && (
        <CollectibleWizard onClose={() => setShowCollectibleWizard(false)} />
      )}
      {showVerifyModal && (
        <VerifyCollectibleModal onClose={() => setShowVerifyModal(false)} />
      )}

    </div>
  )
}
