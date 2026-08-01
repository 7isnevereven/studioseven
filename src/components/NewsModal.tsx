'use client'

import { useEffect, useState, useRef } from 'react'
import { NewsItem, PROJECTS, getCoverUrl, formatTimeAgo } from '@/data/projects'
import { supabase } from '../utils/supabase'

function RedirectIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> }

export interface NewsReaction {
  id: string;
  news_id: string;
  name: string;
  reaction: string;
  comment: string;
  created_at: string;
}

const REACTIONS = ['🔥', '❤️', '🤯', '😢', '👏', '👀']

export default function NewsModal({ news, onClose }: { news: NewsItem | null, onClose: () => void }) {
  const [isClosing, setIsClosing] = useState(false)
  
  // Community Interaction States
  const [reactions, setReactions] = useState<NewsReaction[]>([])
  const [newReaction, setNewReaction] = useState('')
  const [reviewerName, setReviewerName] = useState('')
  const [reviewerComment, setReviewerComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const mobileScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!news) return;
    
    setIsClosing(false);
    
    const fetchReactions = async () => {
      const { data, error } = await supabase.from('news_reactions')
        .select('*')
        .eq('news_id', news.id)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setReactions(data);
      }
    }

    fetchReactions();

    const channel = supabase.channel(`news_reactions_${news.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news_reactions', filter: `news_id=eq.${news.id}` }, () => {
        fetchReactions(); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, [news])

  const resetForm = () => {
    setNewReaction('');
    setReviewerName('');
    setReviewerComment('');
  }

  const submitReaction = async () => {
    if (!news || !newReaction || !reviewerName.trim()) return;
    setIsSubmitting(true);
    
    const { data, error } = await supabase.from('news_reactions').insert([{
      news_id: news.id,
      reaction: newReaction,
      name: reviewerName.trim(),
      comment: reviewerComment.trim()
    }]).select();

    if (!error && data) {
      setReactions(prev => {
        if (prev.some(r => r.id === data[0].id)) return prev;
        return [data[0], ...prev];
      });
      resetForm();
    }
    setIsSubmitting(false);
  }

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
          width: '100%', maxWidth: 1000, height: '85vh', borderRadius: 32, position: 'relative', overflow: 'hidden',
          '--modal-accent': project?.accentColor || 'transparent',
          '--modal-accent-soft': project?.accentSoft || 'var(--modal-bg-start)'
        } as React.CSSProperties}
      >
        <button onClick={handleClose} className="glass-btn glass-icon" style={{ position: 'absolute', top: 24, right: 32, zIndex: 60 }}>X</button>

        <div className="news-modal-content" ref={mobileScrollRef}>
          
          {/* ── LEFT PANEL: NEWS CONTENT ── */}
          <div className="news-modal-left">
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 32 }}>
                {imageUrl && (
                  <div style={{ width: 100, height: 100, borderRadius: 20, overflow: 'hidden', border: '1px solid var(--glass-border-t)', flexShrink: 0, backgroundColor: 'var(--bg-surface)', boxShadow: '0 8px 24px var(--shadow-base)' }}>
                    <img src={imageUrl} alt="News Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {news?.date} • {news ? formatTimeAgo(news.date) : ''}
                  </p>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
                    {news?.headline}
                  </h2>
                </div>
              </div>

              <div style={{ width: '100%', height: 1, background: 'var(--glass-border-b)', flexShrink: 0, marginBottom: 32 }} />

              <p style={{ fontSize: 15, color: 'var(--text-main)', lineHeight: 1.8, whiteSpace: 'pre-wrap', paddingBottom: 32 }}>
                {news?.body}
              </p>

              {news?.url && (
                <div style={{ paddingBottom: 48 }}>
                  <a href={news.url} target="_blank" rel="noreferrer" className="glass-btn glass-pill" style={{ gap: 12 }}>
                    <RedirectIcon /> <span>View Source</span>
                  </a>
                </div>
              )}

            </div>
          </div>

          {/* ── RIGHT PANEL: COMMUNITY INTERACTIONS ── */}
          <div className="news-modal-right">
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
              
              {/* Submission Form Card */}
              <div className="glass-card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20, cursor: 'default' }}>
                <h4 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>Share Your Reaction</h4>
                
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 4, alignItems: 'center', minHeight: 44 }}>
                  {REACTIONS.map(emoji => {
                    // DYNAMIC STYLING LOGIC FOR SELECTION
                    const isSelected = newReaction === emoji;
                    const hasSelection = newReaction !== '';
                    
                    return (
                      <button
                        key={emoji}
                        onClick={() => setNewReaction(emoji)}
                        className={`glass-btn glass-icon-sm ${isSelected ? 'active' : ''}`}
                        style={{ 
                          fontSize: isSelected ? 20 : 16, 
                          background: isSelected ? 'var(--glass-border-t)' : 'var(--glass-base)', 
                          borderColor: isSelected ? 'var(--text-main)' : 'transparent',
                          borderWidth: 1,
                          borderStyle: 'solid',
                          opacity: hasSelection && !isSelected ? 0.3 : 1, // Fades out the unselected ones
                          transform: isSelected ? 'scale(1.15)' : 'scale(1)', // Pops the selected one out
                          boxShadow: isSelected ? '0 8px 16px var(--shadow-heavy), 0 0 12px rgba(255,255,255,0.1)' : 'none',
                          transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                          zIndex: isSelected ? 10 : 1
                        }}
                      >
                        {emoji}
                      </button>
                    )
                  })}
                </div>

                <input 
                  type="text" 
                  className="glass-input glass-pill-sm" 
                  placeholder="Your Nickname *" 
                  value={reviewerName} 
                  onChange={e => setReviewerName(e.target.value)} 
                  style={{ padding: '14px 20px', borderRadius: 12 }}
                />
                
                <textarea 
                  className="glass-input" 
                  placeholder="What are your thoughts? (Optional)" 
                  value={reviewerComment}
                  onChange={e => setReviewerComment(e.target.value)}
                />

                <button 
                  className="glass-btn glass-pill" 
                  onClick={submitReaction} 
                  disabled={!newReaction || !reviewerName.trim() || isSubmitting}
                  style={{ opacity: (!newReaction || !reviewerName.trim() || isSubmitting) ? 0.5 : 1, alignSelf: 'flex-start', marginTop: 4 }}
                >
                  {isSubmitting ? 'Posting...' : 'Post Reaction'}
                </button>
              </div>

              {/* Community List */}
              <div style={{ paddingBottom: 48 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--text-main)' }}>Community Reactions</h3>
                {reactions.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>No reactions yet. Be the first to share your thoughts!</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {reactions.map(r => (
                      <div key={r.id} className="glass-card" style={{ padding: '20px 24px', cursor: 'default', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '1px solid var(--glass-border-t)', flexShrink: 0, boxShadow: '0 4px 12px var(--shadow-base)' }}>
                            {r.reaction}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>{r.name}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                              {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        {r.comment && <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{r.comment}</p>}
                        
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}