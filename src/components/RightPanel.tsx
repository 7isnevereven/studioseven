'use client'

import { useState } from 'react'
import {
  PROJECTS,
  ARTISTS,
  NEWS,
  Project,
  Artist,
  NewsItem,
  getCoverUrl,
} from '@/data/projects'
import Navbar from '@/components/Navbar'

// ─── SPOTIFY / YOUTUBE ICONS ──────────────────────────────────────────────────
function SpotifyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

// ─── NEWS CARD ────────────────────────────────────────────────────────────────
function NewsCard({ item }: { item: NewsItem }) {
  // find accent colour from related project
  const project = PROJECTS.find(p => p.id === item.projectId)
  const accent = project?.accentColor ?? '#333'
  const coverUrl = project ? getCoverUrl(project.coverFile) : ''

  return (
    <div
      className="glass-card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: 130,
        padding: '0',
        cursor: 'default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      {/* Background image */}
      {coverUrl && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${coverUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.25,
            transition: 'opacity 300ms',
          }}
        />
      )}

      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to top, ${accent}cc 0%, transparent 60%)`,
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', padding: '16px 16px 14px' }}>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>
          {item.weeksAgo}w ago
        </p>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 15,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.95)',
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
            marginBottom: 4,
          }}
        >
          {item.headline}
        </h3>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
          {item.preview}
        </p>
      </div>
    </div>
  )
}

// ─── ARTIST CARD ──────────────────────────────────────────────────────────────
function ArtistCard({ artist }: { artist: Artist }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const imgUrl = getCoverUrl(artist.image)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 90,
          height: 90,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid var(--glass-border)',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(12px)',
          flexShrink: 0,
          transition: 'transform 250ms var(--ease-spring), border-color 250ms',
          position: 'relative',
        }}
        onMouseEnter={e => {
          ;(e.currentTarget as HTMLDivElement).style.transform = 'scale(1.06)'
          ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.30)'
        }}
        onMouseLeave={e => {
          ;(e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'
          ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--glass-border)'
        }}
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={artist.name}
            onLoad={() => setImgLoaded(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: imgLoaded ? 1 : 0,
              transition: 'opacity 350ms',
            }}
          />
        ) : (
          // Fallback avatar
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              color: 'rgba(255,255,255,0.25)',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
        )}
      </div>

      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 13,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.85)',
          letterSpacing: '-0.01em',
        }}
      >
        {artist.name}
      </span>
    </div>
  )
}

// ─── PROJECT CARD ─────────────────────────────────────────────────────────────
interface ProjectCardProps {
  project: Project
  onOpenModal: (project: Project) => void
}

function ProjectCard({ project, onOpenModal }: ProjectCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [hovered, setHovered] = useState(false)
  const coverUrl = getCoverUrl(project.coverFile)

  return (
    <div
      className="glass-card"
      style={{
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 20px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.15)`
          : 'var(--glass-shadow)',
        transition: 'transform 280ms var(--ease-spring), box-shadow 280ms var(--ease-smooth)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover art */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '1',
          background: project.accentColor,
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
              transition: 'opacity 400ms ease, transform 350ms var(--ease-smooth)',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
            }}
          />
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: 'rgba(255,255,255,0.95)',
            lineHeight: 1.2,
          }}
        >
          {project.title}
        </h3>

        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.40)', lineHeight: 1.4 }}>
          VEN · {project.subtitle} · {project.releaseLabel}
        </p>

        {project.leadTrack && (
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
            Led by <em>{project.leadTrack}</em>
          </p>
        )}

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 10,
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => onOpenModal(project)}
            style={{
              padding: '5px 12px',
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.85)',
              fontSize: 10,
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
              cursor: 'pointer',
              letterSpacing: '0.02em',
              transition: 'background 150ms, transform 150ms var(--ease-spring)',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.14)'
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
            }}
          >
            Project Details
          </button>

          {project.spotifyUrl && (
            <a
              href={project.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#1DB954',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0,
                transition: 'transform 150ms var(--ease-spring)',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <SpotifyIcon />
            </a>
          )}

          {project.youtubeUrl && (
            <a
              href={project.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#FF0000',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0,
                transition: 'transform 150ms var(--ease-spring)',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <YouTubeIcon />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── ABOUT SECTION ────────────────────────────────────────────────────────────
function AboutSection() {
  return (
    <div
      className="glass-card"
      style={{ padding: '32px 36px', maxWidth: 600 }}
    >
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: 32,
              height: 32,
              borderRadius: i === 2 ? '40% 40% 40% 40% / 50% 50% 50% 50%' : '50%',
              background: i === 2 ? 'rgba(255,255,255,0.85)' : 'transparent',
              border: '2px solid rgba(255,255,255,0.75)',
            }}
          />
        ))}
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          marginBottom: 10,
          color: 'rgba(255,255,255,0.95)',
        }}
      >
        studio<strong>seven</strong>
      </h3>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: 8 }}>
        A sub-brand under Ori, studioseven has been releasing music since 2020.
        From the debut project <em>You Do You</em> to the final chapter <em>SENDOFF</em>,
        each project marks a distinct chapter in VEN's artistic journey.
      </p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)' }}>
        2020–2026 · Request for reuse is highly advised.
      </p>
    </div>
  )
}

// ─── RIGHT PANEL ─────────────────────────────────────────────────────────────
interface RightPanelProps {
  onOpenModal: (project: Project) => void
}

export default function RightPanel({ onOpenModal }: RightPanelProps) {
  return (
    <div className="right-panel">
      <Navbar />

      <main className="main-content">

        {/* ── NEWSROOM ── */}
        <section id="newsroom" className="animate-in">
          <h2 className="section-title">Newsroom</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 16,
            }}
          >
            {NEWS.map(item => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* ── ARTISTS ── */}
        <section id="artists" className="animate-in">
          <h2 className="section-title">Artists</h2>
          <div
            style={{
              display: 'flex',
              gap: 28,
              flexWrap: 'wrap',
            }}
          >
            {ARTISTS.map(artist => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </section>

        {/* ── PROJECTS ── */}
        <section id="projects" className="animate-in">
          <h2 className="section-title">Projects</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 18,
            }}
          >
            {PROJECTS.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpenModal={onOpenModal}
              />
            ))}
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section id="about" className="animate-in">
          <h2 className="section-title">About</h2>
          <AboutSection />
        </section>

      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '32px',
          textAlign: 'center',
          borderTop: '1px solid var(--glass-border)',
          color: 'rgba(255,255,255,0.30)',
          fontSize: 11,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: 16,
                height: 16,
                borderRadius: i === 2 ? '40% 40% 40% 40% / 50% 50% 50% 50%' : '50%',
                background: i === 2 ? 'rgba(255,255,255,0.55)' : 'transparent',
                border: '1.5px solid rgba(255,255,255,0.45)',
              }}
            />
          ))}
        </div>
        <p>studio<strong>seven</strong></p>
        <p>A sub-brand under Ori</p>
        <p>2020–2026 · Request for reuse is highly advised.</p>
      </footer>
    </div>
  )
}