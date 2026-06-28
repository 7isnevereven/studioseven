'use client'

import { useEffect, useState } from 'react'
import { Artist, PROJECTS, getCoverUrl } from '@/data/projects'

export default function ArtistModal({ artist, onClose }: { artist: Artist | null, onClose: () => void }) {
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
  const artistProjects = PROJECTS.filter(p => p.artistId === artist?.id)

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div 
        onClick={e => e.stopPropagation()} 
        className={`modal-container ${isClosing ? 'closing' : ''}`}
        style={{ 
          width: '100%', maxWidth: 900, height: '75vh', display: 'flex', gap: 40, padding: 32, borderRadius: 32, position: 'relative', overflow: 'hidden',
          /* Artists don't have accent colors, so we just use the clean theme glass */
          '--modal-accent': 'transparent',
          '--modal-accent-soft': 'var(--modal-bg-start)'
        } as React.CSSProperties}
      >
        <button onClick={handleClose} className="glass-btn glass-icon" style={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>X</button>

        <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ width: '100%', aspectRatio: '1', borderRadius: 32, overflow: 'hidden', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--glass-border-t)', boxShadow: '0 20px 40px var(--shadow-base)' }}>
            {profileUrl && <img src={profileUrl} alt={artist?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <div style={{ padding: '0 8px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>studioseven</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>A sub-brand under Ori<br/>2020 - 2026</p>
          </div>
        </div>

        <div style={{ flex: 1, paddingRight: 16, marginRight: -16, overflowY: 'auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1, marginBottom: 8, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
            {artist?.name}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 40, fontWeight: 500 }}>
            {artist?.bio || `${artistProjects.length} Projects`}
          </p>

          <div className="animate-in">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--text-main)' }}>Projects</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 20 }}>
              {artistProjects.map(project => {
                const cover = getCoverUrl(project.coverFile)
                return (
                  <div key={project.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ width: '100%', aspectRatio: '1', borderRadius: 16, overflow: 'hidden', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--glass-border-t)' }}>
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
  )
}