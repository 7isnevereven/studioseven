'use client'

import { useState, useEffect } from 'react'
import { Project, TrackBadge, getCoverUrl } from '@/data/projects'

const LOGO_URL = 'https://flrwvmfjjuyoyjeeosls.supabase.co/storage/v1/object/public/misc/ss7.png'

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

function ArrowRightIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
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

function getYoutubeListId(url?: string) {
  if (!url) return null
  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

function getYoutubeVideoId(url?: string) {
  if (!url) return null
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/))([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

interface LeftPanelProps {
  project: Project
  onOpenModal: () => void
  onClose: () => void
}

export default function LeftPanel({ project, onOpenModal, onClose }: LeftPanelProps) {
  const [activeTrackIndex, setActiveTrackIndex] = useState(0)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    setActiveTrackIndex(0)
    setHasInteracted(false)
  }, [project])

  const listId = getYoutubeListId(project.youtubeUrl)
  const videoId = getYoutubeVideoId(project.youtubeUrl)
  
  const embedUrl = listId 
    ? `https://www.youtube.com/embed?listType=playlist&list=${listId}&index=${activeTrackIndex + 1}&rel=0${hasInteracted ? '&autoplay=1' : ''}`
    : videoId 
    ? `https://www.youtube.com/embed/${videoId}?rel=0`
    : null

  const accentColor = project.accentColor || '#38bdf8'

  return (
    <>
      <div className="mobile-overlay" onClick={onClose} />
      
      <aside
        className="left-panel"
        style={{
          '--panel-accent': accentColor,
        } as React.CSSProperties}
      >
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
          
          {/* Header Bar */}
          <div style={{ padding: '28px 28px 16px 28px', flexShrink: 0, position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={onClose}
              className="liquid-btn liquid-icon-sm mobile-only"
              style={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}
              aria-label="Close Sidebar"
            >
              <CloseIcon />
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img
                  src={LOGO_URL}
                  alt="studioseven"
                  style={{
                    height: 20,
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))'
                  }}
                />
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                  studioseven
                </span>
              </div>
              
              <div className="live-beacon">
                <span className="live-beacon-dot" />
                <span>Playing</span>
              </div>
            </div>
            
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Spotlight Release
            </p>
          </div>

          {/* Media Player Showcase */}
          <div style={{ padding: '0 24px', marginBottom: 18, flexShrink: 0 }}>
            <div
              className="liquid-glass-card"
              style={{
                width: '100%',
                height: 215,
                borderRadius: 22,
                padding: 0,
                overflow: 'hidden',
                borderColor: `${accentColor}30`,
                boxShadow: `0 20px 50px -10px ${accentColor}25, var(--liquid-inner-rim)`
              }}
            >
              {embedUrl ? (
                <iframe 
                  key={embedUrl}
                  width="100%"
                  height="100%" 
                  src={embedUrl} 
                  title="studioseven Audio Deck" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  style={{ display: 'block', backgroundColor: 'var(--bg-surface-solid)', width: '100%', height: '100%' }}
                />
              ) : (
                <img 
                  src={getCoverUrl(project.coverFile)} 
                  alt={project.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                />
              )}
            </div>
          </div>

          {/* Title & Metadata */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6, padding: '0 28px', marginBottom: 24 }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.025em', color: 'var(--text-main)' }}>
              {project.title}
            </h3>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              {project.subtitle} • {project.releaseLabel}
            </p>
          </div>

          {/* Interactive Tracklist / Up Next */}
          {project.tracks.length > 0 && (
            <div style={{ padding: '0 20px 24px 20px', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px', marginBottom: 10 }}>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Tracklist
                </h4>
                <span style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600 }}>
                  {project.tracks.length} tracks
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {project.tracks.map((track, i) => {
                  const isCurrent = activeTrackIndex === i
                  return (
                    <div 
                      key={i} 
                      onClick={() => { setActiveTrackIndex(i); setHasInteracted(true); }}
                      className={`liquid-track-row ${isCurrent ? 'active' : ''}`}
                    >
                      <span style={{ width: 18, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {isCurrent ? (
                          <div className="live-eq-container" aria-label="Playing">
                            <span className="live-eq-bar live-eq-bar-1" />
                            <span className="live-eq-bar live-eq-bar-2" />
                            <span className="live-eq-bar live-eq-bar-3" />
                            <span className="live-eq-bar live-eq-bar-4" />
                          </div>
                        ) : (
                          <span style={{ fontSize: 11.5, color: 'var(--text-faint)', fontWeight: 500 }}>
                            {i + 1}
                          </span>
                        )}
                      </span>
                      
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: isCurrent ? 700 : 500,
                          color: isCurrent ? 'var(--text-main)' : 'var(--text-muted)',
                          letterSpacing: '-0.01em',
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {track.title}
                      </span>
                      
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, flexShrink: 0 }}>
                        {track.badges?.map(b => <Badge key={b} type={b} />)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quick Actions & Project Link */}
          <div style={{ padding: '0 24px 28px 24px', marginTop: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              {project.spotifyUrl && (
                <a
                  href={project.spotifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="liquid-btn liquid-pill-sm"
                  style={{
                    flex: 1,
                    gap: 8,
                    color: '#22c55e',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    background: 'rgba(34, 197, 94, 0.08)'
                  }}
                >
                  <SpotifyIcon />
                  <span style={{ fontSize: 12 }}>Spotify</span>
                </a>
              )}
              {project.youtubeUrl && (
                <a
                  href={project.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="liquid-btn liquid-pill-sm"
                  style={{
                    flex: 1,
                    gap: 8,
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.08)'
                  }}
                >
                  <YouTubeIcon />
                  <span style={{ fontSize: 12 }}>YouTube</span>
                </a>
              )}
            </div>
            
            <button
              onClick={onOpenModal}
              className="liquid-btn liquid-pill"
              style={{
                width: '100%',
                padding: '12px 20px',
                gap: 8,
                background: 'var(--liquid-glass-active)',
                borderTopColor: 'rgba(255, 255, 255, 0.6)',
                fontWeight: 700
              }}
            >
              <span>Explore Project</span>
              <ArrowRightIcon />
            </button>
          </div>

        </div>
      </aside>
    </>
  )
}