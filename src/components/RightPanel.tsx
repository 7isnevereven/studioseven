'use client'

import { useState, useEffect } from 'react'
import { PROJECTS, ARTISTS, NEWS, Project, Artist, NewsItem, getCoverUrl, formatTimeAgo } from '@/data/projects'
import Navbar from '@/components/Navbar'
import { supabase } from '../utils/supabase'

const LOGO_URL = 'https://flrwvmfjjuyoyjeeosls.supabase.co/storage/v1/object/public/misc/ss7.png'

function SpotifyIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg> }
function YouTubeIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> }
function RedirectIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> }
function FacebookIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> }
function InstagramIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> }
function MailIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> }
function SearchIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> }

function StarIcon({ filled, size = 12 }: { filled: boolean, size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#eab308" : "none"} stroke={filled ? "#eab308" : "var(--text-faint)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  )
}

function NewsCard({ item, onOpenNews }: { item: NewsItem, onOpenNews: (n: NewsItem) => void }) {
  const project = PROJECTS.find(p => p.id === item.projectId)
  const imageUrl = item.image ? getCoverUrl(item.image) : (project ? getCoverUrl(project.coverFile) : '')

  return (
    <div className="glass-card" onClick={() => onOpenNews(item)} style={{ display: 'flex', flexDirection: 'column', padding: 16 }}>
      <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 20, overflow: 'hidden', backgroundColor: 'var(--bg-surface)', marginBottom: 16, border: '1px solid var(--glass-border-t)' }}>
        {imageUrl && <img src={imageUrl} alt={item.headline} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 4px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>{item.headline}</h3>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {item.date} • {formatTimeAgo(item.date)}
        </p>
      </div>
    </div>
  )
}

function ArtistCard({ artist, onOpenArtist }: { artist: Artist, onOpenArtist: (a: Artist) => void }) {
  const imgUrl = getCoverUrl(artist.image)
  return (
    <div className="glass-card" onClick={() => onOpenArtist(artist)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '32px 16px' }}>
      <div style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--glass-border-t)', backgroundColor: 'var(--bg-surface)' }}>
        {imgUrl && <img src={imgUrl} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--text-main)' }}>{artist.name}</span>
    </div>
  )
}

function ProjectCard({ project, onOpenModal, avgRating, reviewCount }: { project: Project, onOpenModal: (p: Project) => void, avgRating?: number, reviewCount?: number }) {
  const coverUrl = getCoverUrl(project.coverFile)
  return (
    <div className="glass-card" onClick={() => onOpenModal(project)} style={{ display: 'flex', flexDirection: 'column', padding: 16 }}>
      <div style={{ width: '100%', aspectRatio: '1', borderRadius: 20, overflow: 'hidden', backgroundColor: 'var(--bg-surface)', marginBottom: 16, border: '1px solid var(--glass-border-t)' }}>
        {coverUrl && <img src={coverUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 4px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>{project.title}</h3>
          
          {avgRating && avgRating > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 99, border: '1px solid var(--glass-border-t)' }}>
              <StarIcon filled={true} size={10} />
              <span style={{ fontSize: 11, color: 'var(--text-main)', fontWeight: 700 }}>{avgRating.toFixed(1)}</span>
            </div>
          ) : null}
        </div>

        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{project.subtitle} | {project.releaseLabel}</p>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 12 }}>
          <button className="glass-btn glass-icon-sm" title="Project Details">
            <RedirectIcon />
          </button>
          {project.spotifyUrl && <a href={project.spotifyUrl} onClick={e => e.stopPropagation()} target="_blank" rel="noreferrer" className="glass-btn glass-icon-sm" style={{ color: '#1DB954' }}><SpotifyIcon /></a>}
          {project.youtubeUrl && <a href={project.youtubeUrl} onClick={e => e.stopPropagation()} target="_blank" rel="noreferrer" className="glass-btn glass-icon-sm" style={{ color: '#FF0000' }}><YouTubeIcon /></a>}
        </div>
      </div>
    </div>
  )
}

interface RightPanelProps { 
  currentView: 'home' | 'projects' | 'artists' | 'newsroom' | 'about'; 
  setCurrentView: (v: 'home' | 'projects' | 'artists' | 'newsroom' | 'about') => void; 
  onOpenModal: (p: Project) => void; 
  onOpenArtist: (a: Artist) => void; 
  onOpenNews: (n: NewsItem) => void;
  onToggleSidebar: () => void;
}

export default function RightPanel({ currentView, setCurrentView, onOpenModal, onOpenArtist, onOpenNews, onToggleSidebar }: RightPanelProps) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [ratingsMap, setRatingsMap] = useState<Record<string, { avg: number, count: number }>>({})

  useEffect(() => {
    async function fetchAllRatings() {
      const { data, error } = await supabase.from('ratings').select('project_id, rating').is('track_title', null)
      if (!error && data) {
        const grouped = data.reduce((acc, curr) => {
          if(!acc[curr.project_id]) acc[curr.project_id] = { sum: 0, count: 0 };
          acc[curr.project_id].sum += curr.rating;
          acc[curr.project_id].count += 1;
          return acc;
        }, {} as Record<string, { sum: number, count: number }>)
        
        const finalData: Record<string, {avg: number, count: number}> = {}
        Object.keys(grouped).forEach(key => {
          finalData[key] = {
            avg: grouped[key].sum / grouped[key].count,
            count: grouped[key].count
          }
        })
        setRatingsMap(finalData)
      }
    }

    fetchAllRatings()

    const channel = supabase.channel('public:ratings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ratings' }, () => {
        fetchAllRatings() 
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredProjects = PROJECTS.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'newest' ? new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime() : new Date(a.releasedAt).getTime() - new Date(b.releasedAt).getTime())

  return (
    <div className="right-panel">

      <Navbar currentView={currentView} setCurrentView={setCurrentView} onToggleSidebar={onToggleSidebar} />
      
      <main className="main-content" style={{ paddingTop: 0 }}>
        
        {currentView === 'home' && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
                <h2 className="section-title" style={{ margin: 0 }}>Newsroom</h2>
                <button onClick={() => setCurrentView('newsroom')} className="glass-btn glass-pill-sm desktop-only">View All</button>
              </div>
              <div className="grid-3">
                {NEWS.slice(0, 8).map(item => <NewsCard key={item.id} item={item} onOpenNews={onOpenNews} />)}
              </div>
              <button onClick={() => setCurrentView('newsroom')} className="glass-btn glass-pill mobile-only" style={{ width: '100%', marginTop: 24 }}>View All News</button>
            </section>

            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
                <h2 className="section-title" style={{ margin: 0 }}>Projects</h2>
                <button onClick={() => setCurrentView('projects')} className="glass-btn glass-pill-sm desktop-only">View All</button>
              </div>
              <div className="grid-4">
                {PROJECTS.slice(0, 16).map(project => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    onOpenModal={onOpenModal} 
                    avgRating={ratingsMap[project.id]?.avg} 
                    reviewCount={ratingsMap[project.id]?.count} 
                  />
                ))}
              </div>
              <button onClick={() => setCurrentView('projects')} className="glass-btn glass-pill mobile-only" style={{ width: '100%', marginTop: 24 }}>View All Projects</button>
            </section>

            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
                <h2 className="section-title" style={{ margin: 0 }}>Artists</h2>
                <button onClick={() => setCurrentView('artists')} className="glass-btn glass-pill-sm desktop-only">View All</button>
              </div>
              <div className="grid-artists">
                {ARTISTS.slice(0, 8).map(artist => <ArtistCard key={artist.id} artist={artist} onOpenArtist={onOpenArtist} />)}
              </div>
            </section>
          </div>
        )}

        {currentView === 'projects' && (
          <section className="animate-in">
            <h2 className="section-title">All Projects</h2>
            
            <div className="search-filter-container">
              <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
                <div style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex' }}>
                  <SearchIcon />
                </div>
                <input 
                  type="text" 
                  placeholder="Search projects..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  className="glass-pill glass-input" 
                  style={{ width: '100%', paddingLeft: 48 }} 
                />
              </div>
              <select value={sort} onChange={e => setSort(e.target.value as any)} className="glass-pill glass-input" style={{ cursor: 'pointer' }}>
                <option value="newest" style={{ background: 'var(--bg-base)' }}>Newest First</option>
                <option value="oldest" style={{ background: 'var(--bg-base)' }}>Oldest First</option>
              </select>
            </div>

            <div className="grid-4">
              {filteredProjects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onOpenModal={onOpenModal} 
                  avgRating={ratingsMap[project.id]?.avg} 
                  reviewCount={ratingsMap[project.id]?.count} 
                />
              ))}
            </div>
          </section>
        )}

        {currentView === 'newsroom' && (
          <section className="animate-in">
            <h2 className="section-title">Newsroom</h2>
            <div className="grid-3">
              {NEWS.map(item => <NewsCard key={item.id} item={item} onOpenNews={onOpenNews} />)}
            </div>
          </section>
        )}

        {currentView === 'artists' && (
          <section className="animate-in">
            <h2 className="section-title">Artists</h2>
            <div className="grid-artists">
              {ARTISTS.map(artist => <ArtistCard key={artist.id} artist={artist} onOpenArtist={onOpenArtist} />)}
            </div>
          </section>
        )}

      </main>

      <footer style={{ padding: '64px 32px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 11, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <img src={LOGO_URL} alt="studioseven logo" style={{ height: 18, opacity: 0.8, marginBottom: 8, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
          <p>A sub-brand under team7</p>
          <p>2020–2026 · Request for reuse is highly advised.</p>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="https://www.facebook.com/share/1c28j8dk1Y/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="glass-btn glass-icon-sm" style={{ color: 'var(--text-main)' }}>
            <FacebookIcon />
          </a>
          <a href="https://www.instagram.com/studioseven.ofc?igsh=a3hnOG1keWtyNWMw" target="_blank" rel="noreferrer" className="glass-btn glass-icon-sm" style={{ color: 'var(--text-main)' }}>
            <InstagramIcon />
          </a>
          <a href="https://youtube.com/@studioseven.official?si=U4AJNcT3KV3UbjSo" target="_blank" rel="noreferrer" className="glass-btn glass-icon-sm" style={{ color: 'var(--text-main)' }}>
            <YouTubeIcon />
          </a>
          <a href="https://open.spotify.com/artist/3hpPUT2YPNiWtwECpLB4wT?si=IigsrpE2RdCKGM14KkYj1Q&utm_source=copy-link" target="_blank" rel="noreferrer" className="glass-btn glass-icon-sm" style={{ color: 'var(--text-main)' }}>
            <SpotifyIcon />
          </a>
          <a href="mailto:studioseven.ofc@gmail.com" className="glass-btn glass-icon-sm" style={{ color: 'var(--text-main)' }}>
            <MailIcon />
          </a>
        </div>

      </footer>
    </div>
  )
}