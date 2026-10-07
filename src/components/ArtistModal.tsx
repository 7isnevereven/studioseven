'use client'

import { useEffect, useState } from 'react'
import { Artist, Project, getCoverUrl } from '@/data/projects'

interface ArtistModalProps {
  artist: Artist | null
  projects?: Project[]
  onClose: () => void
  onOpenProject: (p: Project) => void
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  )
}

export default function ArtistModal({ artist, projects = [], onClose, onOpenProject }: ArtistModalProps) {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (artist) setIsClosing(false)
  }, [artist])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => { setIsClosing(false); onClose(); }, 250)
  }

  if (!artist && !isClosing) return null

  const profileUrl = artist ? getCoverUrl(artist.image) : ''
  const artistProjects = artist?.id === 'jhuzz' 
    ? projects.filter(p => p.id === 'star') 
    : artist?.id === '13'
    ? projects.filter(p => p.id === 'cicatrix')
    : projects.filter(p => p.artistId === artist?.id)

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div 
        onClick={e => e.stopPropagation()} 
        className={`modal-container ${isClosing ? 'closing' : ''}`}
        style={{ 
          width: '100%', maxWidth: 920, height: '86vh', borderRadius: 32, position: 'relative', overflow: 'hidden',
          '--modal-accent': 'transparent', '--modal-accent-soft': 'var(--modal-bg-start)'
        } as React.CSSProperties}
      >
        <button
          onClick={handleClose}
          className="liquid-btn liquid-icon-sm"
          style={{ position: 'absolute', top: 24, right: 28, zIndex: 60 }}
          aria-label="Close dialog"
        >
          <CloseIcon />
        </button>

        <div className="modal-content">
          <div className="modal-left artist-left">
            <div className="project-cover" style={{ borderRadius: 28 }}>
              {profileUrl && <img src={profileUrl} alt={artist?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            
            <div className="mobile-only" style={{ flexDirection: 'column', padding: '0 4px', marginTop: 12 }}>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1, marginBottom: 4, letterSpacing: '-0.03em' }}>
                {artist?.name}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                {artistProjects.length} {artistProjects.length === 1 ? 'Release' : 'Releases'}
              </p>
            </div>

            <div style={{ padding: '0 4px', marginTop: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8, letterSpacing: '-0.02em' }}>
                Biography
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {artist?.bio}
              </p>
            </div>
          </div>

          <div className="modal-right">
            
            <div className="desktop-only" style={{ flexDirection: 'column', marginBottom: 20 }}>
              <h2 style={{ fontSize: 44, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1, marginBottom: 6, letterSpacing: '-0.035em' }}>
                {artist?.name}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
                {artistProjects.length} {artistProjects.length === 1 ? 'Curated Release' : 'Curated Releases'}
              </p>
            </div>

            <div className="animate-in" style={{ flex: 1, overflowY: 'auto', paddingBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                {artist?.id === 'jhuzz' ? 'Featured On' : 'Discography'}
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '20px 16px' }}>
                {artistProjects.map(project => {
                  const cover = getCoverUrl(project.coverFile)
                  return (
                    <div 
                      key={project.id} 
                      onClick={() => { onOpenProject(project); handleClose(); }}
                      className="liquid-glass-card"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        padding: 12,
                        cursor: 'pointer'
                      }}
                    >
                      <div 
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                          borderRadius: 16,
                          overflow: 'hidden',
                          backgroundColor: 'var(--bg-surface-solid)',
                          border: '1px solid var(--glass-border-outer)'
                        }}
                      >
                        {cover && <img src={cover} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ padding: '0 2px' }}>
                        <h4 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.25, letterSpacing: '-0.01em' }}>
                          {project.title}
                        </h4>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {project.subtitle}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}