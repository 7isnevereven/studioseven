import { supabase } from '../utils/supabase'

export type TrackBadge = 'LEAD' | 'SINGLE' | 'DELUXE' | 'BONUS' | 'POEM'

export interface Track { title: string; badges?: TrackBadge[] }
export interface HistorySection { heading: string; body: string }
export interface Artist { id: string; name: string; image: string; spotifyUrl?: string; youtubeUrl?: string; bio?: string }
export interface Project {
  id: string; title: string; subtitle: string; releasedAt: string; releaseLabel: string;
  artistId: string; coverFile: string; accentColor: string; accentSoft: string;
  tracks: Track[]; spotifyUrl?: string; youtubeUrl?: string; leadTrack?: string;
  history: HistorySection[]; featured?: boolean; type?: 'project' | 'soundtrack' | 'special' | 'final'
}

export function getCoverUrl(coverFile: string): string {
  if (!coverFile) return ''
  if (coverFile.startsWith('http')) return coverFile
  const { data } = supabase.storage.from('album_covers').getPublicUrl(coverFile)
  return data.publicUrl
}

export const ARTISTS: Artist[] = [
  { id: 'ven', name: 'VEN', image: 'ven_profile.jpg', spotifyUrl: 'https://open.spotify.com/artist/3hpPUT2YPNiWtwECpLB4wT', youtubeUrl: 'https://www.youtube.com/@studioseven.official/', bio: '7 Projects | 1 Movie Soundtrack' },
  { id: 'steven', name: 'steven', image: '' },
  { id: 'jhuzz', name: 'JHUZZ', image: 'jhuzz_profile.jpg' },
  { id: 'specials', name: 'Specials', image: 'specials_profile.jpg' },
]

export const PROJECTS: Project[] = [
  {
    id: 'sendoff', title: 'SENDOFF', subtitle: 'The Final Project', releasedAt: '2026-05-29', releaseLabel: 'Released May 29, 2026', artistId: 'ven', coverFile: 'sendoff1.png', accentColor: '#3b1f5e', accentSoft: 'rgba(59, 31, 94, 0.40)', leadTrack: 'Bondi', type: 'final', featured: true, youtubeUrl: 'https://www.youtube.com/playlist?list=PLzGyT2iTgExANe62FnaNsXrYHpshYbP2X',
    tracks: [
      { title: 'Overturn' },
      { title: '05170319 (Stranger)' },
      { title: 'Hera' },
      { title: 'Satellite' },
      { title: 'Something' },
      { title: 'Idle' },
      { title: 'Crimson Red' },
      { title: 'Andromeda' },
      { title: 'In The Quiet Of The Night' },
      { title: 'Heaven-sent' },
      { title: 'The Good One' },
      { title: 'Real Form' },
      { title: 'Keep It' },
      { title: 'The Greatest Heist In History' },
      { title: 'Chances' },
      { title: 'The Gecko' },
      { title: 'The Video' },
    ],
    history: [ { heading: 'Before Release', body: 'More content will be added soon.' }, 
      { heading: 'Official Release', body: 'More content will be added soon.' }, 
      { heading: 'After Release', body: 'More content will be added soon.' } ],
  },
  {
    id: 'what-do-you-know', title: 'What Do You Know?', subtitle: 'The 7th Project', releasedAt: '2026-04-08', releaseLabel: 'Released Apr 8, 2026', artistId: 'ven', coverFile: 'whatdoyouknow.jpg', accentColor: '#1a2a3a', accentSoft: 'rgba(26, 42, 58, 0.40)', leadTrack: 'The Video', type: 'project', spotifyUrl: 'https://open.spotify.com/album/2EYPKI5RNAOFfUE4Qie9vi', youtubeUrl: 'https://www.youtube.com/playlist?list=PLzGyT2iTgExANe62FnaNsXrYHpshYbP2X',
    tracks: [
      { title: 'In a Row', badges: ['POEM'] },
      { title: 'Where Does This Bring Me?', badges: ['POEM']  },
      { title: 'The Healer', badges: ['POEM']  },
      { title: 'What Do You Know?', badges: ['POEM']  },
      { title: 'To Those We Loved Before', badges: ['POEM']  },
      { title: 'The Video', badges: ['POEM']  },
      { title: 'The Video (Song)', badges: ['LEAD', 'SINGLE']  },
      { title: 'Fear', badges: ['POEM']  },
      { title: 'No Matter', badges: ['POEM']  },
      { title: 'The Video (Extended)', badges: ['SINGLE', 'DELUXE']  },
    ],
    history: [ { heading: 'Before Release', body: 'The concept for What Do You Know? was planned before the release of CICATRIX. The main track was always intended to be titled The Video. Originally set for Q3 2026, it was first introduced as a literary work on February 14, 2026, featuring a glass-inspired look with an off-white colour scheme, reflecting the project\'s themes of clarity and openness.' }, 
      { heading: 'Official Release', body: 'On April 8, 2026, the seventh and final project was officially released — including The Video as its only song, alongside additional poems. The official music video for The Video accompanied the release. Ten days later it became available on major streaming platforms including Spotify and YouTube Music.' }, 
      { heading: 'After Release', body: 'One day after release, The Video (Single Pack) was uploaded to studioseven\'s YouTube channel, including an extended track with a rap verse and a lyric video. What Do You Know? is planned to be VEN\'s final project, closing the series that began in 2020.' } ],
  },
  {
    id: 'saccharin', title: 'SACCHARIN', subtitle: 'Official Movie Soundtrack', releasedAt: '2026-01-21', releaseLabel: 'Released Jan 21, 2026', artistId: 'ven', coverFile: 'saccharin.png', accentColor: '#1a3a2a', accentSoft: 'rgba(26, 58, 42, 0.40)', type: 'soundtrack', youtubeUrl: 'https://www.youtube.com/playlist?list=PLzGyT2iTgExBb4NRWG6IB3jAckjfvbwhp',
    tracks: [
      { title: 'Sweetener' },
      { title: 'Saccharin' },
      { title: 'The Gecko' },
      { title: 'Fits Right' },
      { title: 'In The Quiet Of The Night' },
      { title: 'Aftertaste' },
    ],
    history: [ { heading: 'Before Release', body: 'As part of the Multimedia Arts course at the Polytechnic University of the Philippines – Quezon City, junior students were tasked with creating a short film. VEN served as the sound director for NAMUJANE Studios, conceptualizing an album dedicated to the film. Three tracks were drawn from previous projects; three were new compositions.' }, 
      { heading: 'Official Release', body: 'As part of the Multimedia Arts course at the Polytechnic University of the Philippines – Quezon City, junior students were tasked with creating a short film. VEN served as the sound director for NAMUJANE Studios, conceptualizing an album dedicated to the film. Three tracks were drawn from previous projects; three were new compositions.' }, 
      ],
  },
  {
    id: 'cicatrix', title: 'CICATRIX', subtitle: 'The 6th Project – Deluxe', releasedAt: '2025-12-17', releaseLabel: 'Released Dec 17, 2025', artistId: 'ven', coverFile: 'cicatrix.png', accentColor: '#3a1a1a', accentSoft: 'rgba(58, 26, 26, 0.40)', leadTrack: 'The Gecko', type: 'project', spotifyUrl: 'https://open.spotify.com/album/2N3nb2GfkHySKNSqcJxM16', youtubeUrl: 'https://www.youtube.com/watch?v=uWQR4ILCLWA&list=PLzGyT2iTgExCzTiK2Ccd7ez_L4Ai7wmG5',
    tracks: [
      { title: 'Cuts' },
      { title: 'Chances' },
      { title: 'The Greatest Heist In History' },
      { title: 'Cut!' },
      { title: 'Young Again' },
      { title: 'Brighter Days' },
      { title: 'Fits Right' },
      { title: 'The Gecko', badges: ['LEAD', 'SINGLE'] },
      { title: 'Chances (Sped Up)'},
      { title: 'The Greatest Heist In History (Sped Up)' },
      { title: 'Brighter Days (Sped Up)' },
      { title: 'Young Again (Sped Up)' },
      { title: 'Fits Right (Sped Up)' },
      { title: 'The Gecko (Sped Up)' },
      { title: 'The Gecko (Instrumental)' },
      { title: 'The Gecko (ft. 13)', badges: ['SINGLE', 'DELUXE'] },
    ],
    history: [ { heading: 'Before Release', body: 'CICATRIX was conceptualized as the closing statement of cuts and chances, representing the "scars" left after the emotional journey. The album cover transformed the symbolic burning effect — originally representing love — into imagery of the person who sought to be loved. This was the first album cover to feature VEN in its design. The Gecko was written less than two weeks before release as the conclusion to a trilogy beginning with THE GOOD ONE.' }, 
      { heading: 'Official Release', body: 'On December 17, 2025, the deluxe edition was released alongside a lyric video for The Gecko.' }, 
      { heading: 'After Release', body: 'In January 2026 the project became available on streaming platforms. The Gecko was re-released in collaboration with 13, featuring a rap verse and extended outro. The single pack was released February 2026.' } ],
  },
  {
    id: 'cuts-and-chances', title: 'cuts and chances', subtitle: 'The 6th Project', releasedAt: '2025-08-08', releaseLabel: 'Released Aug 8, 2025', artistId: 'ven', coverFile: 'cutsandchances.jpg', accentColor: '#7a2a10', accentSoft: 'rgba(122, 42, 16, 0.45)', leadTrack: 'The Greatest Heist In History', type: 'project', spotifyUrl: 'https://open.spotify.com/album/0TniiPkvzO1Io0zvo9v2Cy', youtubeUrl: 'https://www.youtube.com/watch?v=clvH280H4eU&list=PLzGyT2iTgExCdzZy7vfAIfz-ijZrEBmBb',
    tracks: [
      { title: 'Cuts' },
      { title: 'Chances', badges: ['SINGLE'] },
      { title: 'The Greatest Heist In History', badges: ['LEAD', 'SINGLE'] },
      { title: 'Cut!' },
      { title: 'Young Again' },
      { title: 'Brighter Days' },
      { title: 'Fits Right' },
    ],
    history: [ { heading: 'Before Release', body: 'Following the restructuring of STAR and personal events in May–June 2025, cuts and chances was envisioned to reflect these experiences. Initially titled CUTS, it was designed to be VEN\'s most coherent and conceptually rich project. Development began in June 2025, prior to STAR\'s release. The Greatest Heist In History — originally from STAR — became the focal point, exploring themes of infidelity closely related to THE GOOD ONE (ft. JHUZZ).' }, 
      { heading: 'Official Release', body: 'On August 8, 2025, the sixth project was officially released and simultaneously made available on Spotify and Apple Music — marking VEN\'s first project on streaming services. The lead track was released August 6, 2025 alongside a music video that became VEN\'s most successful video to date.' }, 
      { heading: 'After Release', body: 'The project was received positively. Multiple versions of The Greatest Heist In History were released, and Chances was accompanied by a lyric video and additional versions on August 7, 2025.' } ],
  },
  {
    id: 'star', title: 'STAR', subtitle: 'The 5th Project', releasedAt: '2025-06-20', releaseLabel: 'Released Jun 20, 2025', artistId: 'ven', coverFile: 'star.jpg', accentColor: '#0a1a3a', accentSoft: 'rgba(10, 26, 58, 0.45)', leadTrack: 'REAL FORM', type: 'project', spotifyUrl: 'https://open.spotify.com/album/5Uke3afS2BkUV30mR5V6ty', youtubeUrl: 'https://www.youtube.com/watch?v=pvO0XnJ2Kkg&list=PLzGyT2iTgExCO8eATL1hhIx2peol_vY-G',
    tracks: [
      { title: 'REAL FORM', badges: ['LEAD', 'SINGLE'] },
      { title: 'KEEP IT' },
      { title: 'MESSY' },
      { title: 'ON THE PHONE' },
      { title: 'THE GOOD ONE' },
      { title: 'THE GOOD ONE (ft. JHUZZ)', badges: ['SINGLE']  },
    ],
    history: [ { heading: 'Before Release', body: 'STAR was originally planned as VEN\'s only 2025 project — an ongoing release that would grow over time. Personal reasons caused a restructure, condensing it to five upbeat tracks. Songs like The Greatest Heist In History were moved to cuts and chances for not fitting the concept.' }, 
      { heading: 'Official Release', body: 'On June 20, 2025, the fifth project was officially released. THE GOOD ONE (ft. JHUZZ) was released as a collaborative single ahead of the official release.' }, 
      { heading: 'After Release', body: 'In January 2026, the project became available on various streaming platforms.' } ],
  },
  {
    id: 'when-the-night-falls', title: 'when the night falls', subtitle: 'A Tribute to Hiro Jin', releasedAt: '2024-10-06', releaseLabel: 'Released Oct 6, 2024', artistId: 'ven', coverFile: 'whenthenightfalls.png', accentColor: '#1a1a2a', accentSoft: 'rgba(26, 26, 42, 0.45)', type: 'special', youtubeUrl: 'https://www.youtube.com/watch?v=Bwv_V82Kf_k&list=PLzGyT2iTgExAosOJUh0_59tYves_vLt7q',
    tracks: [
      { title: 'in the quiet of the night' },
      { title: 'heaven-sent' },
    ],
    history: [ { heading: 'Before Release', body: 'when the night falls was an unplanned release created to commemorate Hiro Jin\'s passing in late September 2024. Due to the sudden nature of the event, the project received no additional media content beyond the project cover and the tracks themselves.' }, 
      { heading: 'Official Release', body: 'On October 6, 2024, the special tribute project was officially released.' }, ],
  },
  {
    id: 'connections', title: 'connections', subtitle: 'The 4th Project', releasedAt: '2024-09-06', releaseLabel: 'Released Sep 6, 2024', artistId: 'ven', coverFile: 'connections.jpg', accentColor: '#3a1a0a', accentSoft: 'rgba(58, 26, 10, 0.45)', leadTrack: 'crimson red', type: 'project', spotifyUrl: 'https://open.spotify.com/album/1k7swO9gKAWtmhuv9T1cQl', youtubeUrl: 'https://www.youtube.com/watch?v=-eZcw8kWTwU&list=PLzGyT2iTgExADXuVcLSp_J_42I7RPm8Hf',
    tracks: [
      { title: 'crimson red', badges: ['SINGLE'] },
      { title: 'andromeda', badges: ['SINGLE'] },
      { title: 'at peace', badges: ['LEAD', 'SINGLE'] },
      { title: 'my everything', badges: ['SINGLE'] },
    ],
    history: [ { heading: 'Before Release', body: 'connections was conceived as a poetry-based project dedicated to the people around VEN, centered on the idea of "the connections we made along the way." It was refined into four tracks, each with its own dedicated promotional period. The lead track crimson red was released August 19, 2024 with a music video. andromeda — originally titled eyes of andromeda — and its sped-up version became the most-viewed videos on studioseven\'s YouTube channel, reaching nearly 4,000 views.' }, 
      { heading: 'Official Release', body: 'On September 6, 2024, the fourth project was officially released alongside the official video for at peace.' }, 
      { heading: 'After Release', body: 'In January 2026, the project became available on various streaming platforms.' } ],
  },
  {
    id: 'something', title: 'Something', subtitle: 'The 3rd Project', releasedAt: '2023-07-03', releaseLabel: 'Released Jul 7, 2023', artistId: 'ven', coverFile: 'something.png', accentColor: '#2a2a0a', accentSoft: 'rgba(42, 42, 10, 0.45)', leadTrack: 'Something', type: 'project', spotifyUrl: 'https://open.spotify.com/album/1JUY1DqQpD6iv9RhXpSQf9', youtubeUrl: 'https://www.youtube.com/playlist?list=PLzGyT2iTgExBl8gwpkV0_DRsg_NzNwOPS',
    tracks: [
      { title: 'Something', badges: ['LEAD', 'SINGLE'] },
      { title: 'Hush' },
      { title: 'Idle' },
      { title: 'Nothing' },
      { title: 'The Last Time', badges: ['DELUXE', 'SINGLE'] },
      { title: 'Decode', badges: ['DELUXE', 'POEM'] }
    ],
    history: [ { heading: 'Before Release', body: 'The third project was designed as VEN\'s first visual project, with all four tracks paired with simultaneous visualizer videos on release day.' }, 
      { heading: 'Official Release', body: 'Released on July 3, 2023, the project featured four tracks. The official video for Something was released August 1, 2023. A post-release deluxe edition titled The Last Time was later added, including an additional track and a poem.' }, 
      { heading: 'After Release', body: 'A holiday remix of the lead track Something was also released.' } ],
  },
  {
    id: 'bubble', title: 'BUBBLE', subtitle: 'The 2nd Project', releasedAt: '2022-11-21', releaseLabel: 'Released Nov 21, 2022', artistId: 'ven', coverFile: 'bubble.jpg', accentColor: '#0a2a3a', accentSoft: 'rgba(10, 42, 58, 0.45)', leadTrack: 'HERA', type: 'project', youtubeUrl: 'https://www.youtube.com/watch?v=7DuQMPxhdb4&list=PLzGyT2iTgExDZXnkGV4d3YM-qLBOmxv-d',
    tracks: [
      { title: 'RESILIENCE', badges: ['SINGLE'] },
      { title: 'Bad'},
      { title: 'Drama' },
      { title: 'HERA', badges: ['LEAD', 'SINGLE'] },
      { title: 'Glistening Asteroid' },
      { title: 'Satellite' },
      { title: 'RESILIENCE (Extended Version)', badges: ['BONUS'] },
      { title: 'Over', badges: ['BONUS'] },
      { title: 'HERA' , badges: ['DELUXE'] },
      { title: 'SATELLITE' , badges: ['DELUXE', 'SINGLE'] },
    ],
    history: [ { heading: 'Before Release', body: 'The BUBBLE era began with the release of Resilience on February 2, 2022 — nine months before the full project. Work on the track started in July 2021, originally intended for You Do You as Overturn pt. 2. The rollout for the lead track began October 21, 2022, introducing the project\'s new logo and previewing the bonus track Laugh. Posters, snippets, an album trailer, and teaser videos for HERA were shared across platforms in the days leading up to release.' }, 
      { heading: 'Official Release', body: 'On November 21, 2022, the second full project was officially released alongside the official video for HERA. The release was met with significantly greater success than the previous project.' }, 
      { heading: 'After Release', body: 'BUBBLE (Deluxe Edition) was released on April 10, 2023 — five months after the original — featuring new renditions of HERA and Satellite. These became the most successful and most viewed songs across all project editions.' } ],
  },
  {
    id: 'you-do-you', title: 'You Do You', subtitle: 'The 1st Project', releasedAt: '2020-11-24', releaseLabel: 'Released Nov 24, 2020', artistId: 'ven', coverFile: 'youdoyou.jpg', accentColor: '#1a0a2a', accentSoft: 'rgba(26, 10, 42, 0.45)', leadTrack: 'Overturn', type: 'project', spotifyUrl: 'https://open.spotify.com/album/2qkcrMVIoipKOkehyEDZqk', youtubeUrl: 'https://www.youtube.com/watch?v=vkPTwlpQfX8&list=PLzGyT2iTgExBl8gwpkV0_DRsg_NzNwOPS',
    tracks: [
      { title: 'LOVEHATE', badges: ['SINGLE']},
      { title: 'Very Festive', badges: ['SINGLE']},
      { title: 'Overturn', badges: ['LEAD', 'SINGLE']},
      { title: '05170319 (Stranger)' },
    ],
    history: [ { heading: 'Before Release', body: 'You Do You began with two experimental demo tracks: Volatile in August 2020 and Schmaltz in October 2020. On November 14, LOVEHATE was released, followed by Very Festive on November 21.' }, 
      { heading: 'Official Release', body: 'On November 24, 2020, the full project was officially released alongside a short concept video for Overturn.' }, 
      { heading: 'After Release', body: 'You Do You (Final Version) was released July 30, 2021, featuring a remastered Overturn. Five years later, the 5th Anniversary Edition was released with refined instrumentals and improved mixing, excluding demo tracks — marking it as VEN\'s third project on streaming services.' } ],
  },
]

export interface NewsItem { id: string; headline: string; preview: string; body: string; date: string; weeksAgo: number; projectId?: string; url?: string }

export const NEWS: NewsItem[] = [
  { id: 'sendoff-out', headline: 'SENDOFF out now!', preview: "VEN's final project is out now on YouTube.", body: "The highly anticipated final project, SENDOFF, is officially available on YouTube. Marking the conclusion of VEN's journey under studioseven, the project encompasses an emotional reflection of the past 6 years.", date: 'May 29, 2026', weeksAgo: 3, projectId: 'sendoff', url: 'https://www.youtube.com/playlist?list=PLzGyT2iTgExANe62FnaNsXrYHpshYbP2X' },
  { id: 'the-video-single', headline: 'The Video (Single Pack)', preview: 'Extended version of "The Video" is finally out.', body: "Fans can now stream the extended single pack for 'The Video', featuring behind-the-scenes insights and an alternative instrumental arrangement.", date: 'April 15, 2026', weeksAgo: 5, projectId: 'what-do-you-know' },
  { id: 'what-do-you-know-soon', headline: "What Do You Know?", preview: "VEN's 7th project will be out soon.", body: "Studioseven officially announced the impending release of 'What Do You Know?'. Pre-saves are available now.", date: 'April 1, 2026', weeksAgo: 7, projectId: 'what-do-you-know' },
]

export function getFeaturedProject(): Project { return PROJECTS.find(p => p.featured) ?? PROJECTS[0] }
export function getProjectById(id: string): Project | undefined { return PROJECTS.find(p => p.id === id) }