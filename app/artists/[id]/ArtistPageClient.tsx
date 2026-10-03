'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Artist, Project, PROJECTS, getCoverUrl } from '@/data/projects'

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

export default function ArtistPageClient({ artist }: { artist: Artist }) {
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    setIsLight(document.body.classList.contains('light-mode'))
  }, [])

  const toggleTheme = () => {
    const nextIsLight = !isLight
    setIsLight(nextIsLight)
    if (nextIsLight) {
      document.body.classList.add('light-mode')
    } else {
      document.body.classList.remove('light-mode')
    }
  }

  const profileUrl = getCoverUrl(artist.image)
  const artistProjects = artist.id === 'jhuzz' 
    ? PROJECTS.filter(p => p.id === 'star') 
    : artist.id === '13'
    ? PROJECTS.filter(p => p.id === 'cicatrix')
    : PROJECTS.filter(p => p.artistId === artist.id)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Floating Navbar */}
      <header className="navbar-wrapper">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/#artists" className="liquid-btn liquid-pill-sm" style={{ gap: 8, textDecoration: 'none' }}>
            <ArrowLeftIcon />
            <span>Artists</span>
          </Link>
          <Link href="/" title="studioseven" style={{ display: 'flex', alignItems: 'center' }}>
            <img src={LOGO_URL} alt="studioseven" className="brand-logo-img" />
          </Link>
        </div>

        <nav className="liquid-dock nav-links">
          <Link href="/" className="liquid-btn liquid-pill-sm" style={{ border: 'none', background: 'transparent' }}>Home</Link>
          <Link href="/#newsroom" className="liquid-btn liquid-pill-sm" style={{ border: 'none', background: 'transparent' }}>Newsroom</Link>
          <Link href="/#projects" className="liquid-btn liquid-pill-sm" style={{ border: 'none', background: 'transparent' }}>Projects</Link>
          <Link href="/#artists" className="liquid-btn liquid-pill-sm active" style={{ border: 'none' }}>Artists</Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={toggleTheme} className="liquid-btn liquid-icon-sm" title="Toggle theme">
            {isLight ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </header>

      {/* Navbar spacer for fixed header */}
      <div className="navbar-spacer" />

      {/* Main Full-Page Content */}
      <main style={{ maxWidth: 1140, margin: '0 auto', width: '100%', padding: '24px 28px 80px 28px', display: 'flex', flexDirection: 'column', gap: 48 }}>
        
        {/* Artist Profile Hero Card */}
        <section
          className="liquid-glass-card"
          style={{
            padding: '40px 48px',
            display: 'grid',
            gridTemplateColumns: '180px 1fr',
            gap: 40,
            alignItems: 'center'
          }}
        >
          <div style={{
            width: 170,
            height: 170,
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-surface-solid)',
            border: '2px solid var(--glass-border-specular-top)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4), var(--liquid-inner-rim)',
            margin: '0 auto'
          }}>
            {profileUrl && (
              <img src={profileUrl} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              studioseven Creator Profile
            </span>

            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.1,
              color: 'var(--text-main)'
            }}>
              {artist.name}
            </h1>

            <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>
              {artistProjects.length} {artistProjects.length === 1 ? 'Curated Project' : 'Curated Projects'} in the studioseven discography
            </p>

            {/* Social / Streaming Links */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
              {artist.spotifyUrl && (
                <a
                  href={artist.spotifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="liquid-btn liquid-pill"
                  style={{ gap: 8, color: '#22c55e', background: 'rgba(34, 197, 94, 0.08)', borderColor: 'rgba(34, 197, 94, 0.3)' }}
                >
                  <SpotifyIcon /> <span>Spotify Profile</span>
                </a>
              )}
              {artist.youtubeUrl && (
                <a
                  href={artist.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="liquid-btn liquid-pill"
                  style={{ gap: 8, color: '#ef4444', background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  <YouTubeIcon /> <span>YouTube Channel</span>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Biography */}
        {artist.bio && (
          <section className="liquid-glass-card" style={{ padding: '36px 40px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-main)', marginBottom: 14, letterSpacing: '-0.02em' }}>
              About {artist.name}
            </h2>
            <p style={{ fontSize: 15.5, color: 'var(--text-muted)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {artist.bio}
            </p>
          </section>
        )}

        {/* Discography Grid */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h2 className="section-title">
                {artist.id === 'jhuzz' ? 'Featured On' : 'Discography & Releases'}
              </h2>
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-faint)', fontWeight: 600 }}>
              {artistProjects.length} {artistProjects.length === 1 ? 'Release' : 'Releases'}
            </span>
          </div>

          <div className="grid-4">
            {artistProjects.map(project => {
              const cover = getCoverUrl(project.coverFile)
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <div
                    className="liquid-glass-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: 16,
                      cursor: 'pointer',
                      height: '100%'
                    }}
                  >
                    <div style={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: 18,
                      overflow: 'hidden',
                      backgroundColor: 'var(--bg-surface-solid)',
                      marginBottom: 14,
                      border: '1px solid var(--glass-border-outer)'
                    }}>
                      {cover && (
                        <img src={cover} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 2px' }}>
                      <h3 style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                        {project.title}
                      </h3>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {project.releaseLabel}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

      </main>
    </div>
  )
}
