'use client'

import { useState, useEffect } from 'react'
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
  
  // Dynamic Sidebar State (Defaults to true on desktop)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Auto-collapse sidebar on mobile devices during initial load
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false)
    }
  }, [])

  // Modal States
  const [modalProject, setModalProject] = useState<Project | null>(null)
  const [modalArtist, setModalArtist] = useState<Artist | null>(null)
  const [modalNews, setModalNews] = useState<NewsItem | null>(null)

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev)

  return (
    <div className={`app-shell ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <LeftPanel 
        project={featuredProject} 
        onOpenModal={() => { setModalProject(featuredProject); setIsSidebarOpen(false); }} 
        onClose={() => setIsSidebarOpen(false)}
      />

      <RightPanel 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onOpenModal={setModalProject} 
        onOpenArtist={setModalArtist}
        onOpenNews={setModalNews}
        onToggleSidebar={toggleSidebar}
      />

      <NewsModal news={modalNews} onClose={() => setModalNews(null)} />
      <ArtistModal artist={modalArtist} onClose={() => setModalArtist(null)} onOpenProject={setModalProject} />
      <ProjectModal project={modalProject} onClose={() => setModalProject(null)} />
    </div>
  )
}