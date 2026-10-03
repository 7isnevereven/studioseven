import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ARTISTS } from '@/data/projects'
import ArtistPageClient from './ArtistPageClient'

export function generateStaticParams() {
  return ARTISTS.map(artist => ({
    id: artist.id,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const artist = ARTISTS.find(a => a.id === id)
  
  if (!artist) {
    return { title: 'Artist Not Found · studioseven' }
  }

  return {
    title: `${artist.name} · studioseven`,
    description: `Discover the biography and releases by ${artist.name} on studioseven.`,
    openGraph: {
      title: `${artist.name} · studioseven`,
      description: `Artist profile for ${artist.name} on studioseven`,
      siteName: 'studioseven',
    }
  }
}

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const artist = ARTISTS.find(a => a.id === id)

  if (!artist) {
    notFound()
  }

  return <ArtistPageClient artist={artist} />
}
