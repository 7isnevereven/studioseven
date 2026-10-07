import { supabase } from './supabase'
import { Project, NewsItem, Artist, ARTISTS as SEED_ARTISTS, getDefaultProjectCredits } from '@/data/projects'
import { PROJECTS as SEED_PROJECTS, NEWS as SEED_NEWS } from '@/data/seedData'

// Map database row to Project type
function mapDbProject(row: any): Project {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || '',
    description: row.description || '',
    showcaseOrder: row.showcase_order !== null && row.showcase_order !== undefined ? Number(row.showcase_order) : 999,
    showcaseLabel: row.showcase_label || '',
    releasedAt: row.released_at || '',
    releaseLabel: row.release_label || '',
    artistId: row.artist_id || '',
    coverFile: row.cover_file || '',
    accentColor: row.accent_color || '#38bdf8',
    accentSoft: row.accent_soft || '#0284c7',
    spotifyUrl: row.spotify_url || undefined,
    youtubeUrl: row.youtube_url || undefined,
    leadTrack: row.lead_track || undefined,
    tracks: Array.isArray(row.tracks) ? row.tracks : [],
    history: Array.isArray(row.history) ? row.history : [],
    featured: Boolean(row.featured),
    scheduledAt: row.scheduled_at || undefined,
    type: row.type || 'project',
    credits: row.credits || (row.tracks?.[0] as any)?._projectCredits || getDefaultProjectCredits({ id: row.id, artistId: row.artist_id, type: row.type }),
  }
}

// Map database row to NewsItem type
function mapDbNews(row: any): NewsItem {
  return {
    id: row.id,
    headline: row.headline,
    preview: row.preview || '',
    body: row.body,
    date: row.date,
    projectId: row.project_id || undefined,
    url: row.url || undefined,
    image: row.image || undefined,
    scheduledAt: row.scheduled_at || undefined,
  }
}

// Map database row to Artist
function mapDbArtist(row: any): Artist {
  return {
    id: row.id,
    name: row.name,
    image: row.image || '',
    bio: row.bio || '',
    spotifyUrl: row.spotify_url || undefined,
    youtubeUrl: row.youtube_url || undefined,
  }
}

// Map Project to database insert object
function mapProjectToDb(p: Project) {
  const payloadTracks = (p.tracks || []).map((t, idx) => {
    if (idx === 0 && p.credits) {
      return { ...t, _projectCredits: p.credits }
    }
    return t
  })

  const payload: any = {
    id: p.id,
    title: p.title,
    subtitle: p.subtitle,
    description: p.description || '',
    showcase_order: p.showcaseOrder ?? (p.featured ? 1 : 999),
    showcase_label: p.showcaseLabel || '',
    released_at: p.releasedAt,
    release_label: p.releaseLabel,
    artist_id: p.artistId,
    cover_file: p.coverFile,
    accent_color: p.accentColor,
    accent_soft: p.accentSoft,
    spotify_url: p.spotifyUrl || null,
    youtube_url: p.youtubeUrl || null,
    lead_track: p.leadTrack || null,
    tracks: payloadTracks,
    history: p.history,
    featured: Boolean(p.featured),
    type: p.type || 'project',
    updated_at: new Date().toISOString(),
  }

  if (p.credits) {
    payload.credits = p.credits
  }

  // Scheduling a post is strictly optional. If not set, do not send scheduled_at
  // to prevent PostgREST schema cache errors when the column has not been added yet.
  if (p.scheduledAt && p.scheduledAt.trim()) {
    payload.scheduled_at = p.scheduledAt
  }

  return payload
}

// Map NewsItem to database insert object
function mapNewsToDb(n: NewsItem) {
  const payload: any = {
    id: n.id,
    headline: n.headline,
    preview: n.preview || '',
    body: n.body,
    date: n.date,
    project_id: n.projectId || null,
    url: n.url || null,
    image: n.image || null,
    updated_at: new Date().toISOString(),
  }

  // Scheduling a post is strictly optional.
  if (n.scheduledAt && n.scheduledAt.trim()) {
    payload.scheduled_at = n.scheduledAt
  }

  return payload
}

// Map Artist to database insert object
function mapArtistToDb(a: Artist) {
  const payload: any = {
    id: a.id,
    name: a.name,
    image: a.image,
    bio: a.bio || '',
    updated_at: new Date().toISOString(),
  }

  // Spotify and YouTube for artists are optional. Only attach if non-empty string.
  if (a.spotifyUrl && a.spotifyUrl.trim()) {
    payload.spotify_url = a.spotifyUrl.trim()
  }
  if (a.youtubeUrl && a.youtubeUrl.trim()) {
    payload.youtube_url = a.youtubeUrl.trim()
  }

  return payload
}

export function parseNewsDate(dateStr: string): number {
  if (!dateStr) return 0
  const ts = new Date(dateStr).getTime()
  return isNaN(ts) ? 0 : ts
}

export function sortNewsByDateDesc(items: NewsItem[]): NewsItem[] {
  return [...items].sort((a, b) => parseNewsDate(b.date) - parseNewsDate(a.date))
}

export function parseProjectDate(dateStr: string): number {
  if (!dateStr) return 0
  const ts = new Date(dateStr).getTime()
  return isNaN(ts) ? 0 : ts
}

export function sortProjectsByDateDesc(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => parseProjectDate(b.releasedAt) - parseProjectDate(a.releasedAt))
}

// Pure Supabase Data Fetching — No outdated static fallbacks
// If includeScheduled is false, filters out items scheduled for the future
export async function getLiveNews(includeScheduled: boolean = false): Promise<{ data: NewsItem[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')

    if (error) {
      return { data: [], error: error.message }
    }
    const mapped = (data || []).map(mapDbNews)
    const filtered = includeScheduled
      ? mapped
      : mapped.filter(n => {
          if (!n.scheduledAt) return true
          const scheduledTime = new Date(n.scheduledAt).getTime()
          return isNaN(scheduledTime) || scheduledTime <= Date.now()
        })
    return { data: sortNewsByDateDesc(filtered), error: null }
  } catch (err: any) {
    return { data: [], error: err?.message || 'Database connection error' }
  }
}

// Pure Supabase Data Fetching — Always sorted latest to oldest by release date
// If includeScheduled is false, filters out releases scheduled for the future
export async function getLiveProjects(includeScheduled: boolean = false): Promise<{ data: Project[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')

    if (error) {
      return { data: [], error: error.message }
    }
    const mapped = (data || []).map(mapDbProject)
    const filtered = includeScheduled
      ? mapped
      : mapped.filter(p => {
          if (!p.scheduledAt) return true
          const scheduledTime = new Date(p.scheduledAt).getTime()
          return isNaN(scheduledTime) || scheduledTime <= Date.now()
        })
    return { data: sortProjectsByDateDesc(filtered), error: null }
  } catch (err: any) {
    return { data: [], error: err?.message || 'Database connection error' }
  }
}

// Track deleted artist IDs in localStorage so deleted seeds are never resurrected
function getDeletedArtistIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem('ss7_deleted_artist_ids')
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

export function markArtistDeleted(id: string) {
  if (typeof window === 'undefined') return
  try {
    const ids = getDeletedArtistIds()
    ids.add(id)
    localStorage.setItem('ss7_deleted_artist_ids', JSON.stringify(Array.from(ids)))
  } catch {}
}

export function unmarkArtistDeleted(id: string) {
  if (typeof window === 'undefined') return
  try {
    const ids = getDeletedArtistIds()
    ids.delete(id)
    localStorage.setItem('ss7_deleted_artist_ids', JSON.stringify(Array.from(ids)))
  } catch {}
}

// Pure Supabase Data Fetching — Artists
export async function getLiveArtists(): Promise<{ data: Artist[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      // If table query fails, fallback to seed artists
      return { data: SEED_ARTISTS, error: null }
    }

    const dbArtists = (data || []).map(mapDbArtist)
    const dbIds = new Set(dbArtists.map(a => a.id))
    const deletedIds = getDeletedArtistIds()

    // Find any canonical seed artists that have not yet been stored in Supabase and were not deleted
    const missingSeeds = SEED_ARTISTS.filter(seed => !dbIds.has(seed.id) && !deletedIds.has(seed.id))

    if (missingSeeds.length > 0) {
      // Persist missing seed artists to Supabase so they are permanently saved alongside edited artists
      for (const seed of missingSeeds) {
        saveArtist(seed).catch(() => {})
      }
      const merged = [...dbArtists, ...missingSeeds].sort((a, b) => a.name.localeCompare(b.name))
      return { data: merged, error: null }
    }

    if (dbArtists.length === 0 && deletedIds.size === 0) {
      for (const seed of SEED_ARTISTS) {
        saveArtist(seed).catch(() => {})
      }
      return { data: SEED_ARTISTS, error: null }
    }

    return { data: dbArtists, error: null }
  } catch (err: any) {
    return { data: SEED_ARTISTS, error: null }
  }
}

// Admin: Save or update an artist
export async function saveArtist(artist: Artist): Promise<{ error: any }> {
  unmarkArtistDeleted(artist.id)
  const dbData = mapArtistToDb(artist)
  let { error } = await supabase
    .from('artists')
    .upsert([dbData], { onConflict: 'id' })

  // Schema fallback: if spotify_url, youtube_url, or other columns don't exist in Supabase
  if (error && (error.message.includes('spotify_url') || error.message.includes('youtube_url') || error.message.includes('column') || error.message.includes('schema cache'))) {
    const safeData: any = { ...dbData }
    delete safeData.spotify_url
    delete safeData.youtube_url
    const res = await supabase.from('artists').upsert([safeData], { onConflict: 'id' })
    error = res.error
  }

  return { error }
}

// Admin: Delete an artist
export async function deleteArtist(id: string): Promise<{ error: any }> {
  markArtistDeleted(id)
  const { error } = await supabase
    .from('artists')
    .delete()
    .eq('id', id)
  return { error }
}

// Admin: Save or update a news item
export async function saveNewsItem(item: NewsItem): Promise<{ error: any }> {
  const dbData = mapNewsToDb(item)
  let { error } = await supabase
    .from('news')
    .upsert([dbData], { onConflict: 'id' })

  // Schema fallback: if scheduled_at or other columns don't exist in Supabase
  if (error && (error.message.includes('scheduled_at') || error.message.includes('column') || error.message.includes('schema cache'))) {
    const safeData: any = { ...dbData }
    delete safeData.scheduled_at
    const res = await supabase.from('news').upsert([safeData], { onConflict: 'id' })
    error = res.error
  }
  return { error }
}

// Admin: Delete a news item
export async function deleteNewsItem(id: string): Promise<{ error: any }> {
  const { error } = await supabase
    .from('news')
    .delete()
    .eq('id', id)
  return { error }
}

// Admin: Save or update a project
export async function saveProject(project: Project): Promise<{ error: any }> {
  const dbData = mapProjectToDb(project)
  let { error } = await supabase
    .from('projects')
    .upsert([dbData], { onConflict: 'id' })

  // Schema fallback: if scheduled_at, credits, spotify_url, youtube_url, or showcase columns don't exist in Supabase
  if (error && (error.message.includes('scheduled_at') || error.message.includes('credits') || error.message.includes('spotify_url') || error.message.includes('youtube_url') || error.message.includes('column') || error.message.includes('schema cache'))) {
    const safeData: any = { ...dbData }
    delete safeData.scheduled_at
    delete safeData.credits
    delete safeData.spotify_url
    delete safeData.youtube_url
    let res = await supabase.from('projects').upsert([safeData], { onConflict: 'id' })
    if (res.error && (res.error.message.includes('column') || res.error.message.includes('schema cache'))) {
      delete safeData.description
      delete safeData.showcase_order
      delete safeData.showcase_label
      res = await supabase.from('projects').upsert([safeData], { onConflict: 'id' })
    }
    error = res.error
  }
  return { error }
}

// Admin: Delete a project
export async function deleteProject(id: string): Promise<{ error: any }> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
  return { error }
}

// Admin: Seed from seedData.ts into Supabase
export async function seedAllToSupabase(): Promise<{ newsCount: number; projectsCount: number; error?: string }> {
  try {
    // 1. Seed Projects
    const projectsPayload = SEED_PROJECTS.map(mapProjectToDb)
    let { error: pErr } = await supabase
      .from('projects')
      .upsert(projectsPayload, { onConflict: 'id' })

    // If scheduled_at, description, or showcase columns were not added yet in Supabase, retry without them
    if (pErr) {
      const fallbackPayload = projectsPayload.map(({ scheduled_at, description, showcase_order, showcase_label, ...rest }: any) => rest)
      const retryResult = await supabase
        .from('projects')
        .upsert(fallbackPayload, { onConflict: 'id' })
      pErr = retryResult.error
    }

    if (pErr) throw new Error(`Projects seed error: ${pErr.message}`)

    // 2. Seed News
    const newsPayload = SEED_NEWS.map(mapNewsToDb)
    let { error: nErr } = await supabase
      .from('news')
      .upsert(newsPayload, { onConflict: 'id' })

    if (nErr) {
      const fallbackPayload = newsPayload.map(({ scheduled_at, ...rest }: any) => rest)
      const retryResult = await supabase
        .from('news')
        .upsert(fallbackPayload, { onConflict: 'id' })
      nErr = retryResult.error
    }

    if (nErr) throw new Error(`News seed error: ${nErr.message}`)

    // 3. Seed Artists
    try {
      for (const artist of SEED_ARTISTS) {
        await saveArtist(artist)
      }
    } catch {}

    return { newsCount: SEED_NEWS.length, projectsCount: SEED_PROJECTS.length }
  } catch (err: any) {
    return { newsCount: 0, projectsCount: 0, error: err.message || 'Unknown error during seeding' }
  }
}
