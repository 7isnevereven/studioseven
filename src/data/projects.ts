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
  allowPreview?: boolean;
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
 * Parses a date or ISO string into epoch ms.
 * For date-only strings (YYYY-MM-DD), evaluates to the start of next day (23:59:59.999 local)
 * so scheduled releases on that date remain scheduled until the day is reached.
 */
export function parseTimestamp(dateStr?: string): number | null {
  if (!dateStr) return null
  const trimmed = dateStr.trim()
  if (!trimmed) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-').map(Number)
    const dt = new Date(y, m - 1, d, 0, 0, 0, 0).getTime()
    return isNaN(dt) ? null : dt
  }
  const t = new Date(trimmed).getTime()
  return isNaN(t) ? null : t
}

/**
 * Determines whether a project is scheduled for future release.
 * Returns true if scheduledAt or releasedAt is set to a future timestamp.
 */
export function isProjectScheduled(project?: { scheduledAt?: string; scheduled_at?: string; releasedAt?: string; released_at?: string } | null): boolean {
  if (!project) return false
  const sched = project.scheduledAt || project.scheduled_at
  if (sched) {
    const st = parseTimestamp(sched)
    if (st && st > Date.now()) return true
  }
  const rel = project.releasedAt || project.released_at
  if (rel) {
    const rt = parseTimestamp(rel)
    if (rt && rt > Date.now()) return true
  }
  return false
}

/**
 * Formats the release display label for a project.
 * If the project is scheduled for future release, displays "To Be Released [Date]".
 * Once the schedule has passed / project is released, dynamically displays "Released [Date]".
 */
export function getProjectDisplayRelease(project?: { releasedAt?: string; scheduledAt?: string; releaseLabel?: string } | null): string {
  if (!project) return ''
  const isScheduled = isProjectScheduled(project)
  const rawLabel = project.releaseLabel?.trim() || ''
  const targetDate = project.scheduledAt || project.releasedAt
  const formattedDate = targetDate ? formatScheduledDate(targetDate, false) : ''

  if (!isScheduled) {
    // Project is already released / schedule is up
    if (rawLabel) {
      if (/^(to\s+be\s+released|will\s+be\s+released)(\s*[-:]?\s*on)?\s*[-:]?\s*/i.test(rawLabel)) {
        const cleaned = rawLabel.replace(/^(to\s+be\s+released|will\s+be\s+released)(\s*[-:]?\s*on)?\s*[-:]?\s*/i, '').trim()
        return cleaned ? `Released ${cleaned}` : (formattedDate ? `Released ${formattedDate}` : 'Released')
      }
      if (/^released\s*/i.test(rawLabel)) {
        return rawLabel
      }
      // If it doesn't mention release at all but has a label, check if it's just a date
      if (formattedDate && !rawLabel.toLowerCase().includes('released')) {
        return `Released ${rawLabel}`
      }
      return rawLabel
    }
    return formattedDate ? `Released ${formattedDate}` : 'Released'
  }

  // Project is scheduled for future release
  if (rawLabel) {
    if (/^released\s*[-:]?\s*(on\s*)?/i.test(rawLabel)) {
      const cleaned = rawLabel.replace(/^released\s*[-:]?\s*(on\s*)?/i, '').trim()
      return cleaned ? `To Be Released ${cleaned}` : (formattedDate ? `To Be Released ${formattedDate}` : 'To Be Released')
    }
    if (/^(to\s+be\s+released|will\s+be\s+released)/i.test(rawLabel)) {
      return rawLabel.replace(/^(will\s+be\s+released|to\s+be\s+released)(\s+on)?\s*/i, 'To Be Released ')
    }
    return `To Be Released ${rawLabel}`
  }

  if (formattedDate) {
    return `To Be Released ${formattedDate}`
  }
  return 'To Be Released Soon'
}

/**
 * Formats a scheduled date string for display.
 * Avoids printing fake 8:00 AM on legacy date-only strings (YYYY-MM-DD).
 * For date-time strings, formats the exact hour and minute in the user's local timezone.
 */
export function formatScheduledDate(dateStr?: string, includeTime: boolean = true): string {
  if (!dateStr) return ''
  try {
    const trimmed = dateStr.trim()
    const hasTime = trimmed.includes('T') || trimmed.includes(':')

    let d: Date
    if (!hasTime && /^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, day] = trimmed.split('-').map(Number)
      d = new Date(y, m - 1, day, 12, 0, 0)
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } else {
      d = new Date(trimmed)
    }

    if (isNaN(d.getTime())) return dateStr

    if (!includeTime || !hasTime) {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }

    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return dateStr
  }
}

/**
 * Extracts YYYY-MM-DD in local time from an ISO or date string.
 */
export function getDatePart(isoOrDateStr?: string): string {
  if (!isoOrDateStr) return ''
  const trimmed = isoOrDateStr.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  try {
    const d = new Date(trimmed)
    if (isNaN(d.getTime())) return ''
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  } catch {
    return ''
  }
}

/**
 * Extracts HH:mm in local time from an ISO or date-time string.
 */
export function getTimePart(isoOrDateStr?: string, defaultTime = '00:00'): string {
  if (!isoOrDateStr) return defaultTime
  const trimmed = isoOrDateStr.trim()
  if (!trimmed.includes('T') && !trimmed.includes(':')) {
    return defaultTime
  }
  try {
    const d = new Date(trimmed)
    if (isNaN(d.getTime())) return defaultTime
    const h = String(d.getHours()).padStart(2, '0')
    const m = String(d.getMinutes()).padStart(2, '0')
    return `${h}:${m}`
  } catch {
    return defaultTime
  }
}

/**
 * Combines local date (YYYY-MM-DD) and local time (HH:mm) into an ISO-8601 string.
 */
export function combineDateAndTime(dateStr: string, timeStr: string): string {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  const [hour, min] = (timeStr || '00:00').split(':').map(Number)
  const dateObj = new Date(y, m - 1, d, hour || 0, min || 0, 0, 0)
  return dateObj.toISOString()
}

/**
 * Determines whether a news article is scheduled for future release.
 * Returns true if scheduledAt is set to a future timestamp.
 */
export function isNewsScheduled(news?: { scheduledAt?: string; scheduled_at?: string } | null): boolean {
  if (!news) return false
  const sched = news.scheduledAt || news.scheduled_at
  if (sched) {
    const st = parseTimestamp(sched)
    if (st && st > Date.now()) return true
  }
  return false
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