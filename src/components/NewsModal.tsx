'use client'

import { useEffect, useState } from 'react'
import { NewsItem, PROJECTS, getCoverUrl, formatTimeAgo } from '@/data/projects'

function RedirectIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> }

export default function NewsModal({ news, onClose }: { news: NewsItem | null, onClose: () => void }) {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (news) setIsClosing(false)
  }, [news])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => { setIsClosing(false); onClose(); }, 300)
  }

  if (!news && !isClosing) return null

  const project = PROJECTS.find(p => p.id === news?.projectId)
  const imageUrl = news?.image ? getCoverUrl(news.image) : (project ? getCoverUrl(project.coverFile) : '')

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div 
        onClick={e => e.stopPropagation()} 
        className={`modal-container ${isClosing ? 'closing' : ''}`}
        style={{ 
          width: '100%', maxWidth: 700, maxHeight: '85vh', borderRadius: 32, position: 'relative', overflow: 'hidden',
          '--modal-accent': project?.accentColor || 'transparent',
          '--modal-accent-soft': project?.accentSoft || 'var(--modal-bg-start)'
        } as React.CSSProperties}
      >
        <button onClick={handleClose} className="glass-btn glass-icon" style={{ position: 'absolute', top: 24, right: 24, zIndex: 20 }}>X</button>

        <div className="news-content">
          <div className="news-header">
            {imageUrl && (
              <div style={{ width: 100, height: 100, borderRadius: 20, overflow: 'hidden', border: '1px solid var(--glass-border-t)', flexShrink: 0, backgroundColor: 'var(--bg-surface)' }}>
                <img src={imageUrl} alt="News Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {news?.date} • {news ? formatTimeAgo(news.date) : ''}
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
                {news?.headline}
              </h2>
            </div>
          </div>

          <div style={{ width: '100%', height: 1, background: 'var(--glass-border-b)', flexShrink: 0 }} />

          <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {news?.body}
          </p>

          {news?.url && (
            <a href={news.url} target="_blank" rel="noreferrer" className="glass-btn glass-pill" style={{ alignSelf: 'flex-end', marginTop: 8, gap: 12 }}>
              <RedirectIcon /> <span>View Source</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}