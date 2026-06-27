'use client'

import { useState, useEffect } from 'react'
import { Project, Track, getCoverUrl } from '@/data/projects'

// ─── SPOTIFY / YOUTUBE SVG ICONS ──────────────────────────────────────────────
function SpotifyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
function Badge({ type }: { type: 'LEAD' | 'SINGLE' }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '1px 7px',
        borderRadius: 999,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        background: type === 'LEAD' ? '#22c55e' : '#3b82f6',
        color: type === 'LEAD' ? '#000' : '#fff',
        flexShrink: 0,
      }}
    >
      {type}
    </span>
  )
}

// ─── TRACK ROW ────────────────────────────────────────────────────────────────
function TrackRow({ track, index }: { track: Track; index: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '7px 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <span
        style={{
          width: 18,
          fontSize: 11,
          color: 'rgba(255,255,255,0.35)',
          textAlign: 'right',
          flexShrink: 0,
        }}
      >
        {index + 1}
      </span>
      <span
        style={{
          flex: 1,
          fontSize: 13,
          color: 'rgba(255,255,255,0.88)',
          lineHeight: 1.3,
        }}
      >
        {track.title}
      </span>
      {track.badges?.map(b => <Badge key={b} type={b} />)}
    </div>
  )
}

// ─── TAB BUTTON ───────────────────────────────────────────────────────────────
function TabBtn({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '9px 0',
        borderRadius: 10,
        border: 'none',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 600,
        fontFamily: 'var(--font-display)',
        letterSpacing: '0.02em',
        transition: 'background 200ms, color 200ms',
        background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
        color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)',
      }}
    >
      {label}
    </button>
  )
}

// ─── HISTORY SECTION ──────────────────────────────────────────────────────────
function HistoryContent({ project }: { project: Project }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {project.history.map(section => (
        <div key={section.heading}>
          <h4
            style={{
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              color: 'rgba(255,255,255,0.95)',
              marginBottom: 6,
              letterSpacing: '-0.01em',
            }}
          >
            {section.heading}
          </h4>
          <p
            style={{
              fontSize: 12,
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.60)',
            }}
          >
            {section.body}
          </p>
        </div>
      ))}
    </div>
  )
}

// ─── MAIN LEFT PANEL ──────────────────────────────────────────────────────────
interface LeftPanelProps {
  project: Project
}

export default function LeftPanel({ project }: LeftPanelProps) {
  const [tab, setTab] = useState<'tracklist' | 'history'>('tracklist')
  const [imgLoaded, setImgLoaded] = useState(false)
  const coverUrl = getCoverUrl(project.coverFile)

  // Sync accent colour CSS vars whenever project changes
  useEffect(() => {
    document.documentElement.style.setProperty('--color-accent', project.accentColor)
    document.documentElement.style.setProperty('--color-accent-soft', project.accentSoft)
    document.documentElement.style.setProperty(
      '--color-bg',
      darken(project.accentColor, 0.55)
    )
  }, [project.accentColor, project.accentSoft])

  // Reset tab when project changes
  useEffect(() => { setTab('tracklist') }, [project.id])

  return (
    <aside className="left-panel">

      {/* ── Logo ── */}
      <div
        style={{
          padding: '18px 20px 14px',
          borderBottom: '1px solid var(--glass-border)',
          flexShrink: 0,
        }}
      >
        <LogoMark />
      </div>

      {/* ── Album Art ── */}
      <div
        style={{
          padding: '16px 16px 0',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'relative',
            borderRadius: 16,
            overflow: 'hidden',
            aspectRatio: '1',
            background: 'rgba(255,255,255,0.05)',
            boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px var(--glass-border)`,
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
                transition: 'opacity 400ms ease',
              }}
            />
          )}
          {/* Shimmer placeholder */}
          {!imgLoaded && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(110deg, rgba(255,255,255,0.03) 30%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 70%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.4s infinite',
              }}
            />
          )}
        </div>
      </div>

      {/* ── Project Meta ── */}
      <div style={{ padding: '14px 20px 10px', flexShrink: 0 }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'rgba(255,255,255,0.95)',
            lineHeight: 1.2,
            marginBottom: 3,
          }}
        >
          {project.title}
        </h2>
        <p
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.45)',
            marginBottom: 12,
          }}
        >
          {project.subtitle} · {project.releaseLabel}
        </p>

        {/* Streaming buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          {project.spotifyUrl ? (
            <a
              href={project.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-btn spotify"
              title="Listen on Spotify"
            >
              <SpotifyIcon />
            </a>
          ) : (
            <span
              className="icon-btn spotify"
              style={{ opacity: 0.3, cursor: 'not-allowed' }}
              title="Not available on Spotify"
            >
              <SpotifyIcon />
            </span>
          )}
          {project.youtubeUrl ? (
            <a
              href={project.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-btn youtube"
              title="Play on YouTube"
            >
              <YouTubeIcon />
            </a>
          ) : (
            <span
              className="icon-btn youtube"
              style={{ opacity: 0.3, cursor: 'not-allowed' }}
              title="Not available on YouTube"
            >
              <YouTubeIcon />
            </span>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: '0 16px 10px',
          flexShrink: 0,
        }}
      >
        <TabBtn
          label="Tracklist"
          active={tab === 'tracklist'}
          onClick={() => setTab('tracklist')}
        />
        <TabBtn
          label="History"
          active={tab === 'history'}
          onClick={() => setTab('history')}
        />
      </div>

      {/* ── Tab Content (scrollable) ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '4px 20px 24px',
        }}
      >
        {tab === 'tracklist' ? (
          <div>
            {project.tracks.map((track, i) => (
              <TrackRow key={track.title + i} track={track} index={i} />
            ))}
          </div>
        ) : (
          <HistoryContent project={project} />
        )}
      </div>

    </aside>
  )
}

// ─── LOGO MARK ────────────────────────────────────────────────────────────────
function LogoMark() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: 22,
            height: 22,
            borderRadius: i === 2 ? '40% 40% 40% 40% / 50% 50% 50% 50%' : '50%',
            background: i === 2 ? 'rgba(255,255,255,0.85)' : 'transparent',
            border: '2px solid rgba(255,255,255,0.75)',
            flexShrink: 0,
          }}
        />
      ))}
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 13,
          fontWeight: 400,
          letterSpacing: '-0.01em',
          color: 'rgba(255,255,255,0.80)',
          marginLeft: 4,
        }}
      >
        studio<strong style={{ fontWeight: 700 }}>seven</strong>
      </span>
    </div>
  )
}

// ─── UTIL: darken a hex colour ─────────────────────────────────────────────────
function darken(hex: string, amount: number): string {
  try {
    const n = parseInt(hex.replace('#', ''), 16)
    const r = Math.max(0, Math.round(((n >> 16) & 255) * (1 - amount)))
    const g = Math.max(0, Math.round(((n >> 8) & 255) * (1 - amount)))
    const b = Math.max(0, Math.round((n & 255) * (1 - amount)))
    return `rgb(${r},${g},${b})`
  } catch {
    return '#1a0f0a'
  }
}