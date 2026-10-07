'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { NewsItem, Project, formatTimeAgo } from '@/data/projects'
import { supabase } from '@/utils/supabase'
import Navbar from '@/components/Navbar'

const LOGO_URL = 'https://flrwvmfjjuyoyjeeosls.supabase.co/storage/v1/object/public/misc/ss7.png'
const REACTIONS = ['🔥', '❤️', '🤯', '😢', '👏', '👀']

interface NewsReaction {
  id: string
  news_id: string
  name: string
  reaction: string
  comment: string
  created_at: string
}

function RedirectIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  )
}

interface NewsPageClientProps {
  item: NewsItem
  project: Project | undefined
  imageUrl: string
}

export default function NewsPageClient({ item, imageUrl }: NewsPageClientProps) {
  const [reactions, setReactions] = useState<NewsReaction[]>([])
  const [newReaction, setNewReaction] = useState('')
  const [reviewerName, setReviewerName] = useState('')
  const [reviewerComment, setReviewerComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Close lightbox on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setLightboxOpen(false)
  }, [])
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    const fetchReactions = async () => {
      const { data, error } = await supabase
        .from('news_reactions')
        .select('*')
        .eq('news_id', item.id)
        .order('created_at', { ascending: false })
      if (!error && data) setReactions(data)
    }

    fetchReactions()

    const channel = supabase
      .channel(`news_reactions_${item.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news_reactions', filter: `news_id=eq.${item.id}` }, () => {
        fetchReactions()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [item.id])

  const submitReaction = async () => {
    if (!newReaction || !reviewerName.trim()) return
    setIsSubmitting(true)
    const { data, error } = await supabase.from('news_reactions').insert([{
      news_id: item.id,
      reaction: newReaction,
      name: reviewerName.trim(),
      comment: reviewerComment.trim()
    }]).select()

    if (!error && data) {
      setReactions(prev => {
        if (prev.some(r => r.id === data[0].id)) return prev
        return [data[0], ...prev]
      })
      setNewReaction('')
      setReviewerName('')
      setReviewerComment('')
    }
    setIsSubmitting(false)
  }

  // Count reaction tallies
  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.reaction] = (acc[r.reaction] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', color: 'var(--text-main)', position: 'relative', zIndex: 1 }}>

      {/* Lightbox overlay */}
      {lightboxOpen && imageUrl && (
        <div className="news-lightbox" onClick={() => setLightboxOpen(false)}>
          <button className="news-lightbox-close" onClick={() => setLightboxOpen(false)} aria-label="Close">
            ✕
          </button>
          <img src={imageUrl} alt={item.headline} onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Fixed Navbar */}
      <Navbar currentView="newsroom" backTo={{ href: '/#newsroom', label: 'Newsroom' }} />

      {/* Navbar spacer */}
      <div className="navbar-spacer" />

      {/* Main content */}
      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '44px 28px 96px 28px' }} className="news-page-layout">

        {/* Article */}
        <article className="animate-in">
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {item.date} • {formatTimeAgo(item.date)}
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(28px, 4.5vw, 42px)',
            fontWeight: 800,
            lineHeight: 1.15,
            color: 'var(--text-main)',
            marginBottom: 28,
            letterSpacing: '-0.035em'
          }}>
            {item.headline}
          </h1>

          {/* Quick Reaction Tally Pills */}
          {Object.keys(reactionCounts).length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
              {Object.entries(reactionCounts).map(([emoji, count]) => (
                <div
                  key={emoji}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 12px',
                    borderRadius: 999,
                    background: 'var(--bg-surface-variant)',
                    border: '1px solid var(--border-default)',
                    fontSize: 13,
                    boxShadow: 'var(--elevation-1)'
                  }}
                >
                  <span>{emoji}</span>
                  <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-main)' }}>{count}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ width: '100%', height: 1, background: 'var(--border-subtle)', marginBottom: 32 }} />

          <div style={{
            fontSize: 16.5,
            color: 'var(--text-main)',
            lineHeight: 1.85,
            whiteSpace: 'pre-wrap',
            marginBottom: 32,
            letterSpacing: '-0.01em'
          }}>
            {item.body}
          </div>

          {/* Attached Media Photo at the end of the news article */}
          {imageUrl && (
            <div style={{ marginTop: 12, marginBottom: 36 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 10 }}>
                Attached Media (Click to enlarge)
              </span>
              <div
                className="news-image-wrapper"
                onClick={() => setLightboxOpen(true)}
                title="Click to enlarge photo"
              >
                <img src={imageUrl} alt={item.headline} />
              </div>
            </div>
          )}

          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="liquid-btn liquid-pill"
              style={{ gap: 10, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', fontWeight: 600 }}
            >
              <span>Read Original Publication</span>
              <RedirectIcon />
            </a>
          )}
        </article>

        {/* Sidebar: Community Reactions (Sticky & Independently Scrollable) */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-in news-page-sidebar">
          
          {/* Reaction Form */}
          <div className="material-card" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 16, borderRadius: 30 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              React to this Story
            </h3>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {REACTIONS.map(emoji => {
                const isSelected = newReaction === emoji
                return (
                  <button
                    key={emoji}
                    onClick={() => setNewReaction(emoji)}
                    className={`material-btn ${isSelected ? 'active' : ''}`}
                    style={{
                      borderRadius: 20,
                      width: 44,
                      height: 44,
                      fontSize: isSelected ? 22 : 18,
                      border: isSelected ? '1px solid var(--accent-color)' : '1px solid var(--border-default)',
                      background: isSelected ? 'var(--bg-surface-variant)' : 'transparent',
                    }}
                  >
                    {emoji}
                  </button>
                )
              })}
            </div>

            <input
              type="text"
              className="material-input"
              placeholder="Your Nickname *"
              value={reviewerName}
              onChange={e => setReviewerName(e.target.value)}
              style={{ padding: '12px 18px', borderRadius: 999 }}
            />

            <textarea
              className="material-input"
              placeholder="Add an optional comment..."
              value={reviewerComment}
              onChange={e => setReviewerComment(e.target.value)}
              style={{ minHeight: 85, borderRadius: 22 }}
            />

            <button
              onClick={submitReaction}
              disabled={!newReaction || !reviewerName.trim() || isSubmitting}
              className="material-btn material-pill"
              style={{
                opacity: (!newReaction || !reviewerName.trim() || isSubmitting) ? 0.5 : 1,
                fontWeight: 700,
                background: 'var(--text-main)',
                color: 'var(--bg-base)',
                borderColor: 'var(--text-main)'
              }}
            >
              {isSubmitting ? 'Posting...' : 'Post Reaction'}
            </button>
          </div>

          {/* Reaction Feed */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Community Thoughts ({reactions.length})
            </h3>
            
            {reactions.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>Be the first to react to this article!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reactions.map(r => (
                  <div key={r.id} className="material-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8, borderRadius: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{r.reaction}</span>
                        <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-main)' }}>{r.name}</span>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                        {formatTimeAgo(r.created_at)}
                      </span>
                    </div>
                    {r.comment && (
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55 }}>
                        {r.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </aside>

      </main>
    </div>
  )
}
