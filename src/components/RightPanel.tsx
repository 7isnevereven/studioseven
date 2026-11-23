'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  ARTISTS,
  Project,
  Artist,
  getCoverUrl,
  formatTimeAgo,
  TrackBadge,
  getReadableAccent,
  isProjectScheduled,
  isNewsScheduled,
  getProjectDisplayRelease
} from '@/data/projects'
import type { NewsItem } from '@/data/projects'
import Navbar from '@/components/Navbar'
import { getLiveNews, getLiveProjects, getLiveArtists, sortNewsByDateDesc } from '@/utils/dataStore'
import {
  cleanFontUrl,
  hexToRgba,
  getProjectFontStyle,
  PROJECT_FONT_STYLES,
  formatDisplayTitle
} from '@/utils/projectTypography'
export { formatDisplayTitle } from '@/utils/projectTypography'
import { supabase } from '../utils/supabase'

const LOGO_URL = 'https://flrwvmfjjuyoyjeeosls.supabase.co/storage/v1/object/public/misc/ss7.png'

/* ─── ICONS (Clean SVG, NO EMOJIS) ─── */
function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  )
}

function SpotifyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

function ArrowUpRightIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="7 7 17 7 17 17"></polyline>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  )
}

function AlertTriangleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
}

/* ─── TYPOGRAPHIC TRACK BADGE (NO PILL BOXES) ─── */
function TypographicTrackBadge({ type }: { type: TrackBadge }) {
  const colorMap: Record<TrackBadge, string> = {
    LEAD: '#22c55e',
    SINGLE: '#38bdf8',
    BONUS: '#facc15',
    DELUXE: '#c084fc',
    POEM: '#fb7185',
  }
  const color = colorMap[type] || 'var(--text-muted)'

  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color,
      }}
    >
      {type}
    </span>
  )
}

/* ─── NEWS CARD ─── */
function NewsCard({ item }: { item: NewsItem }) {
  const imageUrl = item.image ? getCoverUrl(item.image) : ''
  return (
    <Link href={`/news/${item.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <article
        className="editorial-news-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          padding: 16,
          cursor: 'pointer',
          height: '100%',
        }}
      >
        <div style={{
          width: '100%',
          aspectRatio: '16/9',
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface-solid)',
        }}>
          {imageUrl && (
            <img
              src={imageUrl}
              alt={item.headline}
              loading="lazy"
              decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: 'var(--text-muted)' }}>
            <span>{item.date}</span>
            <span>·</span>
            <span style={{ color: 'var(--text-faint)' }}>{formatTimeAgo(item.date)}</span>
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.35, letterSpacing: '-0.02em', margin: 0 }}>
            {item.headline}
          </h3>
        </div>
      </article>
    </Link>
  )
}

function getProjectOwnerName(project: Project, artists: Artist[]): string {
  const match = artists.find(a => a.id.toLowerCase() === project.artistId?.toLowerCase())
  if (match) return match.name
  if (project.credits?.writtenBy) return project.credits.writtenBy
  if (project.artistId) return project.artistId.toUpperCase()
  return 'VEN'
}

function matchesArtist(project: Project, artistId: string, artists: Artist[]): boolean {
  if (artistId === 'all') return true
  const lowerId = artistId.toLowerCase().trim()
  if (project.artistId?.toLowerCase().trim() === lowerId) return true

  if (lowerId === 'jhuzz') {
    if (project.id === 'star' || project.credits?.featuredArtists?.toLowerCase().includes('jhuzz')) return true
  }
  if (lowerId === '13') {
    if (project.id === 'cicatrix' || project.credits?.featuredArtists?.toLowerCase().includes('13')) return true
  }

  const artistObj = artists.find(a => a.id.toLowerCase() === lowerId)
  if (artistObj) {
    const lowerName = artistObj.name.toLowerCase()
    if (project.credits?.writtenBy?.toLowerCase().includes(lowerName)) return true
    if (project.credits?.featuredArtists?.toLowerCase().includes(lowerName)) return true
  }
  return false
}

export function formatProjectType(type?: string): string {
  if (!type) return 'Project'
  const t = type.trim().toLowerCase()
  if (t === 'ep') return 'EP'
  if (t === 'lp') return 'LP'
  if (t === 'soundtrack') return 'Soundtrack'
  if (t === 'project') return 'Project'
  if (t === 'special') return 'Special'
  if (t === 'final') return 'Final Chapter'
  if (t === 'single') return 'Single'
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/* ─── SUMMARY DISCOGRAPHY RELEASE CARD ─── */
function ProjectCard({
  project,
  avgRating,
  showArtist = true,
  artists = [],
}: {
  project: Project
  avgRating?: number
  showArtist?: boolean
  artists?: Artist[]
}) {
  const coverUrl = getCoverUrl(project.coverFile)
  const readableAccent = getReadableAccent(project.accentColor)
  const ownerName = getProjectOwnerName(project, artists)
  const isScheduled = isProjectScheduled(project)
  const displayRelease = getProjectDisplayRelease(project)

  return (
    <Link
      href={`/projects/${project.id}`}
      style={{ textDecoration: 'none', display: 'block', height: '100%' }}
    >
      <article className="summary-project-card">
        <div className="summary-cover-wrap">
          {coverUrl && (
            <img
              src={coverUrl}
              alt={project.title}
              loading="lazy"
              decoding="async"
              className="summary-cover-img"
            />
          )}
        </div>

        <div className="summary-meta-block">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {displayRelease}
            </span>
            {isScheduled && (
              <span style={{ fontSize: 10, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.08em' }}>
                UPCOMING
              </span>
            )}
          </div>

          <h3 className="summary-project-title">
            {formatDisplayTitle(project.title)}
          </h3>

          <div className="summary-project-details">
            {showArtist && <span>{ownerName}</span>}
            {showArtist && <span>·</span>}
            <span>{project.tracks?.length || 0} {project.tracks?.length === 1 ? 'Track' : 'Tracks'}</span>
            {project.type && <span>· {formatProjectType(project.type)}</span>}
          </div>
        </div>
      </article>
    </Link>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   BESPOKE HERO SHOWCASE BANNER
   Widescreen ~58vh Full-Bleed Showcase dynamically powered by admin bannerConfig
   Seamless edge-to-edge cinematic banner: zero borders, zero gaps, authentic project art
   ═══════════════════════════════════════════════════════════════════════════ */
function getBannerFontStyle(project: Project): React.CSSProperties {
  return getProjectFontStyle(project)
}

function BespokeShowcaseBanner({
  project,
  artists = [],
}: {
  project: Project
  artists: Artist[]
}) {
  const coverUrl = getCoverUrl(project.coverFile)
  const ownerName = getProjectOwnerName(project, artists)
  const displayRelease = project.showcaseLabel || getProjectDisplayRelease(project)
  const accentColor = project.accentColor || '#38bdf8'
  const readableAccent = getReadableAccent(project.accentColor)
  const fontStyle = getBannerFontStyle(project)

  // Smart defaults for card label & tag if not explicitly set in bannerConfig
  const defaultCardLabel = project.id === 'saccharin'
    ? 'ORIGINAL SCORE'
    : project.id === 'cicatrix'
    ? 'DELUXE EXPANSION'
    : 'SELECTIONS'

  const defaultCardTag = project.leadTrack
    ? `Lead · ${project.leadTrack}`
    : project.id === 'saccharin'
    ? 'HAMKUANE Studio 2026'
    : project.id === 'cicatrix'
    ? 'Featured · The Gecko (ft. 13)'
    : (project.tracks && project.tracks.length > 0 ? 'Track Highlights' : '')

  const cardLabel = project.bannerConfig?.cardLabel || defaultCardLabel
  const cardTag = project.bannerConfig?.cardTag || defaultCardTag

  // Highlight tracks for the showcase card:
  // If the project has 4 or fewer tracks, show all of them so all contents (songs, poems, letters) appear.
  // If more than 4, show up to 3 key highlight tracks (prioritizing leadTrack if specified).
  const allTracks = project.tracks || []
  let highlightTracks: typeof allTracks = []

  if (allTracks.length <= 4) {
    highlightTracks = allTracks
  } else if (project.leadTrack) {
    const leadTrack = allTracks.find(
      t => t.title.toLowerCase().trim() === project.leadTrack?.toLowerCase().trim()
    )
    if (leadTrack && !allTracks.slice(0, 3).some(t => t.title === leadTrack.title)) {
      highlightTracks = [leadTrack, allTracks[0], allTracks[1]]
    } else {
      highlightTracks = allTracks.slice(0, 3)
    }
  } else {
    highlightTracks = allTracks.slice(0, 3)
  }

  const ctaLabel = project.id === 'saccharin'
    ? 'Explore Soundtrack'
    : project.id === 'cicatrix'
    ? 'Explore Deluxe Edition'
    : 'Explore Release'

  // Text color on primary button based on accent brightness
  const isLightAccent = accentColor.toLowerCase() === '#ffffff' ||
    accentColor.toLowerCase() === '#f8fafc' ||
    accentColor.toLowerCase() === '#38bdf8' ||
    accentColor.toLowerCase() === '#34d399' ||
    accentColor.toLowerCase() === '#f59e0b'
  const btnTextColor = isLightAccent ? '#090d16' : '#ffffff'

  const customFontUrl = cleanFontUrl(project.bannerConfig?.customFontUrl)

  // Aesthetic project-specific gradient rising from the bottom to transparent at the top
  const bottomGradient = `
    linear-gradient(to top, 
      ${hexToRgba(accentColor, 0.62)} 0%, 
      ${hexToRgba(accentColor, 0.38)} 14%, 
      ${hexToRgba(accentColor, 0.16)} 32%, 
      ${hexToRgba(accentColor, 0.04)} 52%, 
      rgba(0, 0, 0, 0) 70%
    ),
    radial-gradient(ellipse 120% 50% at 50% 100%, ${hexToRgba(accentColor, 0.38)} 0%, ${hexToRgba(accentColor, 0.12)} 42%, rgba(0, 0, 0, 0) 72%)
  `

  return (
    <section
      id={`showcase-${project.id}`}
      className="full-bleed-banner"
    >
      {/* Dynamic Custom Font Stylesheet */}
      {customFontUrl && (
        <link rel="stylesheet" href={customFontUrl} />
      )}
      {/* 1. Full-Bleed Cover Backdrop (Static, smooth, no parallax) */}
      <div className="banner-backdrop">
        {coverUrl && (
          <img
            src={coverUrl}
            alt={project.title}
            className="banner-backdrop-img"
            loading="eager"
          />
        )}
        {/* Horizontal Editorial Fade for Left Column Legibility */}
        <div className="banner-backdrop-gradient monograph-backdrop" />

        {/* Aesthetic Project-Specific Color Gradient: From bottom to transparent at the top */}
        <div
          className="banner-color-divider"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            pointerEvents: 'none',
            background: bottomGradient
          }}
        />
      </div>

      {/* 2. Banner Foreground Grid: Content Left + Tracks Right */}
      <div className="banner-content-grid">
        <div className="banner-editorial-col">
          {project.bannerConfig?.titleMode === 'logo' && project.bannerConfig.titleLogoUrl ? (
            <div className="banner-title-logo-wrap" style={{ marginBottom: 12 }}>
              <img
                src={getCoverUrl(project.bannerConfig.titleLogoUrl)}
                alt={project.title}
                className="banner-title-logo"
                style={{
                  maxHeight: `${project.bannerConfig.logoHeight || 80}px`,
                  maxWidth: 'min(500px, 92%)',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.85))',
                  display: 'block'
                }}
              />
            </div>
          ) : (
            <h2 className="banner-title" style={fontStyle}>
              {formatDisplayTitle(project.title)}
            </h2>
          )}

          <div className="banner-meta-line">
            <span className="banner-meta-text">{displayRelease}</span>
            {ownerName && (
              <>
                <span className="banner-meta-divider">·</span>
                <span className="banner-meta-text">By {ownerName}</span>
              </>
            )}
            {project.subtitle && (
              <>
                <span className="banner-meta-divider">·</span>
                <span
                  style={{
                    color: readableAccent,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    fontSize: 12,
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.85)'
                  }}
                >
                  {project.subtitle}
                </span>
              </>
            )}
          </div>

          {project.description && (
            <p className="banner-excerpt">
              {project.description}
            </p>
          )}

          <div className="banner-actions">
            <Link
              href={`/projects/${project.id}`}
              className="banner-primary-btn"
              style={{ background: accentColor, color: btnTextColor, borderColor: accentColor }}
            >
              <span>{ctaLabel}</span>
              <ArrowUpRightIcon />
            </Link>
            {project.spotifyUrl && (
              <a
                href={project.spotifyUrl}
                target="_blank"
                rel="noreferrer"
                className="banner-secondary-btn"
              >
                <SpotifyIcon />
                <span>Spotify</span>
              </a>
            )}
            {project.youtubeUrl && (
              <a
                href={project.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="banner-secondary-btn"
              >
                <YouTubeIcon />
                <span>Listen</span>
              </a>
            )}
          </div>
        </div>

        {/* Right Stage: Project-relevant elements (Selections, score cues, or highlights) */}
        {highlightTracks.length > 0 && (
          <div className="banner-stage-col">
            <div
              className="banner-tracklist-card"
              style={{
                background: 'rgba(12, 12, 15, 0.82)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderColor: `${accentColor}33`,
                boxShadow: `0 16px 40px rgba(0, 0, 0, 0.65), 0 0 28px ${accentColor}18`,
              }}
            >
              <div
                className="tracklist-card-header"
                style={{
                  borderBottomColor: `${accentColor}30`,
                }}
              >
                <span className="tracklist-card-label">{cardLabel}</span>
                {cardTag && (
                  <span
                    className="tracklist-card-tag"
                    style={{
                      color: readableAccent,
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      textShadow: '0 1px 6px rgba(0, 0, 0, 0.85)'
                    }}
                  >
                    {cardTag}
                  </span>
                )}
              </div>

              <div className="tracklist-card-items">
                {highlightTracks.map((track, idx) => {
                  const originalIndex = (project.tracks || []).findIndex(t => t.title === track.title)
                  const trackNum = originalIndex !== -1 ? originalIndex + 1 : idx + 1
                  const formattedNum = trackNum < 10 ? `0${trackNum}` : `${trackNum}`

                  return (
                    <Link
                      key={idx}
                      href={`/projects/${project.id}`}
                      className="banner-track-row"
                    >
                      <span
                        className="track-row-num"
                        style={{
                          color: 'rgba(255, 255, 255, 0.72)',
                          fontWeight: 600,
                          letterSpacing: '0.04em'
                        }}
                      >
                        {formattedNum}
                      </span>
                      <span className="track-row-title" style={{ color: '#ffffff', fontWeight: 600 }}>{track.title}</span>
                      {track.badges?.[0] && (
                        <TypographicTrackBadge type={track.badges[0]} />
                      )}
                    </Link>
                  )
                })}
              </div>

              <Link
                href={`/projects/${project.id}`}
                className="tracklist-card-footer"
                style={{
                  borderTopColor: `${accentColor}25`,
                }}
              >
                <span>View full {project.tracks?.length || 0}-track catalog</span>
                <ArrowUpRightIcon />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}





/* ─── ARTIST PROFILE CARD ─── */
function ArtistCard({ artist, projects = [] }: { artist: Artist, projects?: Project[] }) {
  const imgUrl = getCoverUrl(artist.image)
  const artistProjects = artist.id === 'jhuzz'
    ? projects.filter(p => p.id === 'star')
    : artist.id === '13'
    ? projects.filter(p => p.id === 'cicatrix')
    : projects.filter(p => p.artistId === artist.id)

  return (
    <Link href={`/artists/${artist.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article className="artist-editorial-card">
        <div className="artist-avatar-wrap">
          {imgUrl && (
            <img
              src={imgUrl}
              alt={artist.name}
              loading="lazy"
              decoding="async"
              className="artist-avatar-img"
            />
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)', margin: 0 }}>
            {artist.name}
          </h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {artist.id === 'ven' ? 'Lead Artist & Creator' : 'Featured Artist'} · {artistProjects.length} {artistProjects.length === 1 ? 'Release' : 'Releases'}
          </span>
        </div>
      </article>
    </Link>
  )
}

/* ─── MAIN RIGHT PANEL PROPS ─── */
interface MainContentProps {
  currentView?: 'home' | 'projects' | 'artists' | 'newsroom' | 'about'
  setCurrentView?: (v: 'home' | 'projects' | 'artists' | 'newsroom' | 'about') => void
}

export default function RightPanel({ currentView = 'home', setCurrentView }: MainContentProps) {
  const [view, setView] = useState<'home' | 'projects' | 'artists' | 'newsroom' | 'about'>(currentView)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [artistFilter, setArtistFilter] = useState<string>('all')
  const [ratingsMap, setRatingsMap] = useState<Record<string, { avg: number, count: number }>>({})
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [allNews, setAllNews] = useState<NewsItem[]>([])
  const [allArtists, setAllArtists] = useState<Artist[]>(ARTISTS)
  const [loading, setLoading] = useState(true)
  const [dbError, setDbError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setDbError(null)
    const [projRes, newsRes, artistsRes] = await Promise.all([
      getLiveProjects(),
      getLiveNews(),
      getLiveArtists(),
    ])
    if (projRes.error || newsRes.error) {
      setDbError(projRes.error || newsRes.error)
    } else {
      setAllProjects(projRes.data.filter(p => !isProjectScheduled(p) || p.allowPreview))
      setAllNews(newsRes.data.filter(n => !isNewsScheduled(n)))
      if (artistsRes.data && artistsRes.data.length > 0) {
        setAllArtists(artistsRes.data)
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (setCurrentView) setView(currentView)
  }, [currentView, setCurrentView])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
  }, [view])

  const handleSetView = (v: 'home' | 'projects' | 'artists' | 'newsroom' | 'about') => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
    setView(v)
    if (setCurrentView) setCurrentView(v)
  }

  useEffect(() => {
    async function fetchAllRatings() {
      const { data, error } = await supabase.from('ratings').select('project_id, rating').is('track_title', null)
      if (!error && data) {
        const grouped = data.reduce((acc, curr) => {
          if (!acc[curr.project_id]) acc[curr.project_id] = { sum: 0, count: 0 }
          acc[curr.project_id].sum += curr.rating
          acc[curr.project_id].count += 1
          return acc
        }, {} as Record<string, { sum: number, count: number }>)
        const finalData: Record<string, { avg: number, count: number }> = {}
        Object.keys(grouped).forEach(key => {
          finalData[key] = { avg: grouped[key].sum / grouped[key].count, count: grouped[key].count }
        })
        setRatingsMap(finalData)
      }
    }
    fetchAllRatings()
    const channel = supabase.channel('public:ratings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ratings' }, () => fetchAllRatings())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  // Exactly 2 featured projects for the homescreen hero rotation
  const featuredShowcase = allProjects
    .filter(p => p.featured && (!isProjectScheduled(p) || p.allowPreview))
    .sort((a, b) => (a.showcaseOrder ?? 999) - (b.showcaseOrder ?? 999))

  const otherReleases = allProjects
    .filter(p => !featuredShowcase.some(f => f.id === p.id) && (!isProjectScheduled(p) || p.allowPreview))
    .sort((a, b) => new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime())

  const showcaseProjects = [...featuredShowcase, ...otherReleases].slice(0, 2)

  const filteredProjects = allProjects
    .filter(p => !isProjectScheduled(p) || p.allowPreview)
    .filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase())
      const matchesCreator = matchesArtist(p, artistFilter, allArtists)
      return matchesSearch && matchesCreator
    })
    .sort((a, b) => sort === 'newest'
      ? new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime()
      : new Date(a.releasedAt).getTime() - new Date(b.releasedAt).getTime())

  // Render bespoke section per project id (Static, clean, no parallax)
  const renderBespokeSection = (project: Project) => {
    return <BespokeShowcaseBanner key={project.id} project={project} artists={allArtists} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100vh', position: 'relative' }}>
      <Navbar currentView={view} setCurrentView={handleSetView} />
      <div className="navbar-spacer" />

      {/* Database Connection Error State */}
      {dbError && (
        <div style={{ maxWidth: 1280, margin: '20px auto 0 auto', padding: '0 24px', width: '100%', boxSizing: 'border-box' }}>
          <div className="editorial-error-box animate-in">
            <div style={{ color: '#ef4444' }}>
              <AlertTriangleIcon />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#ef4444', margin: 0 }}>
              Database Connection Error
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              Unable to reach the live database ({dbError}).
            </p>
            <button
              onClick={loadData}
              className="editorial-primary-btn"
              style={{ padding: '8px 20px', fontSize: 12.5 }}
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          HOME VIEW: FULL-BLEED HORIZONTAL HERO BANNERS + 2-COLUMN TILES + CATALOG
          ═══════════════════════════════════════════════════════════════════════════ */}
      {view === 'home' && (
        <div className="animate-in" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* 1. FULL-BLEED HERO BANNERS (APPLE.COM WIDESCREEN ARCHITECTURE) */}
          <div className="hero-banners-container">
            {showcaseProjects.map(proj => renderBespokeSection(proj))}
          </div>

          {/* 2. DEDICATED EDITORIAL NEWSROOM SECTION */}
          <section id="newsroom" className="home-newsroom-section">
            <div className="home-section-header">
              <div>
                <h2 className="home-section-title">From the Newsroom</h2>
              </div>
              <button
                onClick={() => handleSetView('newsroom')}
                className="editorial-secondary-btn"
              >
                <span>Explore All Dispatches ({allNews.length})</span>
                <ArrowUpRightIcon />
              </button>
            </div>

            <div className="home-newsroom-grid">
              {allNews[0] && (
                <Link href={`/news/${allNews[0].id}`} className="news-lead-card">
                  {allNews[0].image && (
                    <div className="news-lead-img-wrap">
                      <img
                        src={getCoverUrl(allNews[0].image)}
                        alt={allNews[0].headline}
                        className="news-lead-img"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="news-lead-date">{allNews[0].date}</span>
                    {allNews[0].projectId && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-color)' }}>
                        · {allProjects.find(p => p.id === allNews[0].projectId)?.title || 'Release Dispatch'}
                      </span>
                    )}
                  </div>
                  <h3 className="news-lead-headline">
                    {allNews[0].headline}
                  </h3>
                  {allNews[0].preview && (
                    <p className="news-lead-preview">
                      {allNews[0].preview}
                    </p>
                  )}
                  <div className="news-read-more-link">
                    <span>Read Full Dispatch</span>
                    <ArrowUpRightIcon />
                  </div>
                </Link>
              )}

              <div className="news-side-stack">
                {allNews.slice(1, 4).map(item => (
                  <Link key={item.id} href={`/news/${item.id}`} className="news-compact-item">
                    {item.image && (
                      <div className="news-compact-thumb">
                        <img src={getCoverUrl(item.image)} alt={item.headline} loading="lazy" />
                      </div>
                    )}
                    <div className="news-compact-info">
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                        {item.date}
                      </span>
                      <h4 className="news-compact-headline">
                        {item.headline}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* 3. COMPLETE DISCOGRAPHY RELEASES SUMMARY */}
          <section id="projects" className="discography-summary-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
              <div>
                <h2 className="section-title" style={{ margin: 0 }}>
                  All Releases
                </h2>
              </div>
              <button
                onClick={() => handleSetView('projects')}
                className="editorial-secondary-btn desktop-only"
              >
                <span>Complete Catalog ({allProjects.length})</span>
                <ArrowUpRightIcon />
              </button>
            </div>

            {/* Creator Filter Tabs */}
            <div className="editorial-filter-bar">
              <button
                onClick={() => setArtistFilter('all')}
                className={`editorial-filter-tab ${artistFilter === 'all' ? 'active' : ''}`}
              >
                All ({allProjects.length})
              </button>
              {allArtists.map(artist => {
                const count = allProjects.filter(p => matchesArtist(p, artist.id, allArtists)).length
                if (count === 0) return null
                const isSelected = artistFilter === artist.id
                return (
                  <button
                    key={artist.id}
                    onClick={() => setArtistFilter(artist.id)}
                    className={`editorial-filter-tab ${isSelected ? 'active' : ''}`}
                  >
                    {artist.name} ({count})
                  </button>
                )
              })}
            </div>

            {/* Summary Cards Grid: Strictly 1 Responsive Line on Homepage */}
            <div className="home-releases-single-row" style={{ marginTop: 24 }}>
              {allProjects
                .filter(p => matchesArtist(p, artistFilter, allArtists))
                .slice(0, 8)
                .map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    avgRating={ratingsMap[project.id]?.avg}
                    showArtist={artistFilter === 'all'}
                    artists={allArtists}
                  />
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
              <button
                onClick={() => handleSetView('projects')}
                className="editorial-secondary-btn"
                style={{ padding: '10px 24px', fontSize: 13 }}
              >
                <span>Browse Full Discography</span>
                <ArrowUpRightIcon />
              </button>
            </div>
          </section>

          {/* 4. DEDICATED THE ARTIST COLLECTIVE SHOWCASE */}
          <section id="artists" className="home-artists-section">
            <div className="home-section-header">
              <div>
                <h2 className="home-section-title">The Artist Collective</h2>
              </div>
              <button
                onClick={() => handleSetView('artists')}
                className="editorial-secondary-btn"
              >
                <span>View Artist Profiles ({allArtists.length})</span>
                <ArrowUpRightIcon />
              </button>
            </div>

            <div className="artists-showcase-grid">
              {allArtists.map(artist => {
                const img = getCoverUrl(artist.image)
                const count = allProjects.filter(p => matchesArtist(p, artist.id, allArtists)).length
                const isFeatured = artist.id === 'jhuzz' || artist.id === '13'
                const role = artist.id === 'ven'
                  ? 'Lead Composer, Lyricist & Creator'
                  : 'Featured Artist'

                return (
                  <Link
                    key={artist.id}
                    href={`/artists/${artist.id}`}
                    className="artist-feature-card"
                  >
                    <div className="artist-portrait-wrap">
                      {img && (
                        <img
                          src={img}
                          alt={artist.name}
                          className="artist-portrait-img"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <h3 className="artist-feature-name">{artist.name}</h3>
                    <span className="artist-feature-role">
                      {role}
                    </span>
                    <span className="artist-feature-badge">
                      {count} {count === 1 ? 'Release' : 'Releases'} on studioseven
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          PAGED VIEWS (PROJECTS, ARTISTS, NEWSROOM) CONFINED INSIDE MAIN-WRAPPER
          ═══════════════════════════════════════════════════════════════════════════ */}
      {view !== 'home' && (
        <main className="main-wrapper">
          {/* PROJECTS / DISCOGRAPHY FULL VIEW */}
          {view === 'projects' && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: 'var(--text-main)' }}>
                    Discography
                  </h1>
                </div>

                {/* Search & Sort Controls */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div className="editorial-search-wrap">
                    <SearchIcon />
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search titles or lyrics..."
                      className="editorial-search-input"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch('')}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                        aria-label="Clear search"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="editorial-sort-group">
                    <button
                      onClick={() => setSort('newest')}
                      className={`editorial-sort-btn ${sort === 'newest' ? 'active' : ''}`}
                    >
                      Newest
                    </button>
                    <button
                      onClick={() => setSort('oldest')}
                      className={`editorial-sort-btn ${sort === 'oldest' ? 'active' : ''}`}
                    >
                      Oldest
                    </button>
                  </div>
                </div>
              </div>

              {/* Artist Filter Tabs */}
              <div className="editorial-filter-bar">
                <button
                  onClick={() => setArtistFilter('all')}
                  className={`editorial-filter-tab ${artistFilter === 'all' ? 'active' : ''}`}
                >
                  All ({allProjects.length})
                </button>
                {allArtists.map(artist => {
                  const count = allProjects.filter(p => matchesArtist(p, artist.id, allArtists)).length
                  if (count === 0) return null
                  const isSelected = artistFilter === artist.id
                  return (
                    <button
                      key={artist.id}
                      onClick={() => setArtistFilter(artist.id)}
                      className={`editorial-filter-tab ${isSelected ? 'active' : ''}`}
                    >
                      {artist.name} ({count})
                    </button>
                  )
                })}
              </div>

              {filteredProjects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                  No releases found matching "{search}".
                </div>
              ) : (
                <div className="grid-4">
                  {filteredProjects.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      avgRating={ratingsMap[project.id]?.avg}
                      showArtist={artistFilter === 'all'}
                      artists={allArtists}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ARTISTS VIEW */}
          {view === 'artists' && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div>
                <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: 'var(--text-main)' }}>
                  Artists & Creators
                </h1>
              </div>

              <div className="grid-3">
                {allArtists.map(artist => (
                  <ArtistCard key={artist.id} artist={artist} projects={allProjects} />
                ))}
              </div>
            </div>
          )}

          {/* NEWSROOM VIEW */}
          {view === 'newsroom' && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div>
                <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: 'var(--text-main)' }}>
                  Newsroom
                </h1>
              </div>

              <div className="grid-3">
                {allNews.map(item => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </main>
      )}

      {/* ─── FOOTER ─── */}
      <footer className="footer-wrapper">
        <div className="footer-inner">
          {/* Brand & Division Info */}
          <div className="footer-brand-block">
            <img src={LOGO_URL} alt="studioseven" className="brand-logo-img" style={{ height: 22 }} />
            <div className="footer-typography">
              <span className="footer-brand-title">
                studio<strong>se<u style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}>ven</u></strong>
              </span>
              <span className="footer-brand-subtitle">
                The creative division of team7
              </span>
            </div>
            <p className="footer-reuse-note">
              2020–2026 · Request for reuse is highly advised.
            </p>
          </div>

          {/* Social Media Icon Buttons */}
          <div className="footer-social-row">
            <a
              href="https://www.facebook.com/share/1c28j8dk1Y/?mibextid=wwXIfr"
              target="_blank"
              rel="noreferrer"
              className="footer-social-btn"
              title="Facebook"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://www.instagram.com/studioseven.ofc?igsh=a3hnOG1keWtyNWMw"
              target="_blank"
              rel="noreferrer"
              className="footer-social-btn"
              title="Instagram"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://youtube.com/@studioseven.official?si=U4AJNcT3KV3UbjSo"
              target="_blank"
              rel="noreferrer"
              className="footer-social-btn"
              title="YouTube"
              aria-label="YouTube"
            >
              <YouTubeIcon />
            </a>
            <a
              href="https://open.spotify.com/artist/3hpPUT2YPNiWtwECpLB4wT?si=IigsrpE2RdCKGM14KkYj1Q&utm_source=copy-link"
              target="_blank"
              rel="noreferrer"
              className="footer-social-btn"
              title="Spotify"
              aria-label="Spotify"
            >
              <SpotifyIcon />
            </a>
            <a
              href="mailto:studioseven.ofc@gmail.com"
              className="footer-social-btn"
              title="Email Us"
              aria-label="Email Us"
            >
              <MailIcon />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
