'use client'

import { useState } from 'react'
import LeftPanel from '@/components/LeftPanel'
import RightPanel from '@/components/RightPanel'
import ProjectModal from '@/components/ProjectModal'
import ArtistModal from '@/components/ArtistModal'
import NewsModal from '@/components/NewsModal'
import { getFeaturedProject, Project, Artist, NewsItem } from '@/data/projects'

export default function Home() {
  const featuredProject = getFeaturedProject()
  
  // App Routing State
  const [currentView, setCurrentView] = useState<'home' | 'projects' | 'artists' | 'newsroom' | 'about'>('home')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Modal States
  const [modalProject, setModalProject] = useState<Project | null>(null)
  const [modalArtist, setModalArtist] = useState<Artist | null>(null)
  const [modalNews, setModalNews] = useState<NewsItem | null>(null)

  return (
    <div className="app-shell">
      <LeftPanel 
        project={featuredProject} 
        onOpenModal={() => { setModalProject(featuredProject); setIsMobileMenuOpen(false); }} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <RightPanel 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onOpenModal={setModalProject} 
        onOpenArtist={setModalArtist}
        onOpenNews={setModalNews}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
      />

      <NewsModal news={modalNews} onClose={() => setModalNews(null)} />
      <ArtistModal artist={modalArtist} onClose={() => setModalArtist(null)} onOpenProject={setModalProject} />
      <ProjectModal project={modalProject} onClose={() => setModalProject(null)} />
    </div>
  )
}