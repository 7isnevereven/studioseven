'use client'

import { useEffect, useState, useRef } from 'react'
import { Project, Track, getCoverUrl } from '@/data/projects'

// ─── ICONS ────────────────────────────────────────────────────────────────────
function SpotifyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  )
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
function Badge({ type }: { type: 'LEAD' | 'SINGLE' }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: 999,
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.07em',
      textTransform: 'uppercase' as const,
      background: type === 'LEAD' ? '#22c55e' : '#3b82f6',
      color: type === 'LEAD' ? '#000' : '#fff',
      flexShrink: 0,
    }}>
      {type}
    </span>
  )
}

// ─── TRACK ROW ────────────────────────────────────────────────────────────────
function TrackRow({ track, index }: { track: Track; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '9px 12px',
        borderRadius: 10,
        background: hovered ? 'rgba(255,255,255,0.07)' : 'transparent',
        transition: 'background 150ms',
        cursor: 'default',
      }}
    >
      <span style={{
        width: 20,
        fontSize: 11,
        color: 'rgba(255,255,255,0.30)',
        textAlign: 'right',
        flexShrink: 0,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {index + 1}
      </span>
      <span style={{
        flex: 1,
        fontSize: 13,
        color: 'rgba(255,255,255,0.90)',
        lineHeight: 1.3,
      }}>
        {track.title}
      </span>
      <div style={{ display: 'flex', gap: 5 }}>
        {track.badges?.map(b => <Badge key={b} type={b} />)}
      </div>
    </div>
  )
}

// ─── TAB BUTTON ───────────────────────────────────────────────────────────────
function TabBtn({
  label, active, onClick,
}: {
  label: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 20px',
        borderRadius: 10,
        border: 'none',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: 'var(--font-display)',
        letterSpacing: '0.01em',
        transition: 'background 200ms, color 200ms',
        background: active ? 'rgba(255,255,255,0.13)' : 'transparent',
        color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.40)',
      }}
    >
      {label}
    </button>
  )
}

// ─── MAIN MODAL ───────────────────────────────────────────────────────────────
interface ProjectModalProps {
  project: Project | null
  onClose: () => void
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [tab, setTab] = useState<'tracklist' | 'history'>('tracklist')
  const [visible, setVisible] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Animate in
  useEffect(() => {
    if (project) {
      setTab('tracklist')
      setImgLoaded(false)
      // Small delay so the CSS transition fires
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true))
      })
    } else {
      setVisible(false)
    }
  }, [project])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = project ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [project])

  function handleClose() {
    setVisible(false)
    // Wait for fade-out before unmounting
    setTimeout(onClose, 280)
  }

  if (!project) return null

  const coverUrl = getCoverUrl(project.coverFile)

  return (
    <div
      ref={overlayRef}
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'rgba(0,0,0,0.60)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 280ms var(--ease-smooth)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 24,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.13)',
          boxShadow: `0 40px 100px rgba(0,0,0,0.70), 0 0 0 1px rgba(255,255,255,0.06)`,
          // Dynamic background derived from album accent colour
          background: `linear-gradient(160deg, ${project.accentColor}cc 0%, rgba(10,8,8,0.92) 55%)`,
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.93) translateY(20px)',
          transition: 'transform 380ms var(--ease-spring), opacity 280ms var(--ease-smooth)',
          opacity: visible ? 1 : 0,
        }}
      >

        {/* ── TOP: Art + Meta ── */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {/* Album art column */}
          <div
            style={{
              width: 200,
              minHeight: 200,
              flexShrink: 0,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {coverUrl && (
              <img
                src={coverUrl}
                alt={project.title}
                onLoad={() => setImgLoaded(true)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  opacity: imgLoaded ? 1 : 0,
                  transition: 'opacity 400ms',
                }}
              />
            )}
            {/* Shimmer */}
            {!imgLoaded && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: project.accentColor,
                opacity: 0.5,
              }} />
            )}
            {/* Fade edge into the right panel */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, transparent 60%, rgba(10,8,8,0.7) 100%)',
            }} />
          </div>

          {/* Meta column */}
          <div style={{ flex: 1, padding: '24px 24px 20px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <p style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.45)',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              {project.subtitle}
            </p>

            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: '#fff',
              lineHeight: 1.15,
            }}>
              {project.title}
            </h2>

            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)' }}>
              {project.releaseLabel}
            </p>

            {/* Streaming buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {project.spotifyUrl ? (
                <a
                  href={project.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '8px 16px',
                    borderRadius: 999,
                    background: '#1DB954',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    textDecoration: 'none',
                    transition: 'transform 150ms var(--ease-spring), filter 150ms',
                    letterSpacing: '0.02em',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.filter = 'brightness(1.1)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.filter = 'brightness(1)'
                  }}
                >
                  <SpotifyIcon /> Spotify
                </a>
              ) : (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '8px 16px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.25)',
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.02em',
                  cursor: 'not-allowed',
                }}>
                  <SpotifyIcon /> Spotify
                </span>
              )}

              {project.youtubeUrl ? (
                <a
                  href={project.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '8px 16px',
                    borderRadius: 999,
                    background: '#FF0000',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    textDecoration: 'none',
                    transition: 'transform 150ms var(--ease-spring), filter 150ms',
                    letterSpacing: '0.02em',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.filter = 'brightness(1.1)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.filter = 'brightness(1)'
                  }}
                >
                  <YouTubeIcon /> YouTube
                </a>
              ) : (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '8px 16px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.25)',
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.02em',
                  cursor: 'not-allowed',
                }}>
                  <YouTubeIcon /> YouTube
                </span>
              )}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(8px)',
              color: 'rgba(255,255,255,0.75)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 150ms, transform 150ms var(--ease-spring)',
              zIndex: 10,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.18)'
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.35)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* ── DIVIDER ── */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

        {/* ── TABS ── */}
        <div style={{
          display: 'flex',
          gap: 4,
          padding: '12px 16px 0',
          flexShrink: 0,
        }}>
          <TabBtn label="Tracklist" active={tab === 'tracklist'} onClick={() => setTab('tracklist')} />
          <TabBtn label="History"   active={tab === 'history'}   onClick={() => setTab('history')} />
        </div>

        {/* ── TAB CONTENT (scrollable) ── */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 16px 24px',
        }}>

          {tab === 'tracklist' ? (
            <div>
              {project.tracks.map((track, i) => (
                <TrackRow key={track.title + i} track={track} index={i} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '8px 4px' }}>
              {project.history.map(section => (
                <div key={section.heading}>
                  <h4 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.95)',
                    letterSpacing: '-0.01em',
                    marginBottom: 8,
                  }}>
                    {section.heading}
                  </h4>
                  <p style={{
                    fontSize: 13,
                    lineHeight: 1.75,
                    color: 'rgba(255,255,255,0.58)',
                  }}>
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}