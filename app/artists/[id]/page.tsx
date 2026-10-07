import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ARTISTS, Artist } from '@/data/projects'
import ArtistPageClient from './ArtistPageClient'
import { supabase } from '@/utils/supabase'

export const dynamic = 'force-dynamic'

async function getArtist(id: string): Promise<Artist | null> {
  try {
    const { data } = await supabase.from('artists').select('*').eq('id', id).single()
    if (data) {
      return {
        id: data.id,
        name: data.name,
        image: data.image,
        bio: data.bio || '',
        spotifyUrl: data.spotify_url || undefined,
        youtubeUrl: data.youtube_url || undefined,
      }
    }
  } catch {}
  return ARTISTS.find(a => a.id === id) || null
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const artist = await getArtist(id)
  
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
  const artist = await getArtist(id)

  if (!artist) {
    notFound()
  }

  return <ArtistPageClient artist={artist} />
}
