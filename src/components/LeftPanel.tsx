'use client'

import { Project, TrackBadge, getCoverUrl } from '@/data/projects'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co'
const LOGO_URL = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/misc/ss7.png`

function SpotifyIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg> }
function YouTubeIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> }
function Badge({ type }: { type: TrackBadge }) {
  const styles: Record<TrackBadge, { bg: string; text: string }> = { LEAD: { bg: '#22c55e', text: '#000' }, SINGLE: { bg: '#3b82f6', text: '#fff' }, BONUS: { bg: '#eab308', text: '#000' }, DELUXE: { bg: '#a855f7', text: '#fff' }, POEM: { bg: '#ec4899', text: '#fff' } }
  return <span style={{ display: 'inline-flex', padding: '1px 6px', borderRadius: 999, fontSize: 8, fontWeight: 700, background: styles[type].bg, color: styles[type].text }}>{type}</span>
}

interface LeftPanelProps { project: Project; onOpenModal: () => void; isOpen: boolean; onClose: () => void; }

export default function LeftPanel({ project, onOpenModal, isOpen, onClose }: LeftPanelProps) {
  const coverUrl = getCoverUrl(project.coverFile)

  return (
    <>
      <div className={`mobile-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`left-panel ${isOpen ? 'mobile-open' : ''}`} style={{ '--panel-accent': project.accentColor, '--panel-accent-soft': project.accentSoft || `${project.accentColor}80` } as React.CSSProperties}>
        
        <div style={{ padding: '32px 32px 16px 32px', flexShrink: 0, zIndex: 2, position: 'relative' }}>
          <button onClick={onClose} className="glass-btn glass-icon-sm mobile-only" style={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>X</button>
          <img src={LOGO_URL} alt="studioseven" style={{ height: 20, objectFit: 'contain', marginBottom: 20, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 20, color: 'var(--text-main)' }}>Latest Project</h2>

          <div style={{ width: '100%', aspectRatio: '1', flexShrink: 0, minHeight: 200, borderRadius: 28, overflow: 'hidden', marginBottom: 20, boxShadow: '0 24px 48px var(--shadow-heavy)', border: '1px solid var(--glass-border-t)', backgroundColor: 'var(--bg-surface)' }}>
            {coverUrl && <img src={coverUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>

          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, lineHeight: 1.1, color: 'var(--text-main)' }}>{project.title}</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{project.subtitle} | {project.releaseLabel}</p>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 32px', zIndex: 2 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, marginTop: 8, color: 'var(--text-main)' }}>Tracks</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingBottom: 16 }}>
            {project.tracks.map((track, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                <span style={{ fontSize: 11, color: 'var(--text-faint)', width: 16 }}>{i + 1}.</span>
                <span style={{ fontSize: 12, color: 'var(--text-main)', fontWeight: 500 }}>{track.title}</span>
                <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                  {track.badges?.map(b => <Badge key={b} type={b} />)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '24px 32px', flexShrink: 0, background: 'linear-gradient(to top, var(--bg-base) 0%, transparent 100%)', zIndex: 2 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            {project.spotifyUrl && (
              <a href={project.spotifyUrl} target="_blank" rel="noreferrer" className="glass-btn glass-pill" style={{ flex: 1, gap: 8, color: '#1DB954' }}>
                <SpotifyIcon /> <span>Spotify</span>
              </a>
            )}
            {project.youtubeUrl && (
              <a href={project.youtubeUrl} target="_blank" rel="noreferrer" className="glass-btn glass-pill" style={{ flex: 1, gap: 8, color: '#FF0000' }}>
                <YouTubeIcon /> <span>YouTube</span>
              </a>
            )}
          </div>
          <button onClick={onOpenModal} className="glass-btn glass-pill" style={{ width: '100%' }}>
            View Project Details
          </button>
        </div>
      </aside>
    </>
  )
}