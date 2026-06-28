'use client'

import { useEffect, useState } from 'react'
import { Project, TrackBadge, getCoverUrl } from '@/data/projects'

function Badge({ type }: { type: TrackBadge }) {
  const styles: Record<TrackBadge, { bg: string; text: string }> = { LEAD: { bg: '#22c55e', text: '#000' }, SINGLE: { bg: '#3b82f6', text: '#fff' }, BONUS:  { bg: '#eab308', text: '#000' }, DELUXE: { bg: '#a855f7', text: '#fff' }, POEM: { bg: '#ec4899', text: '#fff' } }
  return <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 999, fontSize: 9, fontWeight: 700, background: styles[type].bg, color: styles[type].text }}>{type}</span>
}

export default function ProjectModal({ project, onClose }: { project: Project | null, onClose: () => void }) {
  const [tab, setTab] = useState<'tracklist' | 'history'>('tracklist')
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (project) { setIsClosing(false); setTab('tracklist'); }
  }, [project])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => { setIsClosing(false); onClose(); }, 300)
  }

  if (!project && !isClosing) return null

  const coverUrl = project ? getCoverUrl(project.coverFile) : ''

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div 
        onClick={e => e.stopPropagation()} 
        className={`modal-container ${isClosing ? 'closing' : ''}`}
        style={{ 
          width: '100%', maxWidth: 900, height: '75vh', display: 'flex', gap: 40, padding: 32, borderRadius: 32, position: 'relative', overflow: 'hidden',
          /* Injects the album color into the modal card background and drop-shadow */
          '--modal-accent': project?.accentColor || 'transparent',
          '--modal-accent-soft': project?.accentSoft || 'var(--modal-bg-start)'
        } as React.CSSProperties}
      >
        <button onClick={handleClose} className="glass-btn glass-icon" style={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>X</button>

        <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ width: '100%', aspectRatio: '1', borderRadius: 24, overflow: 'hidden', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--glass-border-t)', boxShadow: '0 20px 40px var(--shadow-base)' }}>
            {coverUrl && <img src={coverUrl} alt={project?.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button onClick={() => setTab('tracklist')} className={`glass-btn glass-pill ${tab === 'tracklist' ? 'active' : ''}`} style={{ width: '100%', justifyContent: 'flex-start' }}>Tracklist</button>
            <button onClick={() => setTab('history')} className={`glass-btn glass-pill ${tab === 'history' ? 'active' : ''}`} style={{ width: '100%', justifyContent: 'flex-start' }}>History</button>
          </div>
        </div>

        <div style={{ flex: 1, paddingRight: 16, marginRight: -16, overflowY: 'auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>{project?.title}</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 40 }}>{project?.subtitle} | {project?.releaseLabel}</p>

          {tab === 'tracklist' ? (
            <div className="animate-in">
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--text-main)' }}>Tracks</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {project?.tracks.map((track, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 16, border: '1px solid var(--glass-border-b)' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-faint)', width: 24 }}>{i + 1}.</span>
                    <span style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 500 }}>{track.title}</span>
                    <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>{track.badges?.map(b => <Badge key={b} type={b} />)}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {project?.history.map((section, idx) => (
                <div key={idx}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'var(--text-main)' }}>{section.heading}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8 }}>{section.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}