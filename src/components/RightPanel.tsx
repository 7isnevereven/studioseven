'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { PROJECTS, ARTISTS, NEWS, Project, Artist, getCoverUrl, formatTimeAgo, TrackBadge } from '@/data/projects'
import type { NewsItem } from '@/data/projects'
import Navbar from '@/components/Navbar'
import { supabase } from '../utils/supabase'

const LOGO_URL = 'https://flrwvmfjjuyoyjeeosls.supabase.co/storage/v1/object/public/misc/ss7.png'
const SHOWCASE_DURATION = 8000 // 8 seconds per slide

// Short descriptions per project for the banner
const PROJECT_DESCRIPTIONS: Record<string, string> = {
  'what-do-you-know': 'The 7th project and VEN\'s final chapter. A collection of poems and songs exploring questions of truth, silence, and what we choose to carry.',
  'saccharin': 'Official movie soundtrack for NAMUJANE Studios\' short film. An auditory tension piece exploring the bitter cure through ambient soundscapes and emotive compositions.',
  'cicatrix': 'The deluxe expansion to "cuts and chances", representing the scars left after the emotional journey. Features "The Gecko" and collaborations with 13.',
  'cuts-chances-declassified': 'One year after the original — the hidden memos, unfiltered emotions, and the missing piece finally revealed. Featuring "Half a Lie."',
}

// Custom display fonts per project (Google Fonts stack fallback to Inter)
const PROJECT_FONT_STYLES: Record<string, React.CSSProperties> = {
  'what-do-you-know': {
    fontFamily: '"Libre Baskerville", Georgia, serif',
    letterSpacing: '-0.02em',
  },
  'saccharin': {
    fontFamily: '"Space Grotesk", "Inter", sans-serif',
    letterSpacing: '0.10em',
    textTransform: 'uppercase' as const,
    fontWeight: 900,
  },
  'cicatrix': {
    fontFamily: '"Playfair Display", Georgia, serif',
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    fontWeight: 900,
  },
  'cuts-chances-declassified': {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontStyle: 'italic',
    letterSpacing: '-0.01em',
  },
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

function ArrowUpRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="7 7 17 7 17 17"></polyline>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  )
}

function StarIcon({ filled, size = 11 }: { filled: boolean, size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#eab308" : "none"} stroke={filled ? "#eab308" : "var(--text-faint)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
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
    <span className="liquid-badge" style={{ background: conf.bg, color: conf.text, border: `1px solid ${conf.border}` }}>
      {type}
    </span>
  )
}

/* NEWS CARD */
function NewsCard({ item }: { item: NewsItem }) {
  const project = PROJECTS.find(p => p.id === item.projectId)
  const imageUrl = item.image ? getCoverUrl(item.image) : (project ? getCoverUrl(project.coverFile) : '')

  return (
    <Link href={`/news/${item.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="liquid-glass-card" style={{ display: 'flex', flexDirection: 'column', padding: 18, height: '100%' }}>
        <div style={{
          width: '100%',
          aspectRatio: '16/9',
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface-solid)',
          marginBottom: 16,
          border: '1px solid var(--glass-border-outer)',
          position: 'relative'
        }}>
          {imageUrl && (
            <img src={imageUrl} alt={item.headline} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 2px', flex: 1 }}>
          <h3 style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.35, letterSpacing: '-0.02em' }}>
            {item.headline}
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{item.date}</span>
            <span>•</span>
            <span style={{ color: 'var(--text-faint)' }}>{formatTimeAgo(item.date)}</span>
          </p>
        </div>
      </div>
    </Link>
  )
}

/* PROJECT CARD */
function ProjectCard({ project, avgRating }: { project: Project, avgRating?: number }) {
  const coverUrl = getCoverUrl(project.coverFile)
  return (
    <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="liquid-glass-card" style={{ display: 'flex', flexDirection: 'column', padding: 16, cursor: 'pointer', height: '100%' }}>
        <div style={{
          width: '100%', aspectRatio: '1', borderRadius: 16, overflow: 'hidden',
          backgroundColor: 'var(--bg-surface-solid)', marginBottom: 14,
          border: '1px solid var(--glass-border-outer)'
        }}>
          {coverUrl && <img src={coverUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 2px', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
              {project.title}
            </h3>
            {avgRating && avgRating > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(234, 179, 8, 0.12)', border: '1px solid rgba(234, 179, 8, 0.28)', padding: '2px 7px', borderRadius: 99, flexShrink: 0 }}>
                <StarIcon filled={true} size={10} />
                <span style={{ fontSize: 11, color: '#facc15', fontWeight: 700 }}>{avgRating.toFixed(1)}</span>
              </div>
            ) : null}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{project.releaseLabel}</p>
        </div>
      </div>
    </Link>
  )
}

/* ARTIST CARD */
function ArtistCard({ artist }: { artist: Artist }) {
  const imgUrl = getCoverUrl(artist.image)
  const artistProjects = artist.id === 'jhuzz'
    ? PROJECTS.filter(p => p.id === 'star')
    : artist.id === '13'
    ? PROJECTS.filter(p => p.id === 'cicatrix')
    : PROJECTS.filter(p => p.artistId === artist.id)

  return (
    <Link href={`/artists/${artist.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="liquid-glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '30px 18px', cursor: 'pointer', textAlign: 'center', height: '100%' }}>
        <div style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--glass-border-specular-top)', backgroundColor: 'var(--bg-surface-solid)' }}>
          {imgUrl && <img src={imgUrl} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>{artist.name}</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{artistProjects.length} {artistProjects.length === 1 ? 'Release' : 'Releases'}</span>
        </div>
      </div>
    </Link>
  )
}

interface MainContentProps {
  currentView?: 'home' | 'projects' | 'artists' | 'newsroom' | 'about'
  setCurrentView?: (v: 'home' | 'projects' | 'artists' | 'newsroom' | 'about') => void
}

export default function RightPanel({ currentView = 'home', setCurrentView }: MainContentProps) {
  const [view, setView] = useState<'home' | 'projects' | 'artists' | 'newsroom' | 'about'>(currentView)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [ratingsMap, setRatingsMap] = useState<Record<string, { avg: number, count: number }>>({})

  // The 3 latest projects
  const latest3Projects = [
    PROJECTS.find(p => p.id === 'what-do-you-know')!,
    PROJECTS.find(p => p.id === 'saccharin')!,
    PROJECTS.find(p => p.id === 'cicatrix')!,
  ].filter(Boolean)

  const [activeIdx, setActiveIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const TICK = 80 // ms per progress tick

  const startAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (progressRef.current) clearInterval(progressRef.current)
    setProgress(0)

    // Progress bar ticker
    let elapsed = 0
    progressRef.current = setInterval(() => {
      elapsed += TICK
      setProgress(Math.min((elapsed / SHOWCASE_DURATION) * 100, 100))
    }, TICK)

    // Slide switcher
    intervalRef.current = setInterval(() => {
      setActiveIdx(i => (i + 1) % latest3Projects.length)
      elapsed = 0
      setProgress(0)
    }, SHOWCASE_DURATION)
  }, [latest3Projects.length])

  useEffect(() => {
    startAutoPlay()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [startAutoPlay])

  const handleThumbClick = (idx: number) => {
    setActiveIdx(idx)
    startAutoPlay()
  }

  useEffect(() => {
    if (setCurrentView) setView(currentView)
  }, [currentView, setCurrentView])

  const handleSetView = (v: 'home' | 'projects' | 'artists' | 'newsroom' | 'about') => {
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

  const filteredProjects = PROJECTS.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'newest'
      ? new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime()
      : new Date(a.releasedAt).getTime() - new Date(b.releasedAt).getTime())

  const activeProject = latest3Projects[activeIdx] || latest3Projects[0]
  const titleFontStyle = PROJECT_FONT_STYLES[activeProject?.id] || {}
  const description = PROJECT_DESCRIPTIONS[activeProject?.id] || ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100vh' }}>
      <Navbar currentView={view} setCurrentView={handleSetView} />
      {/* Spacer for fixed navbar */}
      <div className="navbar-spacer" />

      <main className="main-wrapper">

        {/* HOME VIEW */}
        {view === 'home' && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>

            {/* 3 Latest Projects — Compact Hero Showcase */}
            <section className="latest-showcase-container">
              <div className="showcase-controls">
                <div>
                  <h2 className="section-title">Latest Releases</h2>
                </div>
                {/* Numbered tab pills */}
                <div className="showcase-tabs">
                  {latest3Projects.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => handleThumbClick(idx)}
                      className={`liquid-btn liquid-pill-sm ${activeIdx === idx ? 'active' : ''}`}
                      style={{ fontSize: 12 }}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compact hero banner */}
              {activeProject && (
                <div className="showcase-banner-card">
                  {/* Cover art as background */}
                  <img
                    key={activeProject.id}
                    src={getCoverUrl(activeProject.coverFile)}
                    alt={activeProject.title}
                    className="showcase-banner-bg"
                    style={{ animation: 'bannerEnter 0.7s cubic-bezier(0.16, 1, 0.3, 1) both' }}
                  />

                  {/* Dual gradient overlay for optimal legibility */}
                  <div className="showcase-banner-overlay" />

                  {/* Auto-play progress bar */}
                  <div
                    className="showcase-progress-bar"
                    style={{ width: `${progress}%`, transition: `width ${TICK}ms linear` }}
                  />

                  {/* Content area: Left details + Right thumbnail strip */}
                  <div className="showcase-banner-content">
                    {/* Left Column: Details & Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '640px', minWidth: 0 }}>
                      <span style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: 'rgba(255,255,255,0.7)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        width: 'fit-content'
                      }}>
                        {activeProject.releaseLabel}
                      </span>

                      <h3 style={{
                        fontSize: 'clamp(20px, 3.2vw, 32px)',
                        fontWeight: 800,
                        color: '#ffffff',
                        lineHeight: 1.15,
                        textShadow: '0 2px 14px rgba(0,0,0,0.5)',
                        letterSpacing: '-0.02em',
                        ...titleFontStyle,
                      }}>
                        {activeProject.title}
                      </h3>

                      {description && (
                        <p style={{
                          fontSize: 13,
                          color: 'rgba(255,255,255,0.78)',
                          lineHeight: 1.45,
                          fontWeight: 400,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          maxWidth: 540,
                        }}>
                          {description}
                        </p>
                      )}

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                        <Link
                          href={`/projects/${activeProject.id}`}
                          className="liquid-btn liquid-pill-sm"
                          style={{
                            background: 'rgba(255,255,255,0.22)',
                            borderTopColor: 'rgba(255,255,255,0.7)',
                            borderColor: 'rgba(255,255,255,0.3)',
                            color: '#fff',
                            fontWeight: 700,
                            gap: 6,
                            textDecoration: 'none',
                            backdropFilter: 'blur(16px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                            fontSize: 12.5,
                            padding: '6px 14px',
                          }}
                        >
                          <span>Explore Project</span>
                          <ArrowUpRightIcon />
                        </Link>

                        {activeProject.spotifyUrl && (
                          <a
                            href={activeProject.spotifyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="liquid-btn liquid-pill-sm"
                            style={{ gap: 6, color: '#22c55e', background: 'rgba(34, 197, 94, 0.14)', borderColor: 'rgba(34, 197, 94, 0.35)', fontSize: 12, padding: '6px 12px' }}
                          >
                            <SpotifyIcon /> <span>Spotify</span>
                          </a>
                        )}
                        {activeProject.youtubeUrl && (
                          <a
                            href={activeProject.youtubeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="liquid-btn liquid-pill-sm"
                            style={{ gap: 6, color: '#ef4444', background: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.35)', fontSize: 12, padding: '6px 12px' }}
                          >
                            <YouTubeIcon /> <span>YouTube</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Thumbnail Strip */}
                    <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                      <div className="showcase-thumb-strip">
                        {latest3Projects.map((p, idx) => (
                          <div
                            key={p.id}
                            className={`showcase-thumb ${activeIdx === idx ? 'active' : ''}`}
                            onClick={() => handleThumbClick(idx)}
                            title={p.title}
                          >
                            <img src={getCoverUrl(p.coverFile)} alt={p.title} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Newsroom Section */}
            <section id="newsroom">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
                <div>
                  <h2 className="section-title">Newsroom</h2>
                </div>
                <button onClick={() => handleSetView('newsroom')} className="liquid-btn liquid-pill-sm desktop-only" style={{ gap: 6 }}>
                  <span>View All</span>
                  <ArrowUpRightIcon />
                </button>
              </div>
              <div className="grid-3">
                {NEWS.slice(0, 6).map(item => <NewsCard key={item.id} item={item} />)}
              </div>
              <button onClick={() => handleSetView('newsroom')} className="liquid-btn liquid-pill mobile-only" style={{ width: '100%', marginTop: 20 }}>
                View All News
              </button>
            </section>

            {/* Discography Section */}
            <section id="projects">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
                <div>
                  <h2 className="section-title">Releases</h2>
                </div>
                <button onClick={() => handleSetView('projects')} className="liquid-btn liquid-pill-sm desktop-only" style={{ gap: 6 }}>
                  <span>View All ({PROJECTS.length})</span>
                  <ArrowUpRightIcon />
                </button>
              </div>
              <div className="grid-4">
                {PROJECTS.slice(0, 8).map(project => (
                  <ProjectCard key={project.id} project={project} avgRating={ratingsMap[project.id]?.avg} />
                ))}
              </div>
              <button onClick={() => handleSetView('projects')} className="liquid-btn liquid-pill mobile-only" style={{ width: '100%', marginTop: 20 }}>
                View All Projects
              </button>
            </section>

            {/* Artists Section */}
            <section id="artists">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
                <div>
                  <h2 className="section-title">Artists & Collective</h2>
                </div>
                <button onClick={() => handleSetView('artists')} className="liquid-btn liquid-pill-sm desktop-only" style={{ gap: 6 }}>
                  <span>View All</span>
                  <ArrowUpRightIcon />
                </button>
              </div>
              <div className="grid-artists">
                {ARTISTS.map(artist => <ArtistCard key={artist.id} artist={artist} />)}
              </div>
            </section>

          </div>
        )}

        {/* ALL PROJECTS VIEW */}
        {view === 'projects' && (
          <section className="animate-in">
            <div style={{ marginBottom: 24 }}>
              <h2 className="section-title">All Projects</h2>
            </div>
            <div className="search-filter-container">
              <div style={{ position: 'relative', flex: 1, minWidth: 260, maxWidth: 360 }}>
                <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', pointerEvents: 'none', display: 'flex' }}>
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="Search releases..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="liquid-input liquid-pill"
                  style={{ width: '100%', paddingLeft: 44, height: 42 }}
                />
              </div>
              <select
                value={sort}
                onChange={e => setSort(e.target.value as any)}
                className="liquid-input liquid-pill"
                style={{ cursor: 'pointer', height: 42, paddingRight: 32 }}
              >
                <option value="newest" style={{ background: 'var(--bg-surface-solid)', color: 'var(--text-main)' }}>Newest First</option>
                <option value="oldest" style={{ background: 'var(--bg-surface-solid)', color: 'var(--text-main)' }}>Oldest First</option>
              </select>
            </div>
            <div className="grid-4">
              {filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} avgRating={ratingsMap[project.id]?.avg} />
              ))}
            </div>
          </section>
        )}

        {/* NEWSROOM VIEW */}
        {view === 'newsroom' && (
          <section className="animate-in">
            <div style={{ marginBottom: 24 }}>
              <h2 className="section-title">Newsroom</h2>
            </div>
            <div className="grid-3">
              {NEWS.map(item => <NewsCard key={item.id} item={item} />)}
            </div>
          </section>
        )}

        {/* ARTISTS VIEW */}
        {view === 'artists' && (
          <section className="animate-in">
            <div style={{ marginBottom: 24 }}>
              <h2 className="section-title">Artists & Collective</h2>
            </div>
            <div className="grid-artists">
              {ARTISTS.map(artist => <ArtistCard key={artist.id} artist={artist} />)}
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer style={{
        padding: '48px 36px',
        textAlign: 'center',
        color: 'var(--text-faint)',
        fontSize: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        borderTop: '1px solid var(--glass-border-subtle)',
        marginTop: 'auto'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
          <img src={LOGO_URL} alt="studioseven logo" className="brand-logo-img" style={{ height: 22 }} />
          <p style={{ fontWeight: 600, color: 'var(--text-muted)', marginTop: 4 }}>A sub-brand under team7</p>
          <p>2020–2026 · Request for reuse is highly advised.</p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="https://www.facebook.com/share/1c28j8dk1Y/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="liquid-btn liquid-icon-sm" title="Facebook"><FacebookIcon /></a>
          <a href="https://www.instagram.com/studioseven.ofc?igsh=a3hnOG1keWtyNWMw" target="_blank" rel="noreferrer" className="liquid-btn liquid-icon-sm" title="Instagram"><InstagramIcon /></a>
          <a href="https://youtube.com/@studioseven.official?si=U4AJNcT3KV3UbjSo" target="_blank" rel="noreferrer" className="liquid-btn liquid-icon-sm" title="YouTube"><YouTubeIcon /></a>
          <a href="https://open.spotify.com/artist/3hpPUT2YPNiWtwECpLB4wT?si=IigsrpE2RdCKGM14KkYj1Q&utm_source=copy-link" target="_blank" rel="noreferrer" className="liquid-btn liquid-icon-sm" title="Spotify"><SpotifyIcon /></a>
          <a href="mailto:studioseven.ofc@gmail.com" className="liquid-btn liquid-icon-sm" title="Email Us"><MailIcon /></a>
        </div>
      </footer>
    </div>
  )
}
