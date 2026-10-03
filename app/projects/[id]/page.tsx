import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PROJECTS } from '@/data/projects'
import ProjectPageClient from './ProjectPageClient'

export function generateStaticParams() {
  return PROJECTS.map(project => ({
    id: project.id,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const project = PROJECTS.find(p => p.id === id)
  
  if (!project) {
    return { title: 'Project Not Found · studioseven' }
  }

  return {
    title: `${project.title} · studioseven`,
    description: `${project.subtitle} · ${project.releaseLabel}. Explore tracklist, history, and community reviews.`,
    openGraph: {
      title: `${project.title} · studioseven`,
      description: `${project.subtitle} · ${project.releaseLabel}`,
      siteName: 'studioseven',
    }
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = PROJECTS.find(p => p.id === id)

  if (!project) {
    notFound()
  }

  return <ProjectPageClient project={project} />
}
