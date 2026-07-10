'use client'

import { useEffect, useState } from 'react'
import { Project, TrackBadge, getCoverUrl } from '@/data/projects'

function SpotifyIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg> }
function YouTubeIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> }
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
          width: '100%', maxWidth: 900, height: '85vh', borderRadius: 32, position: 'relative', overflow: 'hidden',
          '--modal-accent': project?.accentColor || 'transparent',
          '--modal-accent-soft': project?.accentSoft || 'var(--modal-bg-start)'
        } as React.CSSProperties}
      >
        <button onClick={handleClose} className="glass-btn glass-icon" style={{ position: 'absolute', top: 24, right: 32, zIndex: 20 }}>X</button>

        <div className="modal-content">
          <div className="modal-left">
            <div style={{ width: '100%', aspectRatio: '1', borderRadius: 24, overflow: 'hidden', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--glass-border-t)', boxShadow: '0 20px 40px var(--shadow-base)' }}>
              {coverUrl && <img src={coverUrl} alt={project?.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button onClick={() => setTab('tracklist')} className={`glass-btn glass-pill ${tab === 'tracklist' ? 'active' : ''}`} style={{ width: '100%', justifyContent: 'flex-start' }}>Tracklist</button>
              <button onClick={() => setTab('history')} className={`glass-btn glass-pill ${tab === 'history' ? 'active' : ''}`} style={{ width: '100%', justifyContent: 'flex-start' }}>History</button>
            </div>
          </div>

          <div className="modal-right">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>{project?.title}</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>{project?.subtitle} | {project?.releaseLabel}</p>

            <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
              {project?.spotifyUrl && (
                <a href={project.spotifyUrl} target="_blank" rel="noreferrer" className="glass-btn glass-pill-sm" style={{ gap: 8, color: '#1DB954' }}>
                  <SpotifyIcon /> <span>Listen on Spotify</span>
                </a>
              )}
              {project?.youtubeUrl && (
                <a href={project.youtubeUrl} target="_blank" rel="noreferrer" className="glass-btn glass-pill-sm" style={{ gap: 8, color: '#FF0000' }}>
                  <YouTubeIcon /> <span>Watch on YouTube</span>
                </a>
              )}
            </div>

            {tab === 'tracklist' ? (
              <div className="animate-in">
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--text-main)' }}>Tracks</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {project?.tracks.map((track, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 16, border: '1px solid var(--glass-border-b)' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-faint)', width: 24 }}>{i + 1}.</span>
                      <span style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 500 }}>{track.title}</span>
                      <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', flexWrap: 'wrap' }}>{track.badges?.map(b => <Badge key={b} type={b} />)}</div>
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
    </div>
  )
}