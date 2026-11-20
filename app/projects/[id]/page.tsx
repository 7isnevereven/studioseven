import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { isProjectScheduled, getProjectDisplayRelease, Project } from '@/data/projects'
import ProjectPageClient from './ProjectPageClient'
import { supabase } from '@/utils/supabase'
import { mapDbProject } from '@/utils/dataStore'
import { PROJECTS as SEED_PROJECTS } from '@/data/seedData'

export const dynamic = 'force-dynamic'

async function getProject(id: string): Promise<Project | null> {
  try {
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
    if (!error && data) {
      return mapDbProject(data)
    }
  } catch (err) {
    console.warn(`[getProject] Supabase query failed for ${id}, falling back to seed data:`, err)
  }
  const fallback = SEED_PROJECTS.find(p => p.id === id)
  return fallback || null
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const project = await getProject(id)

  if (!project) {
    return { title: 'Project Not Found · studioseven' }
  }

  const scheduled = isProjectScheduled(project)
  if (scheduled && !project.allowPreview) {
    return { title: 'Project Not Found · studioseven' }
  }

  const displayRelease = getProjectDisplayRelease(project)
  return {
    title: scheduled ? `${project.title} (Upcoming) · studioseven` : `${project.title} · studioseven`,
    description: `${project.subtitle ? `${project.subtitle} · ` : ''}${displayRelease}. Explore tracklist, history, and community reviews.`,
    openGraph: {
      title: scheduled ? `${project.title} (Upcoming) · studioseven` : `${project.title} · studioseven`,
      description: `${project.subtitle ? `${project.subtitle} · ` : ''}${displayRelease}`,
      siteName: 'studioseven',
    }
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await getProject(id)

  if (!project) {
    notFound()
  }

  // If release is scheduled for future release, allow viewing ONLY if allowPreview is explicitly enabled
  if (isProjectScheduled(project) && !project.allowPreview) {
    notFound()
  }

  return <ProjectPageClient project={project} />
}
