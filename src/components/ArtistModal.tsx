'use client'

import { useEffect, useState } from 'react'
import { Artist, Project, PROJECTS, getCoverUrl } from '@/data/projects'

interface ArtistModalProps {
  artist: Artist | null;
  onClose: () => void;
  onOpenProject: (p: Project) => void;
}

export default function ArtistModal({ artist, onClose, onOpenProject }: ArtistModalProps) {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (artist) setIsClosing(false)
  }, [artist])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => { setIsClosing(false); onClose(); }, 300)
  }

  if (!artist && !isClosing) return null

  const profileUrl = artist ? getCoverUrl(artist.image) : ''
  const artistProjects = artist?.id === 'jhuzz' 
    ? PROJECTS.filter(p => p.id === 'star') 
    : artist?.id === '13'
    ? PROJECTS.filter(p => p.id === 'cicatrix')
    : PROJECTS.filter(p => p.artistId === artist?.id)

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div 
        onClick={e => e.stopPropagation()} 
        className={`modal-container ${isClosing ? 'closing' : ''}`}
        style={{ 
          width: '100%', maxWidth: 900, height: '85vh', borderRadius: 32, position: 'relative', overflow: 'hidden',
          '--modal-accent': 'transparent', '--modal-accent-soft': 'var(--modal-bg-start)'
        } as React.CSSProperties}
      >
        <button onClick={handleClose} className="glass-btn glass-icon" style={{ position: 'absolute', top: 24, right: 32, zIndex: 20 }}>X</button>

        <div className="modal-content">
          <div className="modal-left artist-left">
            <div style={{ width: '100%', aspectRatio: '1', borderRadius: 32, overflow: 'hidden', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--glass-border-t)', boxShadow: '0 20px 40px var(--shadow-base)' }}>
              {profileUrl && <img src={profileUrl} alt={artist?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            
            <div style={{ padding: '0 8px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-main)', marginBottom: 12 }}>About</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {artist?.bio}
              </p>
            </div>
          </div>

          <div className="modal-right">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1, marginBottom: 8, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
              {artist?.name}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 40, fontWeight: 500 }}>
              {artistProjects.length} {artistProjects.length === 1 ? 'Project' : 'Projects'}
            </p>

            <div className="animate-in">
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--text-main)' }}>
                {artist?.id === 'jhuzz' ? 'Featured On' : 'Projects'}
              </h3>
              
              <div className="grid-3">
                {artistProjects.map(project => {
                  const cover = getCoverUrl(project.coverFile)
                  return (
                    <div 
                      key={project.id} 
                      onClick={() => { onOpenProject(project); handleClose(); }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer' }}
                    >
                      <div 
                        style={{ width: '100%', aspectRatio: '1', borderRadius: 16, overflow: 'hidden', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--glass-border-t)', transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.borderColor = 'var(--glass-border-b)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'var(--glass-border-t)'; }}
                      >
                        {cover && <img src={cover} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div>
                        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>{project.title}</h4>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{project.subtitle}</p>
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