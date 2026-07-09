'use client'

import { useState } from 'react'
import { PROJECTS, ARTISTS, NEWS, Project, Artist, NewsItem, getCoverUrl, formatTimeAgo } from '@/data/projects'
import Navbar from '@/components/NavBar'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co'
const LOGO_URL = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/misc/ss7.png`

function SpotifyIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg> }
function YouTubeIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> }
function RedirectIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> }

function NewsCard({ item, onOpenNews }: { item: NewsItem, onOpenNews: (n: NewsItem) => void }) {
  const project = PROJECTS.find(p => p.id === item.projectId)
  const accent = project?.accentColor ?? '#333'
  const imageUrl = item.image ? (item.image.startsWith('http') ? item.image : getCoverUrl(item.image)) : (project ? getCoverUrl(project.coverFile) : '')
  const bgStyle = imageUrl ? `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 100%), url(${imageUrl}) center/cover no-repeat` : `linear-gradient(to top, ${accent}80 0%, var(--bg-surface) 100%)`

  return (
    <div className="glass-card" onClick={() => onOpenNews(item)} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 200, background: bgStyle }}>
      <div style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#ffffff', marginBottom: 6, lineHeight: 1.2 }}>{item.headline}</h3>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{item.date} • {formatTimeAgo(item.date)}</p>
      </div>
    </div>
  )
}

function ArtistCard({ artist, onOpenArtist }: { artist: Artist, onOpenArtist: (a: Artist) => void }) {
  const imgUrl = getCoverUrl(artist.image)
  return (
    <div className="glass-card" onClick={() => onOpenArtist(artist)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '32px 16px' }}>
      <div style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--glass-border-t)', boxShadow: '0 10px 20px var(--shadow-base)', backgroundColor: 'var(--bg-surface)' }}>
        {imgUrl && <img src={imgUrl} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--text-main)' }}>{artist.name}</span>
    </div>
  )
}

function ProjectCard({ project, onOpenModal }: { project: Project, onOpenModal: (p: Project) => void }) {
  const coverUrl = getCoverUrl(project.coverFile)
  return (
    <div className="glass-card" onClick={() => onOpenModal(project)} style={{ display: 'flex', flexDirection: 'column', padding: 16 }}>
      <div style={{ width: '100%', aspectRatio: '1', borderRadius: 20, overflow: 'hidden', backgroundColor: 'var(--bg-surface)', marginBottom: 16, border: '1px solid var(--glass-border-t)', boxShadow: '0 8px 24px var(--shadow-base)' }}>
        {coverUrl && <img src={coverUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 4px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>{project.title}</h3>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>VEN | {project.releaseLabel}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 12 }}>
          <button className="glass-btn glass-icon-sm" title="Project Details"><RedirectIcon /></button>
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
  onOpenMenu: () => void;
}

export default function RightPanel({ currentView, setCurrentView, onOpenModal, onOpenArtist, onOpenNews, onOpenMenu }: RightPanelProps) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')

  const filteredProjects = PROJECTS.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'newest' ? new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime() : new Date(a.releasedAt).getTime() - new Date(b.releasedAt).getTime())

  return (
    <div className="right-panel">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} onOpenMenu={onOpenMenu} />
      <main className="main-content">
        
        {currentView === 'home' && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
                <h2 className="section-title" style={{ margin: 0 }}>Newsroom</h2>
                <button onClick={() => setCurrentView('newsroom')} className="glass-btn glass-pill-sm desktop-only">View All</button>
              </div>
              <div className="grid-3">
                {NEWS.slice(0, 3).map(item => <NewsCard key={item.id} item={item} onOpenNews={onOpenNews} />)}
              </div>
              <button onClick={() => setCurrentView('newsroom')} className="glass-btn glass-pill mobile-only" style={{ width: '100%', marginTop: 24 }}>View All News</button>
            </section>

            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
                <h2 className="section-title" style={{ margin: 0 }}>Projects</h2>
                <button onClick={() => setCurrentView('projects')} className="glass-btn glass-pill-sm desktop-only">View All</button>
              </div>
              <div className="grid-4">
                {PROJECTS.slice(0, 8).map(project => <ProjectCard key={project.id} project={project} onOpenModal={onOpenModal} />)}
              </div>
              <button onClick={() => setCurrentView('projects')} className="glass-btn glass-pill mobile-only" style={{ width: '100%', marginTop: 24 }}>View All Projects</button>
            </section>

            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
                <h2 className="section-title" style={{ margin: 0 }}>Artists</h2>
                <button onClick={() => setCurrentView('artists')} className="glass-btn glass-pill-sm desktop-only">View All</button>
              </div>
              <div className="grid-artists">
                {ARTISTS.slice(0, 4).map(artist => <ArtistCard key={artist.id} artist={artist} onOpenArtist={onOpenArtist} />)}
              </div>
            </section>
          </div>
        )}

        {currentView === 'projects' && (
          <section className="animate-in">
            <h2 className="section-title">All Projects</h2>
            <div className="search-filter-container">
              <input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="glass-pill glass-input search-input" />
              <select value={sort} onChange={e => setSort(e.target.value as any)} className="glass-pill glass-input" style={{ cursor: 'pointer' }}>
                <option value="newest" style={{ background: 'var(--bg-base)' }}>Newest First</option>
                <option value="oldest" style={{ background: 'var(--bg-base)' }}>Oldest First</option>
              </select>
            </div>
            <div className="grid-4">
              {filteredProjects.map(project => <ProjectCard key={project.id} project={project} onOpenModal={onOpenModal} />)}
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

      <footer style={{ padding: '64px 32px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 11, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <img src={LOGO_URL} alt="studioseven logo" style={{ height: 24, marginBottom: 8, opacity: 0.8 }} />
        <p>A sub-brand under Ori</p>
        <p>2020–2026 · Request for reuse is highly advised.</p>
      </footer>
    </div>
  )
}