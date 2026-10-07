import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Project } from '@/data/projects'
import ProjectPageClient from './ProjectPageClient'
import { supabase } from '@/utils/supabase'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  try {
    const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()
    if (project && project.title) {
      if (project.scheduled_at) {
        const scheduledTime = new Date(project.scheduled_at).getTime()
        if (!isNaN(scheduledTime) && scheduledTime > Date.now()) {
          return { title: 'Project Not Found · studioseven' }
        }
      }
      return {
        title: `${project.title} · studioseven`,
        description: `${project.subtitle || ''} · ${project.release_label || ''}. Explore tracklist, history, and community reviews.`,
        openGraph: {
          title: `${project.title} · studioseven`,
          description: `${project.subtitle || ''} · ${project.release_label || ''}`,
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

  // If release is scheduled for future release, it is not yet posted
  if (data.scheduled_at) {
    const scheduledTime = new Date(data.scheduled_at).getTime()
    if (!isNaN(scheduledTime) && scheduledTime > Date.now()) {
      notFound()
    }
  }

  const project: Project = {
    id: data.id,
    title: data.title,
    subtitle: data.subtitle || '',
    description: data.description || '',
    showcaseLabel: data.showcase_label || '',
    showcaseOrder: data.showcase_order !== null && data.showcase_order !== undefined ? Number(data.showcase_order) : 999,
    releasedAt: data.released_at || '',
    releaseLabel: data.release_label || '',
    artistId: data.artist_id || '',
    coverFile: data.cover_file || '',
    accentColor: data.accent_color || '#38bdf8',
    accentSoft: data.accent_soft || '#0284c7',
    spotifyUrl: data.spotify_url || undefined,
    youtubeUrl: data.youtube_url || undefined,
    leadTrack: data.lead_track || undefined,
    tracks: Array.isArray(data.tracks) ? data.tracks : [],
    history: Array.isArray(data.history) ? data.history : [],
    featured: Boolean(data.featured),
    type: data.type || 'project',
  }

  return <ProjectPageClient project={project} />
}
