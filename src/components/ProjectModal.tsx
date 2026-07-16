'use client'

import { useEffect, useState, useRef } from 'react'
import { Project, Track, TrackBadge, getCoverUrl, ProjectRating } from '@/data/projects'
import { supabase } from '../utils/supabase'

function SpotifyIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg> }
function YouTubeIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> }
function ArrowLeftIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> }
function ChevronRightIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg> }

function StarIcon({ filled, onClick, onMouseEnter, onMouseLeave, size = 16 }: any) {
  return (
    <svg 
      width={size} height={size} viewBox="0 0 24 24" 
      fill={filled ? "#eab308" : "none"} 
      stroke={filled ? "#eab308" : "var(--text-muted)"} 
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
      style={{ cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s', flexShrink: 0 }}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  )
}

function Badge({ type }: { type: TrackBadge }) {
  const styles: Record<TrackBadge, { bg: string; text: string }> = { LEAD: { bg: '#22c55e', text: '#000' }, SINGLE: { bg: '#3b82f6', text: '#fff' }, BONUS:  { bg: '#eab308', text: '#000' }, DELUXE: { bg: '#a855f7', text: '#fff' }, POEM: { bg: '#ec4899', text: '#fff' } }
  return <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 999, fontSize: 9, fontWeight: 700, background: styles[type].bg, color: styles[type].text }}>{type}</span>
}

export default function ProjectModal({ project, onClose }: { project: Project | null, onClose: () => void }) {
  const [tab, setTab] = useState<'tracklist' | 'history' | 'ratings'>('tracklist')
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  
  const [allProjectRatings, setAllProjectRatings] = useState<ProjectRating[]>([])
  const [newRating, setNewRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewerName, setReviewerName] = useState('')
  const [reviewerDesc, setReviewerDesc] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const poemScrollRef = useRef<HTMLDivElement>(null)
  const listScrollRef = useRef<HTMLDivElement>(null)
  const mobileScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!project) return;
    
    setIsClosing(false); 
    setTab('tracklist'); 
    setSelectedTrack(null); 
    
    const fetchRatings = async () => {
      const { data, error } = await supabase.from('ratings')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setAllProjectRatings(data);
      }
    }

    fetchRatings();

    const channel = supabase.channel(`ratings_${project.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ratings', filter: `project_id=eq.${project.id}` }, () => {
        fetchRatings(); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, [project])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (poemScrollRef.current) poemScrollRef.current.scrollTop = 0
      if (listScrollRef.current) listScrollRef.current.scrollTop = 0
      if (mobileScrollRef.current) mobileScrollRef.current.scrollTop = 0
    }, 10)
    return () => clearTimeout(timer)
  }, [selectedTrack, tab])

  const resetForm = () => {
    setNewRating(0);
    setHoverRating(0);
    setReviewerName('');
    setReviewerDesc('');
  }

  const submitRating = async () => {
    if (!project || !newRating || !reviewerName.trim()) return;
    setIsSubmitting(true);
    
    const { data, error } = await supabase.from('ratings').insert([{
      project_id: project.id,
      track_title: selectedTrack ? selectedTrack.title : null,
      rating: newRating,
      name: reviewerName.trim(),
      description: reviewerDesc.trim()
    }]).select();

    if (!error && data) {
      setAllProjectRatings(prev => {
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

  if (!project && !isClosing) return null
  const coverUrl = project ? getCoverUrl(project.coverFile) : ''

  const currentRatings = allProjectRatings.filter(r => 
    selectedTrack ? r.track_title === selectedTrack.title : r.track_title === null
  );
  const avgRating = currentRatings.length ? currentRatings.reduce((a, b) => a + b.rating, 0) / currentRatings.length : 0;

  const renderRatings = () => (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      
      <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, cursor: 'default' }}>
        <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>Leave a Rating</h4>
        
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2, 3, 4, 5].map(star => (
            <StarIcon 
              key={star} 
              size={24}
              filled={star <= (hoverRating || newRating)}
              onClick={() => setNewRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            />
          ))}
        </div>

        <input 
          type="text" 
          className="glass-input glass-pill-sm" 
          placeholder="Your Name or Nickname *" 
          value={reviewerName} 
          onChange={e => setReviewerName(e.target.value)} 
          style={{ padding: '12px 20px', borderRadius: 12 }}
        />
        
        <textarea 
          className="glass-input" 
          placeholder="Why did you rate it this way? (Optional)" 
          value={reviewerDesc}
          onChange={e => setReviewerDesc(e.target.value)}
        />

        <button 
          className="glass-btn glass-pill" 
          onClick={submitRating} 
          disabled={!newRating || !reviewerName.trim() || isSubmitting}
          style={{ opacity: (!newRating || !reviewerName.trim() || isSubmitting) ? 0.5 : 1, alignSelf: 'flex-start' }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Rating'}
        </button>
      </div>

      <div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--text-main)' }}>Community Ratings</h3>
        {currentRatings.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>No ratings yet. Be the first to review!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {currentRatings.map(r => (
              <div key={r.id} className="glass-card" style={{ padding: '20px 24px', cursor: 'default', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>{r.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                      {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
                      {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} filled={s <= r.rating} size={12} />)}
                    </div>
                  </div>
                </div>
                {r.description && <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 4 }}>{r.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: 40, width: '100%', flexShrink: 0 }} />
    </div>
  )

  const ProjectHeader = () => (
    <>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>{project?.title}</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {avgRating > 0 && (
          <>
            <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {[1,2,3,4,5].map(s => <StarIcon key={s} filled={s <= Math.round(avgRating)} size={14} />)}
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 700 }}>{avgRating.toFixed(1)}</span>
            <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>({currentRatings.length})</span>
            <span style={{ color: 'var(--glass-border-t)' }}>|</span>
          </>
        )}
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{project?.subtitle} | {project?.releaseLabel}</p>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
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
    </>
  )

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div 
        onClick={e => e.stopPropagation()} 
        className={`modal-container ${isClosing ? 'closing' : ''}`}
        style={{ 
          width: '100%', maxWidth: 900, height: '85vh', borderRadius: 32, position: 'relative', overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
          '--modal-accent': project?.accentColor || 'transparent',
          '--modal-accent-soft': project?.accentSoft || 'var(--modal-bg-start)'
        } as React.CSSProperties}
      >
        <button onClick={handleClose} className="glass-btn glass-icon" style={{ position: 'absolute', top: 24, right: 32, zIndex: 60 }}>X</button>

        <div className="modal-content" ref={mobileScrollRef}>
          <div className="modal-left">
            <div className="project-cover">
              {coverUrl && <img src={coverUrl} alt={project?.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>

            <div className="mobile-only" style={{ flexDirection: 'column' }}>
              <ProjectHeader />
            </div>
            
            <div className="mobile-tabs mobile-only">
              <button onClick={() => { setTab('tracklist'); setSelectedTrack(null); resetForm(); }} className={`glass-btn glass-pill-sm ${tab === 'tracklist' && !selectedTrack ? 'active' : ''}`}>Tracklist</button>
              <button onClick={() => { setTab('history'); setSelectedTrack(null); resetForm(); }} className={`glass-btn glass-pill-sm ${tab === 'history' && !selectedTrack ? 'active' : ''}`}>History</button>
              <button onClick={() => { setTab('ratings'); setSelectedTrack(null); resetForm(); }} className={`glass-btn glass-pill-sm ${tab === 'ratings' && !selectedTrack ? 'active' : ''}`}>Ratings</button>
            </div>

            <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => { setTab('tracklist'); setSelectedTrack(null); resetForm(); }} className={`glass-btn glass-pill ${tab === 'tracklist' && !selectedTrack ? 'active' : ''}`} style={{ width: '100%', justifyContent: 'flex-start' }}>Tracklist</button>
              <button onClick={() => { setTab('history'); setSelectedTrack(null); resetForm(); }} className={`glass-btn glass-pill ${tab === 'history' && !selectedTrack ? 'active' : ''}`} style={{ width: '100%', justifyContent: 'flex-start' }}>History</button>
              <button onClick={() => { setTab('ratings'); setSelectedTrack(null); resetForm(); }} className={`glass-btn glass-pill ${tab === 'ratings' && !selectedTrack ? 'active' : ''}`} style={{ width: '100%', justifyContent: 'flex-start' }}>Ratings</button>
            </div>
          </div>

          <div className="modal-right">
            
            {selectedTrack ? (
              <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                
                <div style={{ flexShrink: 0, paddingBottom: 16, marginTop: -8, position: 'relative', zIndex: 10 }}>
                  <button onClick={() => { setSelectedTrack(null); resetForm(); }} className="glass-btn glass-pill-sm" style={{ gap: 10 }}>
                    <ArrowLeftIcon /> <span>Back to Tracklist</span>
                  </button>
                </div>

                <div ref={poemScrollRef} className="scroll-fade" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                  
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8, lineHeight: 1.1, wordBreak: 'break-word' }}>
                    {selectedTrack.title}
                  </h3>

                  {avgRating > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                      <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        {[1,2,3,4,5].map(s => <StarIcon key={s} filled={s <= Math.round(avgRating)} size={14} />)}
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 700 }}>{avgRating.toFixed(1)}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>({currentRatings.length} Reviews)</span>
                    </div>
                  )}

                  {selectedTrack.content && (
                    <div className="glass-card" style={{ padding: '32px', marginBottom: 40, cursor: 'default' }}>
                      <p style={{ fontSize: 15, color: 'var(--text-main)', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontStyle: 'italic' }}>
                        {selectedTrack.content}
                      </p>
                    </div>
                  )}

                  {renderRatings()}

                </div>

              </div>
            ) : (
              <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                
                <div className="desktop-only" style={{ flexShrink: 0, paddingBottom: 24, flexDirection: 'column' }}>
                  <ProjectHeader />
                </div>

                <div ref={listScrollRef} className="scroll-fade" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                  
                  {tab === 'tracklist' && (
                    <div className="animate-in">
                      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--text-main)' }}>Tracks</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {project?.tracks.map((track, i) => {
                          
                          const trackRatings = allProjectRatings.filter(r => r.track_title === track.title);
                          const trackAvg = trackRatings.length ? trackRatings.reduce((a, b) => a + b.rating, 0) / trackRatings.length : 0;
                          
                          return (
                            <div 
                              key={i} 
                              onClick={() => { setSelectedTrack(track); resetForm(); }}
                              className="hoverable-track"
                              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 16, border: '1px solid var(--glass-border-b)' }}
                            >
                              <span style={{ fontSize: 12, color: 'var(--text-faint)', width: 24 }}>{i + 1}.</span>
                              <span style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 500 }}>{track.title}</span>
                              
                              {trackAvg > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
                                  <StarIcon filled={true} size={12} />
                                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{trackAvg.toFixed(1)}</span>
                                </div>
                              )}

                              <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', alignItems: 'center', flexWrap: 'wrap' }}>
                                {track.badges?.map(b => <Badge key={b} type={b} />)}
                                <span style={{ color: 'var(--text-faint)', display: 'flex', marginLeft: 4 }}><ChevronRightIcon /></span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      
                      {/* Physical spacer to absolutely prevent the bottom shadow from clipping */}
                      <div style={{ height: 40, width: '100%', flexShrink: 0 }} />
                    </div>
                  )}

                  {tab === 'history' && (
                    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                      {project?.history.map((section, idx) => (
                        <div key={idx}>
                          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'var(--text-main)' }}>{section.heading}</h3>
                          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8 }}>{section.body}</p>
                        </div>
                      ))}

                      <div style={{ height: 40, width: '100%', flexShrink: 0 }} />
                    </div>
                  )}

                  {tab === 'ratings' && renderRatings()}

                </div>

              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  )
}