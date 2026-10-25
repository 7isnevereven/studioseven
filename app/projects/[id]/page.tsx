import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { isProjectScheduled, getProjectDisplayRelease } from '@/data/projects'
import ProjectPageClient from './ProjectPageClient'
import { supabase } from '@/utils/supabase'
import { mapDbProject } from '@/utils/dataStore'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  try {
    const { data: raw } = await supabase.from('projects').select('*').eq('id', id).single()
    if (raw && raw.title) {
      const project = mapDbProject(raw)
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
  } catch {}
  return { title: 'Releases · studioseven' }
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()

  if (error || !data) {
    notFound()
  }

  const project = mapDbProject(data)

  // If release is scheduled for future release, allow viewing ONLY if allowPreview is explicitly enabled
  if (isProjectScheduled(project) && !project.allowPreview) {
    notFound()
  }

  return <ProjectPageClient project={project} />
}
