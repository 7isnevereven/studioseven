'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Artist, Project, getCoverUrl } from '@/data/projects'
import { getLiveProjects } from '@/utils/dataStore'
import Navbar from '@/components/Navbar'

const LOGO_URL = 'https://flrwvmfjjuyoyjeeosls.supabase.co/storage/v1/object/public/misc/ss7.png'

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

export default function ArtistPageClient({ artist }: { artist: Artist }) {
  const [liveProjects, setLiveProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [dbError, setDbError] = useState<string | null>(null)

  const loadProjects = async () => {
    setLoading(true)
    setDbError(null)
    const res = await getLiveProjects()
    if (res.error) {
      setDbError(res.error)
    } else {
      setLiveProjects(res.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const profileUrl = getCoverUrl(artist.image)
  const artistProjects = artist.id === 'jhuzz' 
    ? liveProjects.filter(p => p.id === 'star') 
    : artist.id === '13'
    ? liveProjects.filter(p => p.id === 'cicatrix')
    : liveProjects.filter(p => p.artistId === artist.id)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navbar */}
      <Navbar currentView="artists" backTo={{ href: '/#artists', label: 'Artists' }} />

      {/* Navbar spacer for fixed header */}
      <div className="navbar-spacer" />

      {/* Main Full-Page Content */}
      <main style={{ maxWidth: 1140, margin: '0 auto', width: '100%', padding: '36px 28px 80px 28px', display: 'flex', flexDirection: 'column', gap: 48 }}>
        
        {/* Artist Profile Hero Card */}
        <section
          className="material-card detail-hero-grid"
          style={{
            padding: '40px 48px',
            display: 'grid',
            gridTemplateColumns: '180px 1fr',
            gap: 40,
            alignItems: 'center',
            borderRadius: 34,
          }}
        >
          <div className="detail-hero-avatar-wrap" style={{
            width: 160,
            height: 160,
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-surface-solid)',
            border: '2px solid var(--border-default)',
            boxShadow: 'var(--elevation-2)',
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
          <section className="material-card" style={{ padding: '36px 40px', borderRadius: 34 }}>
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

          {/* Database Connection Error */}
          {dbError && (
            <div
              className="material-card"
              style={{
                padding: '28px 24px',
                borderRadius: 26,
                border: '1px solid rgba(239, 68, 68, 0.35)',
                background: 'rgba(239, 68, 68, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 12,
              }}
            >
              <div style={{ fontSize: 28 }}>⚠️</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#ef4444' }}>
                Database Connection Error
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 460 }}>
                Failed to load live releases from Supabase ({dbError}).
              </p>
              <button
                onClick={loadProjects}
                className="material-btn material-pill"
                style={{
                  background: 'var(--text-main)',
                  color: 'var(--bg-base)',
                  borderColor: 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: 13,
                  padding: '6px 20px',
                }}
              >
                Retry Connection
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && !dbError && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              Loading releases from Supabase...
            </div>
          )}

          {!loading && !dbError && artistProjects.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-faint)', fontSize: 13 }}>
              No releases found for this artist in the database.
            </div>
          )}

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
                    className="material-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: 18,
                      cursor: 'pointer',
                      height: '100%',
                      borderRadius: 30
                    }}
                  >
                    <div style={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: 22,
                      overflow: 'hidden',
                      backgroundColor: 'var(--bg-surface-solid)',
                      marginBottom: 14,
                      border: '1px solid var(--border-default)'
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
