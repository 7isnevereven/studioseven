import { getCoverUrl, NewsItem, Project } from '@/data/projects'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import NewsPageClient from './NewsPageClient'
import { supabase } from '@/utils/supabase'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  try {
    const { data } = await supabase.from('news').select('*').eq('id', id).single()
    if (data && data.headline) {
      if (data.scheduled_at) {
        const scheduledTime = new Date(data.scheduled_at).getTime()
        if (!isNaN(scheduledTime) && scheduledTime > Date.now()) {
          return { title: 'Not Found — studioseven' }
        }
      }
      return {
        title: `${data.headline} — studioseven`,
        description: data.preview || data.headline,
      }
    }
  } catch {}
  return { title: 'Newsroom — studioseven' }
}

export default async function NewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabase.from('news').select('*').eq('id', id).single()

  if (error || !data) {
    notFound()
  }

  // If item is scheduled for future release, it is not yet posted
  if (data.scheduled_at) {
    const scheduledTime = new Date(data.scheduled_at).getTime()
    if (!isNaN(scheduledTime) && scheduledTime > Date.now()) {
      notFound()
    }
  }

  const item: NewsItem = {
    id: data.id,
    headline: data.headline,
    preview: data.preview || '',
    body: data.body,
    date: data.date,
    projectId: data.project_id || undefined,
    url: data.url || undefined,
    image: data.image || undefined,
  }

  let project: Project | undefined = undefined
  if (item.projectId) {
    const { data: pData } = await supabase.from('projects').select('*').eq('id', item.projectId).single()
    if (pData) {
      project = {
        id: pData.id,
        title: pData.title,
        subtitle: pData.subtitle || '',
        description: pData.description || '',
        releasedAt: pData.released_at || '',
        releaseLabel: pData.release_label || '',
        artistId: pData.artist_id || '',
        coverFile: pData.cover_file || '',
        accentColor: pData.accent_color || '#38bdf8',
        accentSoft: pData.accent_soft || '#0284c7',
        spotifyUrl: pData.spotify_url || undefined,
        youtubeUrl: pData.youtube_url || undefined,
        tracks: Array.isArray(pData.tracks) ? pData.tracks : [],
        history: Array.isArray(pData.history) ? pData.history : [],
      }
    }
  }

  const imageUrl = item.image ? getCoverUrl(item.image) : (project ? getCoverUrl(project.coverFile) : '')

  return <NewsPageClient item={item} project={project} imageUrl={imageUrl} />
}
