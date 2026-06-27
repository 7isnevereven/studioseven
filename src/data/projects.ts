// ─── TYPES ────────────────────────────────────────────────────────────────────

export type TrackBadge = 'LEAD' | 'SINGLE'

export interface Track {
  title: string
  badges?: TrackBadge[]
}

export interface HistorySection {
  heading: string
  body: string
}

export interface Artist {
  id: string
  name: string
  /** path inside the Supabase `album_covers` bucket, or a full URL */
  image: string
  spotifyUrl?: string
  youtubeUrl?: string
  bio?: string
}

export interface Project {
  id: string
  title: string
  /** e.g. "The 6th Project", "Official Movie Soundtrack" */
  subtitle: string
  /** ISO date string */
  releasedAt: string
  /** short human-readable label shown in cards */
  releaseLabel: string
  /** artist id */
  artistId: string
  /** filename inside the Supabase `album_covers` bucket */
  coverFile: string
  /** dominant/accent hex pulled from album art – used to tint the UI */
  accentColor: string
  /** softer version for gradients (rgba) */
  accentSoft: string
  tracks: Track[]
  spotifyUrl?: string
  youtubeUrl?: string
  /** "Led by <leadTrack>" shown on project cards */
  leadTrack?: string
  history: HistorySection[]
  /** is this the latest/featured project? */
  featured?: boolean
  /** is this a movie soundtrack / special (not a numbered project)? */
  type?: 'project' | 'soundtrack' | 'special' | 'final'
}

// ─── SUPABASE HELPER ──────────────────────────────────────────────────────────
// Replace YOUR_SUPABASE_PROJECT_URL with your actual project URL.
// e.g. https://xyzcompany.supabase.co
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

export function getCoverUrl(coverFile: string): string {
  if (!coverFile) return ''
  if (coverFile.startsWith('http')) return coverFile
  return `${SUPABASE_URL}/storage/v1/object/public/album_covers/${coverFile}`
}

// ─── ARTISTS ──────────────────────────────────────────────────────────────────

export const ARTISTS: Artist[] = [
  {
    id: 'ven',
    name: 'VEN',
    image: 'ven_profile.jpg', // place in album_covers bucket or swap to full URL
    spotifyUrl: 'https://open.spotify.com/artist/3hpPUT2YPNiWtwECpLB4wT',
    youtubeUrl: 'https://www.youtube.com/@studioseven.official/',
    bio: '7 Projects | 1 Movie Soundtrack',
  },
  {
    id: 'steven',
    name: 'steven',
    image: '', // no image on reference site
  },
  {
    id: 'jhuzz',
    name: 'JHUZZ',
    image: 'jhuzz_profile.jpg',
  },
  {
    id: 'specials',
    name: 'Specials',
    image: 'specials_profile.jpg',
  },
]

// ─── PROJECTS ─────────────────────────────────────────────────────────────────

export const PROJECTS: Project[] = [
  // ── SENDOFF (Final / Latest) ──────────────────────────────────────────────
  {
    id: 'sendoff',
    title: 'SENDOFF',
    subtitle: 'The Final Project',
    releasedAt: '2026-05-29',
    releaseLabel: 'Released May 29, 2026',
    artistId: 'ven',
    coverFile: 'sendoff.png',
    accentColor: '#3b1f5e',
    accentSoft: 'rgba(59, 31, 94, 0.40)',
    leadTrack: 'Bondi',
    type: 'final',
    featured: true,
    spotifyUrl: undefined,
    youtubeUrl: 'https://www.youtube.com/playlist?list=PLzGyT2iTgExANe62FnaNsXrYHpshYbP2X',
    tracks: [
      { title: 'Bondi', badges: ['LEAD'] },
      { title: 'Track 2' },
      { title: 'Track 3' },
      // full tracklist TBD – site marks it as 17 songs
    ],
    history: [
      {
        heading: 'The Final Chapter',
        body: 'SENDOFF is VEN\'s final project under studioseven, marking the end of an era that began in 2020. Details to be announced.',
      },
    ],
  },

  // ── What Do You Know? ─────────────────────────────────────────────────────
  {
    id: 'what-do-you-know',
    title: 'What Do You Know?',
    subtitle: 'The 7th Project',
    releasedAt: '2026-04-08',
    releaseLabel: 'Released Apr 8, 2026',
    artistId: 'ven',
    coverFile: 'whatdoyouknow.jpg',
    accentColor: '#1a2a3a',
    accentSoft: 'rgba(26, 42, 58, 0.40)',
    leadTrack: 'The Video',
    type: 'project',
    spotifyUrl: 'https://open.spotify.com/album/2EYPKI5RNAOFfUE4Qie9vi',
    youtubeUrl: 'https://www.youtube.com/playlist?list=PLzGyT2iTgExANe62FnaNsXrYHpshYbP2X',
    tracks: [
      { title: 'The Video', badges: ['LEAD', 'SINGLE'] },
      { title: 'Poem I' },
      { title: 'Poem II' },
      { title: 'Poem III' },
      { title: 'Poem IV' },
      { title: 'Poem V' },
      { title: 'Poem VI' },
      { title: 'Poem VII' },
      { title: 'Poem VIII' },
    ],
    history: [
      {
        heading: 'Overview',
        body: 'What Do You Know? is VEN\'s 7th project, released April 8, 2026. It features 1 song and 8 poems. The project is led by "The Video."',
      },
    ],
  },

  // ── SACCHARIN ─────────────────────────────────────────────────────────────
  {
    id: 'saccharin',
    title: 'SACCHARIN',
    subtitle: 'Official Movie Soundtrack',
    releasedAt: '2026-01-21',
    releaseLabel: 'Released Jan 21, 2026',
    artistId: 'ven',
    coverFile: 'saccharin.png',
    accentColor: '#1a3a2a',
    accentSoft: 'rgba(26, 58, 42, 0.40)',
    type: 'soundtrack',
    youtubeUrl: 'https://www.youtube.com/playlist?list=PLzGyT2iTgExBb4NRWG6IB3jAckjfvbwhp',
    tracks: [
      { title: 'Track 1' },
      { title: 'Track 2' },
      { title: 'Track 3' },
      { title: 'Track 4' },
      { title: 'Track 5' },
      { title: 'Track 6' },
    ],
    history: [
      {
        heading: 'About the Soundtrack',
        body: 'SACCHARIN is the official motion picture soundtrack for the SACCHARIN film. It features 6 original tracks composed for the project.',
      },
    ],
  },

  // ── CICATRIX ──────────────────────────────────────────────────────────────
  {
    id: 'cicatrix',
    title: 'CICATRIX',
    subtitle: 'The 6th Project – Deluxe',
    releasedAt: '2025-12-17',
    releaseLabel: 'Released Dec 17, 2025',
    artistId: 'ven',
    coverFile: 'cicatrix.png',
    accentColor: '#3a1a1a',
    accentSoft: 'rgba(58, 26, 26, 0.40)',
    leadTrack: 'The Gecko',
    type: 'project',
    spotifyUrl: 'https://open.spotify.com/album/2N3nb2GfkHySKNSqcJxM16',
    youtubeUrl: 'https://www.youtube.com/watch?v=uWQR4ILCLWA&list=PLzGyT2iTgExCzTiK2Ccd7ez_L4Ai7wmG5',
    tracks: [
      { title: 'The Gecko', badges: ['LEAD'] },
      { title: 'Track 2' },
      { title: 'Track 3' },
      { title: 'Track 4' },
      { title: 'Track 5' },
      { title: 'Track 6' },
      { title: 'Track 7' },
      { title: 'Track 8' },
      { title: 'Track 9' },
      { title: 'Track 10' },
      { title: 'Track 11' },
      { title: 'Track 12' },
      { title: 'Track 13' },
      { title: 'Track 14' },
      { title: 'Track 15 (Single)', badges: ['SINGLE'] },
    ],
    history: [
      {
        heading: 'Overview',
        body: 'CICATRIX is the deluxe edition of VEN\'s 6th project, released December 17, 2025. It features 15 tracks including one single, and is led by "The Gecko."',
      },
    ],
  },

  // ── cuts and chances ──────────────────────────────────────────────────────
  {
    id: 'cuts-and-chances',
    title: 'cuts and chances',
    subtitle: 'The 6th Project',
    releasedAt: '2025-08-08',
    releaseLabel: 'Released Aug 8, 2025',
    artistId: 'ven',
    coverFile: 'cutsandchances.jpg',
    accentColor: '#7a2a10',
    accentSoft: 'rgba(122, 42, 16, 0.45)',
    leadTrack: 'The Greatest Heist In History',
    type: 'project',
    spotifyUrl: 'https://open.spotify.com/album/0TniiPkvzO1Io0zvo9v2Cy',
    youtubeUrl: 'https://www.youtube.com/watch?v=clvH280H4eU&list=PLzGyT2iTgExCdzZy7vfAIfz-ijZrEBmBb',
    tracks: [
      { title: 'Cuts' },
      { title: 'Chances', badges: ['SINGLE'] },
      { title: 'The Greatest Heist In History', badges: ['LEAD', 'SINGLE'] },
      { title: 'Cut!' },
      { title: 'Young Again' },
      { title: 'Brighter Days' },
      { title: 'Fits Right' },
    ],
    history: [
      {
        heading: 'Before Release',
        body: 'Following the restructuring of STAR and personal events in May–June 2025, cuts and chances was envisioned to reflect these experiences. Initially titled CUTS, it was designed to be VEN\'s most coherent and conceptually rich project. Development began in June 2025, prior to STAR\'s release. The Greatest Heist In History — originally from STAR — became the focal point, exploring themes of infidelity closely related to THE GOOD ONE (ft. JHUZZ).',
      },
      {
        heading: 'Official Release',
        body: 'On August 8, 2025, the sixth project was officially released and simultaneously made available on Spotify and Apple Music — marking VEN\'s first project on streaming services. The lead track was released August 6, 2025 alongside a music video that became VEN\'s most successful video to date.',
      },
      {
        heading: 'After Release',
        body: 'The project was received positively. Multiple versions of The Greatest Heist In History were released, and Chances was accompanied by a lyric video and additional versions on August 7, 2025.',
      },
    ],
  },

  // ── STAR ──────────────────────────────────────────────────────────────────
  {
    id: 'star',
    title: 'STAR',
    subtitle: 'The 5th Project',
    releasedAt: '2025-06-20',
    releaseLabel: 'Released Jun 20, 2025',
    artistId: 'ven',
    coverFile: 'star.jpg',
    accentColor: '#0a1a3a',
    accentSoft: 'rgba(10, 26, 58, 0.45)',
    leadTrack: 'REAL FORM',
    type: 'project',
    spotifyUrl: 'https://open.spotify.com/album/5Uke3afS2BkUV30mR5V6ty',
    youtubeUrl: 'https://www.youtube.com/watch?v=pvO0XnJ2Kkg&list=PLzGyT2iTgExCO8eATL1hhIx2peol_vY-G',
    tracks: [
      { title: 'REAL FORM', badges: ['LEAD', 'SINGLE'] },
      { title: 'Track 2' },
      { title: 'Track 3' },
      { title: 'Track 4' },
      { title: 'Track 5' },
    ],
    history: [
      {
        heading: 'Overview',
        body: 'STAR is VEN\'s 5th project, released June 20, 2025. It features 5 tracks including one single, led by REAL FORM. Several tracks were later restructured into cuts and chances.',
      },
    ],
  },

  // ── when the night falls ──────────────────────────────────────────────────
  {
    id: 'when-the-night-falls',
    title: 'when the night falls',
    subtitle: 'A Tribute to Hiro Jin',
    releasedAt: '2024-10-06',
    releaseLabel: 'Released Oct 6, 2024',
    artistId: 'ven',
    coverFile: 'whenthenightfalls.jpg', // not in bucket list – may need to add
    accentColor: '#1a1a2a',
    accentSoft: 'rgba(26, 26, 42, 0.45)',
    type: 'special',
    youtubeUrl: 'https://www.youtube.com/watch?v=Bwv_V82Kf_k&list=PLzGyT2iTgExAosOJUh0_59tYves_vLt7q',
    tracks: [
      { title: 'Track 1' },
      { title: 'Track 2' },
    ],
    history: [
      {
        heading: 'Overview',
        body: 'when the night falls is a tribute project dedicated to Hiro Jin, released October 6, 2024. It features 2 tracks.',
      },
    ],
  },

  // ── connections ───────────────────────────────────────────────────────────
  {
    id: 'connections',
    title: 'connections',
    subtitle: 'The 4th Project',
    releasedAt: '2024-09-06',
    releaseLabel: 'Released Sep 6, 2024',
    artistId: 'ven',
    coverFile: 'connections.jpg',
    accentColor: '#3a1a0a',
    accentSoft: 'rgba(58, 26, 10, 0.45)',
    leadTrack: 'crimson red',
    type: 'project',
    spotifyUrl: 'https://open.spotify.com/album/1k7swO9gKAWtmhuv9T1cQl',
    youtubeUrl: 'https://www.youtube.com/watch?v=-eZcw8kWTwU&list=PLzGyT2iTgExADXuVcLSp_J_42I7RPm8Hf',
    tracks: [
      { title: 'crimson red', badges: ['LEAD'] },
      { title: 'Track 2', badges: ['SINGLE'] },
      { title: 'Track 3', badges: ['SINGLE'] },
      { title: 'Track 4', badges: ['SINGLE'] },
    ],
    history: [
      {
        heading: 'Overview',
        body: 'connections is VEN\'s 4th project, released September 6, 2024. It features 4 tracks including 3 singles, led by crimson red.',
      },
    ],
  },

  // ── Something ─────────────────────────────────────────────────────────────
  {
    id: 'something',
    title: 'Something',
    subtitle: 'The 3rd Project',
    releasedAt: '2023-07-03',
    releaseLabel: 'Released Jul 7, 2023',
    artistId: 'ven',
    coverFile: 'something.png',
    accentColor: '#2a2a0a',
    accentSoft: 'rgba(42, 42, 10, 0.45)',
    leadTrack: 'Something',
    type: 'project',
    spotifyUrl: 'https://open.spotify.com/album/1JUY1DqQpD6iv9RhXpSQf9',
    youtubeUrl: 'https://www.youtube.com/playlist?list=PLzGyT2iTgExBl8gwpkV0_DRsg_NzNwOPS',
    tracks: [
      { title: 'Something', badges: ['LEAD', 'SINGLE'] },
      { title: 'Track 2' },
      { title: 'Track 3' },
      { title: 'Track 4' },
    ],
    history: [
      {
        heading: 'Overview',
        body: 'Something is VEN\'s 3rd project, released July 3, 2023. It features 4 tracks including 1 single, led by the title track "Something."',
      },
    ],
  },

  // ── BUBBLE ────────────────────────────────────────────────────────────────
  {
    id: 'bubble',
    title: 'BUBBLE',
    subtitle: 'The 2nd Project',
    releasedAt: '2022-11-21',
    releaseLabel: 'Released Nov 21, 2022',
    artistId: 'ven',
    coverFile: 'bubble.jpg',
    accentColor: '#0a2a3a',
    accentSoft: 'rgba(10, 42, 58, 0.45)',
    leadTrack: 'HERA',
    type: 'project',
    youtubeUrl: 'https://www.youtube.com/watch?v=7DuQMPxhdb4&list=PLzGyT2iTgExDZXnkGV4d3YM-qLBOmxv-d',
    tracks: [
      { title: 'HERA', badges: ['LEAD'] },
      { title: 'Track 2', badges: ['SINGLE'] },
      { title: 'Track 3', badges: ['SINGLE'] },
      { title: 'Track 4', badges: ['SINGLE'] },
      { title: 'Track 5' },
      { title: 'Track 6' },
      { title: 'Track 7' },
      { title: 'Track 8' },
      { title: 'Track 9' },
      { title: 'Track 10' },
    ],
    history: [
      {
        heading: 'Overview',
        body: 'BUBBLE is VEN\'s 2nd project, released November 21, 2022. It features 10 tracks including 3 singles, led by HERA.',
      },
    ],
  },

  // ── You Do You ────────────────────────────────────────────────────────────
  {
    id: 'you-do-you',
    title: 'You Do You',
    subtitle: 'The 1st Project',
    releasedAt: '2020-11-24',
    releaseLabel: 'Released Nov 24, 2020',
    artistId: 'ven',
    coverFile: 'youdoyou.jpg',
    accentColor: '#1a0a2a',
    accentSoft: 'rgba(26, 10, 42, 0.45)',
    leadTrack: 'Overturn',
    type: 'project',
    spotifyUrl: 'https://open.spotify.com/album/2qkcrMVIoipKOkehyEDZqk',
    youtubeUrl: 'https://www.youtube.com/watch?v=vkPTwlpQfX8&list=PLzGyT2iTgExBl8gwpkV0_DRsg_NzNwOPS',
    tracks: [
      { title: 'Overturn', badges: ['LEAD', 'SINGLE'] },
      { title: 'Track 2', badges: ['SINGLE'] },
      { title: 'Track 3', badges: ['SINGLE'] },
      { title: 'Track 4' },
    ],
    history: [
      {
        heading: 'Overview',
        body: 'You Do You is VEN\'s debut project, released November 24, 2020. It features 4 tracks including 3 singles, led by "Overturn."',
      },
    ],
  },
]

// ─── SPECIALS ─────────────────────────────────────────────────────────────────

export interface Special {
  id: string
  title: string
  subtitle: string
  releasedAt: string
  releaseLabel: string
  youtubeUrl?: string
  spotifyUrl?: string
  coverFile: string
  accentColor: string
  accentSoft: string
}

export const SPECIALS: Special[] = [
  {
    id: 'drunk-enough',
    title: 'Drunk Enough To Say "I Love You"?',
    subtitle: 'Single',
    releasedAt: '2026-01-29',
    releaseLabel: 'Released Jan 29, 2026',
    youtubeUrl: 'https://youtu.be/hb-LDeEjm_E',
    coverFile: 'drunk_enough.jpg',
    accentColor: '#3a1a2a',
    accentSoft: 'rgba(58, 26, 42, 0.45)',
  },
]

// ─── NEWSROOM ─────────────────────────────────────────────────────────────────

export interface NewsItem {
  id: string
  headline: string
  preview: string
  weeksAgo: number
  projectId?: string
  url?: string
}

export const NEWS: NewsItem[] = [
  {
    id: 'sendoff-out',
    headline: 'SENDOFF out now!',
    preview: "VEN's final project, SENDOFF, is out now on YouTube.",
    weeksAgo: 3,
    projectId: 'sendoff',
    url: 'https://www.youtube.com/playlist?list=PLzGyT2iTgExANe62FnaNsXrYHpshYbP2X',
  },
  {
    id: 'the-video-single',
    headline: 'The Video (Single Pack)',
    preview: 'Extended version of "The Video" is finally out.',
    weeksAgo: 5,
    projectId: 'what-do-you-know',
  },
  {
    id: 'what-do-you-know-soon',
    headline: "What Do You Know?",
    preview: "VEN's 7th project will be out soon.",
    weeksAgo: 7,
    projectId: 'what-do-you-know',
  },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function getFeaturedProject(): Project {
  return PROJECTS.find(p => p.featured) ?? PROJECTS[0]
}

export function getProjectById(id: string): Project | undefined {
  return PROJECTS.find(p => p.id === id)
}

export function getArtistById(id: string): Artist | undefined {
  return ARTISTS.find(a => a.id === id)
}