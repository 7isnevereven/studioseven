'use client'

import { useState, useEffect } from 'react'
import { Project, TrackBadge } from '@/data/projects'

const LOGO_URL = 'https://flrwvmfjjuyoyjeeosls.supabase.co/storage/v1/object/public/misc/ss7.png'

function SpotifyIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg> }
function YouTubeIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> }
function PlayingIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> }
function Badge({ type }: { type: TrackBadge }) {
  const styles: Record<TrackBadge, { bg: string; text: string }> = { LEAD: { bg: '#22c55e', text: '#000' }, SINGLE: { bg: '#3b82f6', text: '#fff' }, BONUS: { bg: '#eab308', text: '#000' }, DELUXE: { bg: '#a855f7', text: '#fff' }, POEM: { bg: '#ec4899', text: '#fff' } }
  return <span style={{ display: 'inline-flex', padding: '1px 6px', borderRadius: 999, fontSize: 8, fontWeight: 700, background: styles[type].bg, color: styles[type].text }}>{type}</span>
}

function getYoutubeListId(url?: string) {
  if (!url) return null;
  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}
function getYoutubeVideoId(url?: string) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/))([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

interface LeftPanelProps { project: Project; onOpenModal: () => void; onClose: () => void; }

export default function LeftPanel({ project, onOpenModal, onClose }: LeftPanelProps) {
  
  const [activeTrackIndex, setActiveTrackIndex] = useState(0)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    setActiveTrackIndex(0)
    setHasInteracted(false)
  }, [project])

  const listId = getYoutubeListId(project.youtubeUrl);
  const videoId = getYoutubeVideoId(project.youtubeUrl);
  
  const embedUrl = listId 
    ? `https://www.youtube.com/embed?listType=playlist&list=${listId}&index=${activeTrackIndex + 1}&rel=0${hasInteracted ? '&autoplay=1' : ''}`
    : videoId 
    ? `https://www.youtube.com/embed/${videoId}?rel=0`
    : null;

  return (
    <>
      <div className="mobile-overlay" onClick={onClose} />
      <aside className="left-panel" style={{ '--panel-accent': project.accentColor, '--panel-accent-soft': project.accentSoft || `${project.accentColor}80` } as React.CSSProperties}>
        
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ padding: '32px 32px 16px 32px', flexShrink: 0, position: 'relative', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <button onClick={onClose} className="glass-btn glass-icon-sm mobile-only" style={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>X</button>
            <img src={LOGO_URL} alt="studioseven" style={{ height: 20, objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))', alignSelf: 'flex-start' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Latest Project</h2>
          </div>

          <div style={{ padding: '0 32px', marginBottom: 20, flexShrink: 0 }}>
            {embedUrl && (
              <div className="glass-card" style={{ width: '100%', height: 220, borderRadius: 20, padding: 0, overflow: 'hidden', boxShadow: '0 16px 40px var(--shadow-heavy)' }}>
                <iframe 
                  key={embedUrl}
                  width="100%" height="100%" 
                  src={embedUrl} 
                  title="studioseven Music Player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  style={{ display: 'block', backgroundColor: 'var(--bg-surface)' }}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6, padding: '0 32px', marginBottom: 32 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, lineHeight: 1.1, color: 'var(--text-main)' }}>{project.title}</h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              {project.subtitle} • {project.releaseLabel}
            </p>
          </div>

          {project.tracks.length > 0 && (
            <div style={{ padding: '0 32px 24px 32px', flex: 1 }}>
              <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: 4, marginBottom: 8 }}>
                Up Next
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {project.tracks.map((track, i) => (
                  <div 
                    key={i} 
                    onClick={() => { setActiveTrackIndex(i); setHasInteracted(true); }}
                    className="queue-track"
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 16, cursor: 'pointer',
                      background: activeTrackIndex === i ? 'var(--glass-hover)' : 'transparent',
                      border: activeTrackIndex === i ? '1px solid var(--glass-border-b)' : '1px solid transparent',
                      boxShadow: activeTrackIndex === i ? 'inset 1px 1px 3px var(--glass-border-l)' : 'none'
                    }}
                  >
                    <span style={{ width: 16, fontSize: 11, color: activeTrackIndex === i ? 'var(--text-main)' : 'var(--text-faint)', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                      {activeTrackIndex === i ? <PlayingIcon /> : i + 1}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: activeTrackIndex === i ? 700 : 500, color: activeTrackIndex === i ? 'var(--text-main)' : 'var(--text-muted)' }}>
                      {track.title}
                    </span>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                      {track.badges?.map(b => <Badge key={b} type={b} />)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ padding: '0 32px 32px 32px', marginTop: 'auto', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {project.spotifyUrl && (
                <a href={project.spotifyUrl} target="_blank" rel="noreferrer" className="glass-btn glass-pill" style={{ flex: 1, gap: 8, color: '#1DB954', padding: '10px 16px' }}>
                  <SpotifyIcon /> <span style={{fontSize: 12}}>Spotify</span>
                </a>
              )}
              {project.youtubeUrl && (
                <a href={project.youtubeUrl} target="_blank" rel="noreferrer" className="glass-btn glass-pill" style={{ flex: 1, gap: 8, color: '#FF0000', padding: '10px 16px' }}>
                  <YouTubeIcon /> <span style={{fontSize: 12}}>YouTube</span>
                </a>
              )}
            </div>
            <button onClick={onOpenModal} className="glass-btn glass-pill" style={{ width: '100%', padding: '12px 24px' }}>
              View Project Details
            </button>
          </div>

        </div>
      </aside>
    </>
  )
}