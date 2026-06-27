'use client'

import { useState } from 'react'
import LeftPanel from '@/components/LeftPanel'
import RightPanel from '@/components/RightPanel'
import ProjectModal from '@/components/ProjectModal'
import { getFeaturedProject, Project } from '@/data/projects'

export default function Home() {
  const featuredProject = getFeaturedProject()
  const [modalProject, setModalProject] = useState<Project | null>(null)

  return (
    <div className="app-shell">

      {/* ── LEFT PANEL (fixed, never scrolls) ── */}
      <LeftPanel project={featuredProject} />

      {/* ── RIGHT PANEL (scrollable) ── */}
      <RightPanel onOpenModal={setModalProject} />

      {/* ── PROJECT DETAIL MODAL ── */}
      <ProjectModal
        project={modalProject}
        onClose={() => setModalProject(null)}
      />

    </div>
  )
}