import { supabase } from '../utils/supabase'

export type TrackBadge = 'LEAD' | 'SINGLE' | 'DELUXE' | 'BONUS' | 'POEM'

export interface TrackCredits {
  writtenBy?: string;
  producedBy?: string;
  featuredArtists?: string;
  additionalCredits?: string;
}

export interface Track {
  title: string;
  badges?: TrackBadge[];
  content?: string;
  credits?: TrackCredits;
}

export interface HistorySection {
  heading: string;
  body: string;
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  bio?: string;
}

export interface ProjectRating {
  id: string;
  project_id: string;
  track_title?: string;
  rating: number;
  name: string;
  description: string;
  created_at: string;
}

export interface ProjectCredits {
  writtenBy?: string;
  producedBy?: string;
  releasedUnder?: string;
  collaboration?: string;
  featuredArtists?: string;
  additionalNotes?: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  showcaseOrder?: number;
  showcaseLabel?: string;
  releasedAt: string;
  releaseLabel: string;
  artistId: string;
  coverFile: string;
  accentColor: string;
  accentSoft: string;
  tracks: Track[];
  spotifyUrl?: string;
  youtubeUrl?: string;
  leadTrack?: string;
  history: HistorySection[];
  featured?: boolean;
  scheduledAt?: string;
  type?: 'project' | 'soundtrack' | 'special' | 'final';
  credits?: ProjectCredits;
}

export interface NewsItem {
  id: string;
  headline: string;
  preview: string;
  body: string;
  date: string;
  projectId?: string;
  url?: string;
  image?: string;
  scheduledAt?: string;
}

export function getCoverUrl(coverFile: string): string {
  if (!coverFile) return ''

  // Auto-convert Google Drive links to direct images
  if (coverFile.includes('drive.google.com')) {
    const match = coverFile.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (match) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`
    }
  }

  if (coverFile.startsWith('http')) return coverFile

  const { data } = supabase.storage.from('album_covers').getPublicUrl(coverFile)
  return data.publicUrl
}

export function formatTimeAgo(dateString: string): string {
  const past = new Date(dateString).getTime()
  const diff = Date.now() - past
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const totalWeeks = Math.floor(days / 7)

  if (totalWeeks < 0) return 'In the future'
  if (totalWeeks === 0) return 'This week'

  const years = Math.floor(totalWeeks / 52)
  const weeks = totalWeeks % 52

  if (years > 0) {
    return `${years}y ${weeks > 0 ? weeks + 'w ' : ''}ago`
  }
  return `${weeks}w ago`
}

/**
 * Ensures any accent color has sufficient contrast and vibrancy to be easily readable
 * on dark backgrounds (in dark mode) or light backgrounds (in light mode).
 */
export function getReadableAccent(hexColor?: string, isLightMode = false): string {
  if (!hexColor || !hexColor.startsWith('#')) {
    return isLightMode ? '#0284c7' : '#38bdf8'
  }

  let c = hexColor.slice(1).trim()
  if (c.length === 3) c = c.split('').map(x => x + x).join('')
  if (c.length !== 6) return isLightMode ? '#0284c7' : '#38bdf8'

  const r = parseInt(c.slice(0, 2), 16) / 255
  const g = parseInt(c.slice(2, 4), 16) / 255
  const b = parseInt(c.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  const hueDeg = Math.round(h * 360)
  
  if (isLightMode) {
    const targetL = Math.min(l, 0.38)
    const targetS = Math.max(s, 0.70)
    return `hsl(${hueDeg}, ${Math.round(targetS * 100)}%, ${Math.round(targetL * 100)}%)`
  } else {
    const targetL = Math.max(l, 0.70)
    const targetS = Math.max(s, 0.65)
    return `hsl(${hueDeg}, ${Math.round(targetS * 100)}%, ${Math.round(targetL * 100)}%)`
  }
}

/**
 * Returns canonical default credits for projects.
 * Default rule: All projects are written and produced by VEN, released under studioseven.
 * Special collaborations:
 * - 'saccharin': Released alongside NAMUJANE Studios
 * - 'cicatrix': Features 13
 * - 'star': Features JHUZZ
 */
export function getDefaultProjectCredits(project: { id: string; artistId?: string; type?: string }): ProjectCredits {
  const isSaccharin = project.id === 'saccharin'
  const isCicatrix = project.id === 'cicatrix'
  const isStar = project.id === 'star'
  const isWhenTheNightFalls = project.id === 'when-the-night-falls'

  return {
    writtenBy: 'VEN',
    producedBy: 'VEN',
    releasedUnder: 'studioseven',
    collaboration: isSaccharin
      ? 'NAMUJANE Studios'
      : isWhenTheNightFalls
      ? 'In memory of Hiro Jin'
      : undefined,
    featuredArtists: isCicatrix
      ? '13'
      : isStar
      ? 'JHUZZ'
      : undefined,
    additionalNotes: isSaccharin
      ? 'Official Motion Picture Soundtrack developed alongside NAMUJANE Studios.'
      : undefined,
  }
}

/**
 * Returns default credits for an individual track.
 */
export function getDefaultTrackCredits(trackTitle: string, projectCredits?: ProjectCredits): TrackCredits {
  const lower = trackTitle.toLowerCase()
  let feat = projectCredits?.featuredArtists
  if (lower.includes('ft. 13') || lower.includes('(ft. 13)')) {
    feat = '13'
  } else if (lower.includes('ft. jhuzz') || lower.includes('(ft. jhuzz)')) {
    feat = 'JHUZZ'
  } else if (!lower.includes('ft.') && !lower.includes('feat.')) {
    feat = undefined
  }

  return {
    writtenBy: projectCredits?.writtenBy || 'VEN',
    producedBy: projectCredits?.producedBy || 'VEN',
    featuredArtists: feat,
  }
}

/**
 * Summarizes track credits into a concise, elegant line.
 */
export function formatTrackCreditsSummary(track: Track, projectCredits?: ProjectCredits): string {
  const credits = track.credits || getDefaultTrackCredits(track.title, projectCredits)
  const parts: string[] = []

  if (credits.featuredArtists) {
    parts.push(`feat. ${credits.featuredArtists}`)
  }

  const writer = credits.writtenBy || 'VEN'
  const producer = credits.producedBy || 'VEN'

  if (writer === producer) {
    parts.push(`Written & Produced by ${writer}`)
  } else {
    parts.push(`Written by ${writer} · Produced by ${producer}`)
  }

  if (credits.additionalCredits) {
    parts.push(credits.additionalCredits)
  }

  return parts.join(' • ')
}

export const ARTISTS: Artist[] = [
  {
    id: 'ven',
    name: 'VEN',
    image: 'whatdoyouknow.jpg',
    spotifyUrl: 'https://open.spotify.com/artist/3hpPUT2YPNiWtwECpLB4wT',
    youtubeUrl: 'https://www.youtube.com/@studioseven.official/',
    bio: `VEN is the creative director, producer, and primary artist behind studioseven.

Over a six-year journey, he has written and produced an interconnected discography spanning 7 distinct projects and an official movie soundtrack, blending complex narratives with cinematic and atmospheric soundscapes.`
  },
  {
    id: 'jhuzz',
    name: 'JHUZZ',
    image: 'star.jpg',
    bio: `JHUZZ is a featured artist who collaborated with VEN during the STAR era and the beginning of "The" Trilogy.

With her distinct, dynamic vocals on the track "THE GOOD ONE", her contribution provided a layer of depth and emotional resonance to the single of the 5th project.`
  },
  {
    id: '13',
    name: '13',
    image: 'cicatrix.png',
    bio: `13 is a featured artist who collaborated with VEN on the deluxe expansion project, CICATRIX.

They are officially featured on the reimagined track "The Gecko (ft. 13)", providing a fresh, dynamic rap verse and an extended outro that expands the dark and complex themes of the album.`
  },
]

// Pure Supabase Architecture:
// All live projects and news are now 100% loaded and served from Supabase.
// Zero static fallback data is kept here to prevent displaying outdated content.
export const PROJECTS: Project[] = []
export const NEWS: NewsItem[] = []