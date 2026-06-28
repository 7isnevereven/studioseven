'use client'

import { useState } from 'react'
import LeftPanel from '@/components/LeftPanel'
import RightPanel from '@/components/RightPanel'
import ProjectModal from '@/components/ProjectModal'
import ArtistModal from '@/components/ArtistModal'
import { getFeaturedProject, Project, Artist } from '@/data/projects'

export default function Home() {
  const featuredProject = getFeaturedProject()
  
  // App Routing State
  const [currentView, setCurrentView] = useState<'home' | 'projects' | 'artists' | 'newsroom' | 'about'>('home')
  
  // Modal States
  const [modalProject, setModalProject] = useState<Project | null>(null)
  const [modalArtist, setModalArtist] = useState<Artist | null>(null)

  return (
    <div className="app-shell">
      <LeftPanel project={featuredProject} onOpenModal={() => setModalProject(featuredProject)} />

      <RightPanel 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onOpenModal={setModalProject} 
        onOpenArtist={setModalArtist}
      />

      <ProjectModal project={modalProject} onClose={() => setModalProject(null)} />
      <ArtistModal artist={modalArtist} onClose={() => setModalArtist(null)} />
    </div>
  )
}