import { supabase } from '../utils/supabase'

export type TrackBadge = 'LEAD' | 'SINGLE' | 'DELUXE' | 'BONUS' | 'POEM'

export interface Track { title: string; badges?: TrackBadge[]; content?: string; }
export interface HistorySection { heading: string; body: string }
export interface Artist { id: string; name: string; image: string; spotifyUrl?: string; youtubeUrl?: string; bio?: string }

export interface Project {
  id: string; title: string; subtitle: string; releasedAt: string; releaseLabel: string;
  artistId: string; coverFile: string; accentColor: string; accentSoft: string;
  tracks: Track[]; spotifyUrl?: string; youtubeUrl?: string; leadTrack?: string;
  history: HistorySection[]; featured?: boolean; type?: 'project' | 'soundtrack' | 'special' | 'final'
}

export interface NewsItem { 
  id: string; headline: string; preview: string; body: string; 
  date: string; projectId?: string; url?: string; image?: string; 
}

export function getCoverUrl(coverFile: string): string {
  if (!coverFile) return ''
  
  // ── AUTO-CONVERT GOOGLE DRIVE LINKS TO DIRECT IMAGES ──
  if (coverFile.includes('drive.google.com')) {
    // Extracts the unique file ID from any standard Google Drive link
    const match = coverFile.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      // Uses Google's direct media proxy to bypass HTML redirect pages
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }
  
  if (coverFile.startsWith('http')) return coverFile
  
  const { data } = supabase.storage.from('album_covers').getPublicUrl(coverFile)
  return data.publicUrl
}

export function formatTimeAgo(dateString: string): string {
  const past = new Date(dateString).getTime();
  const diff = Date.now() - past;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(days / 7);
  
  if (totalWeeks < 0) return 'In the future';
  if (totalWeeks === 0) return 'This week';
  
  const years = Math.floor(totalWeeks / 52);
  const weeks = totalWeeks % 52;
  
  if (years > 0) {
    return `${years}y ${weeks > 0 ? weeks + 'w ' : ''}ago`;
  }
  return `${weeks}w ago`;
}

export const ARTISTS: Artist[] = [
  { 
    id: 'ven', 
    name: 'VEN', 
    image: 'whatdoyouknow.jpg', 
    spotifyUrl: 'https://open.spotify.com/artist/3hpPUT2YPNiWtwECpLB4wT', 
    youtubeUrl: 'https://www.youtube.com/@studioseven.official/', 
    bio: 'VEN is the creative director, producer, and primary artist behind studioseven.\n\nOver a six-year journey, he has written and produced an interconnected discography spanning 7 distinct projects and an official movie soundtrack, blending complex narratives with cinematic and atmospheric soundscapes.' 
  },
  { 
    id: 'jhuzz', 
    name: 'JHUZZ', 
    image: 'star.jpg', 
    bio: 'JHUZZ is a featured artist who collaborated with VEN during the STAR era and the beginning of "The" Trilogy.\n\nWith her distinct, dynamic vocals on the track "THE GOOD ONE", her contribution provided a layer of depth and emotional resonance to the single of the 5th project.' 
  },
  { 
    id: '13', 
    name: '13', 
    image: 'cicatrix.png', 
    bio: '13 is a featured artist who collaborated with VEN on the deluxe expansion project, CICATRIX.\n\nThey are officially featured on the reimagined track "The Gecko (ft. 13)", providing a fresh, dynamic rap verse and an extended outro that expands the dark and complex themes of the album.' 
  },
]

export const PROJECTS: Project[] = [
  {
    id: 'sendoff', title: 'SENDOFF', subtitle: 'The Best Project', releasedAt: '2026-05-29', releaseLabel: 'Released May 29, 2026', artistId: 'ven', coverFile: 'sendoff1.png', accentColor: '#3b1f5e', accentSoft: 'rgba(59, 31, 94, 0.40)', leadTrack: 'Bondi', type: 'final', featured: true, youtubeUrl: 'https://youtube.com/playlist?list=OLAK5uy_lw7W5lv8Uz9vZUA6mtJsVxqQNBHId-vPo&si=N43hFixeT54F_sBJ', spotifyUrl: 'https://open.spotify.com/album/4RhuwNQZJIvs8LkzlOvrqE?si=fGzFH5sJRTGWe6_D95UmTQ&utm_source=copy-link',
    tracks: [
      { title: 'Overturn' }, { title: '05170319 (Stranger)' }, { title: 'Hera' }, { title: 'Satellite' }, { title: 'Something' }, { title: 'Idle' }, { title: 'Crimson Red' }, { title: 'Andromeda' }, { title: 'In The Quiet Of The Night' }, { title: 'Heaven-sent' }, { title: 'The Good One' }, { title: 'Real Form' }, { title: 'Keep It' }, { title: 'The Greatest Heist In History' }, { title: 'Chances' }, { title: 'The Gecko' }, { title: 'The Video' },
    ],
    history: [ { heading: 'Before Release', body: 'SENDOFF was set to be the conclusion project for the past 7 years of VEN\'s journey in music production. The project was designed to go back to the original, cosmic aesthetic from the early projects of VEN.' }, { heading: 'Official Release', body: 'The compilation project was then released on May 29, 2026 with 17 tracks from all the previous projects and era except the SACCHARIN movie soundtrack. It was also released on streaming platforms the same day as it was released on studioseven YouTube channel.' }, { heading: 'After Release', body: 'The supposed-to-be final project was then renamed to "The Best Project", signifying that there will be more projects and contents under VEN.' } ],
  },
  {
    id: 'what-do-you-know', title: 'What Do You Know?', subtitle: 'The 7th Project', releasedAt: '2026-04-08', releaseLabel: 'Released Apr 8, 2026', artistId: 'ven', coverFile: 'whatdoyouknow.jpg', accentColor: '#1a2a3a', accentSoft: 'rgba(26, 42, 58, 0.40)', leadTrack: 'The Video', type: 'project', spotifyUrl: 'https://open.spotify.com/album/2EYPKI5RNAOFfUE4Qie9vi', youtubeUrl: 'https://www.youtube.com/playlist?list=PLzGyT2iTgExANe62FnaNsXrYHpshYbP2X',
    tracks: [
      { title: 'In a Row', badges: ['POEM'], content: `Everything could’ve been simple\nIf you had said it sooner\nNo quiet guesses,\nNo questions left to linger\n\nChances were there for the taking\nYou held each one without a word\nLike they meant something\nThen turned away from what they were for\n\nThere will always be things I’ll never know\nPieces you chose not to show\nPieces you kept from being known\nWhile this situation pulled me to my lowest low\n\nAnd as I watch you close the door, I know you know\nThere are things about you that he’ll never know\nSilences he will never hear\nTruths I carried alone\n\nAnd the one you destroyed for the second time in a row.` }, 
      { title: 'Where Does This Bring Me?', badges: ['POEM'], content: `I saw the weapons laid out like warnings\nI heard every committed crime dressed up as honesty\nStill, I won’t lie\nThe blindfold fit me better than the truth ever did.\n\nSoft.\nFamiliar.\nComfortable.\n\nI wore it with pride\nLet it shield me from the fallout\nFrom the meteor shower of almosts\nAnd the bullets of “what are we?”\n\nAnd when the air finally left my lungs\nI stood there breathless and bare\nI knew.\n\nI, yes I was,\nThe one, the only who kept the knot intact,\nThe one who kept it tight,\nThe one who chose not to see\nBecause love felt safer \nThan asking “where does this bring me?”` }, 
      { title: 'The Healer', badges: ['POEM'], content: `As good as it sounds, as perfect as it seems\nYou had me on your hands, you knew me just from the cover page\nYou knew all my wounds—you were part of it\nA doctor who claimed to heal, then chose to become one of it\n\nThe cuts were deeper than the scratch you made to get to know me\nYou went through the core and skipped the questions of "we"\nThe performance was perfection, and applause was eerie\nAs behind the scenes were where you went and erased me` }, 
      { title: 'What Do You Know?', badges: ['POEM'], content: `The love that you avoided\nWas the love that you once fought for\nAnd when the silence starts to creep in\nYou'll find anyone else but no one \n\nWill anyone know you?\nWill someone dare to decode you?\nBut what do you know?\nLike thoughts, you'd hide too\n\nJust like the questions, you'll hide too\nThe unsaid answers, they'll hide too\nHands in your pocket, those feelings hide too\nWhat do you know? when I know you'll hide too` }, 
      { title: 'To Those We Loved Before', badges: ['POEM'], content: `It was a dream, as one says\nLying on clouds and colder than rain\nWhat felt like heaven for countless days\nIs a rose hiding agonizing pain\n\nTo those we loved before\nIn all shades, form, perfections and horn\nA mystical addition of a folklore\nA wicked mist you thought to adorn\n\nAnd as I look at the pages of ink and creed\nA timeline of imagination-driven sin\nA manuscript not to be involved with\nAnd a blood-drowned body wishing to be cleansed` }, 
      { title: 'The Video', badges: ['POEM'], content: `And I rewatched the video from a new point of view,\nIt was a dream, something I never truly knew.\nA candy wrapped in ill-fated sorrow,\nBut at the end of the day, what do I know?\n\nFrames misalign\nThe tape wears thin\nNothing sounds the same\n\nThe video may have ended the story,\nOr so we thought it had concluded.\nAnd as I trace the footer’s note,\nI’ll still be there to ask:\n\nIn every teardrop hidden by flowers,\nWhat do you know?` }, 
      { title: 'The Video (Song)', badges: ['LEAD', 'SINGLE']  }, 
      { title: 'Fear', badges: ['POEM'], content: `I laughed as my story gets replayed\nLike it was harmless entertainment.\nA manic clown of a lover.\nA community's happy pill, I must say.\n\nBut those folklores and questionable choices are not what I truly am.\nThose laughs feel like warnings that echo louder than the last.\n\nI do not wish to belong here.\nI do not wish to belong to any of those stories.\n\nPeople shouldn't hear "stupid" and "foolish" and think about me\nDoes "to love and be loved" really sound that stupid and foolish?\nWhy does it feel that way now?\n\nThis cannot be my legacy.\nThis cannot be my future history.\n\nWas I just someone to dominate?\nWas I just some young blood you can easily play?\nI keep replaying the silence after you left\nLike a door I’m afraid to open again.\n\nI made you my God because that's all I know\nYou took that and left me dry and sore\nI thought gods are not supposed to abandon the ones who kneel.\nNow, every memory’s a trap ready to seize my soul\n\nAnd as I hear the stories, there's a question I can never ignore\n\n"Am I ever going to love again?"\n\nFrom the voices of friends I got used to ignore\nFrom the random strangers I glance at and ghost\nFrom the younger me who never knew “love and care”\nAnd until the last shiver of my body,\n\n"Am I ever going to love again?"` }, 
      { title: 'No Matter', badges: ['POEM'], content: `As the sole voice of this empty canvas\nI encompass the unsaid but written dilemmas\nThe clean translation of the curses\nThe ghosts of what became my muses\n\nAnd as I close the casket of the undead\nA few questions will always linger\nIn happiness, in darkness, in peace, and in pain\nA thing of matter that will never be reborn\n\nAnd for the last moment, I will still remain\nWith these flowers wilted,\nWith these teardrops on my ashes,\n\nWhat do you know?` }, 
      { title: 'The Video (Extended)', badges: ['SINGLE', 'DELUXE']  },
    ],
    history: [ { heading: 'Before Release', body: 'The concept for What Do You Know? was planned before the release of CICATRIX. The main track was always intended to be titled The Video. Originally set for Q3 2026, it was first introduced as a literary work on February 14, 2026, featuring a glass-inspired look with an off-white colour scheme, reflecting the project\'s themes of clarity and openness.' }, { heading: 'Official Release', body: 'On April 8, 2026, the seventh and final project was officially released — including The Video as its only song, alongside additional poems. The official music video for The Video accompanied the release. Ten days later it became available on major streaming platforms including Spotify and YouTube Music.' }, { heading: 'After Release', body: 'One day after release, The Video (Single Pack) was uploaded to studioseven\'s YouTube channel, including an extended track with a rap verse and a lyric video. What Do You Know? is planned to be VEN\'s final project, closing the series that began in 2020.' } ],
  },
  {
    id: 'saccharin', title: 'SACCHARIN', subtitle: 'Official Movie Soundtrack', releasedAt: '2026-01-21', releaseLabel: 'Released Jan 21, 2026', artistId: 'ven', coverFile: 'saccharin.png', accentColor: '#1a3a2a', accentSoft: 'rgba(26, 58, 42, 0.40)', type: 'soundtrack', youtubeUrl: 'https://www.youtube.com/playlist?list=PLzGyT2iTgExBb4NRWG6IB3jAckjfvbwhp',
    tracks: [
      { title: 'Sweetener' }, { title: 'Saccharin' }, { title: 'The Gecko' }, { title: 'Fits Right' }, { title: 'In The Quiet Of The Night' }, { title: 'Aftertaste' },
    ],
    history: [ { heading: 'Before Release', body: 'VEN served as the sound director for NAMUJANE Studios, who then conceptualized an album dedicated to the film. Three tracks were drawn from previous projects; three were new compositions.' }, { heading: 'Official Release', body: 'The official soundtrack for the movie "SACCHARIN" was released 2 days after its premier on PUPQC MMFF 2026.' } ],
  },
  {
    id: 'cicatrix', title: 'CICATRIX', subtitle: 'The 6th Project – Deluxe', releasedAt: '2025-12-17', releaseLabel: 'Released Dec 17, 2025', artistId: 'ven', coverFile: 'cicatrix.png', accentColor: '#3a1a1a', accentSoft: 'rgba(58, 26, 26, 0.40)', leadTrack: 'The Gecko', type: 'project', spotifyUrl: 'https://open.spotify.com/album/2N3nb2GfkHySKNSqcJxM16', youtubeUrl: 'https://www.youtube.com/watch?v=uWQR4ILCLWA&list=PLzGyT2iTgExCzTiK2Ccd7ez_L4Ai7wmG5',
    tracks: [
      { title: 'Cuts' }, { title: 'Chances' }, { title: 'The Greatest Heist In History' }, { title: 'Cut!' }, { title: 'Young Again' }, { title: 'Brighter Days' }, { title: 'Fits Right' }, { title: 'The Gecko', badges: ['LEAD', 'SINGLE'] }, { title: 'Chances (Sped Up)'}, { title: 'The Greatest Heist In History (Sped Up)' }, { title: 'Brighter Days (Sped Up)' }, { title: 'Young Again (Sped Up)' }, { title: 'Fits Right (Sped Up)' }, { title: 'The Gecko (Sped Up)' }, { title: 'The Gecko (Instrumental)' }, { title: 'The Gecko (ft. 13)', badges: ['SINGLE', 'DELUXE'] },
    ],
    history: [ { heading: 'Before Release', body: 'CICATRIX was the closing statement of cuts and chances, representing the "scars" left after the emotional journey. The album cover transformed the symbolic burning effect, originally representing love, into imagery of the person who sought to be loved. The Gecko was written less than two weeks before release as the conclusion to a trilogy beginning with THE GOOD ONE.' }, { heading: 'Official Release', body: 'On December 17, 2025, the deluxe edition was released alongside a lyric video for The Gecko.' }, { heading: 'After Release', body: 'In January 2026 the project became available on streaming platforms. The Gecko was re-released in collaboration with 13, featuring a rap verse and extended outro. The single pack was released February 2026.' } ],
  },
  {
    id: 'cuts-and-chances', title: 'cuts and chances', subtitle: 'The 6th Project', releasedAt: '2025-08-08', releaseLabel: 'Released Aug 8, 2025', artistId: 'ven', coverFile: 'cutsandchances.jpg', accentColor: '#7a2a10', accentSoft: 'rgba(122, 42, 16, 0.45)', leadTrack: 'The Greatest Heist In History', type: 'project', spotifyUrl: 'https://open.spotify.com/album/0TniiPkvzO1Io0zvo9v2Cy', youtubeUrl: 'https://www.youtube.com/watch?v=clvH280H4eU&list=PLzGyT2iTgExCdzZy7vfAIfz-ijZrEBmBb',
    tracks: [
      { title: 'Cuts' }, { title: 'Chances', badges: ['SINGLE'] }, { title: 'The Greatest Heist In History', badges: ['LEAD', 'SINGLE'] }, { title: 'Cut!' }, { title: 'Young Again' }, { title: 'Brighter Days' }, { title: 'Fits Right' },
    ],
    history: [ { heading: 'Before Release', body: 'Following the restructuring of STAR and personal events in May–June 2025, cuts and chances was envisioned to reflect these experiences. Initially titled CUTS, it was designed to be VEN\'s most coherent and conceptually rich project. Development began in June 2025, prior to STAR\'s release. The Greatest Heist In History — originally from STAR — became the focal point, exploring themes of infidelity closely related to THE GOOD ONE (ft. JHUZZ).' }, { heading: 'Official Release', body: 'On August 8, 2025, the sixth project was officially released and simultaneously made available on Spotify and Apple Music — marking VEN\'s first project on streaming services. The lead track was released August 6, 2025 alongside a music video that became VEN\'s most successful video to date.' }, { heading: 'After Release', body: 'The project was received positively. Multiple versions of The Greatest Heist In History were released, and Chances was accompanied by a lyric video and additional versions on August 7, 2025.' } ],
  },
  {
    id: 'star', title: 'STAR', subtitle: 'The 5th Project', releasedAt: '2025-06-20', releaseLabel: 'Released Jun 20, 2025', artistId: 'ven', coverFile: 'star.jpg', accentColor: '#0a1a3a', accentSoft: 'rgba(10, 26, 58, 0.45)', leadTrack: 'REAL FORM', type: 'project', spotifyUrl: 'https://open.spotify.com/album/5Uke3afS2BkUV30mR5V6ty', youtubeUrl: 'https://www.youtube.com/watch?v=pvO0XnJ2Kkg&list=PLzGyT2iTgExCO8eATL1hhIx2peol_vY-G',
    tracks: [
      { title: 'REAL FORM', badges: ['LEAD', 'SINGLE'] }, { title: 'KEEP IT' }, { title: 'MESSY' }, { title: 'ON THE PHONE' }, { title: 'THE GOOD ONE' }, { title: 'THE GOOD ONE (ft. JHUZZ)', badges: ['SINGLE']  },
    ],
    history: [ { heading: 'Before Release', body: 'STAR was originally planned as VEN\'s only 2025 project — an ongoing release that would grow over time. Personal reasons caused a restructure, condensing it to five upbeat tracks. Songs like The Greatest Heist In History were moved to cuts and chances for not fitting the concept.' }, { heading: 'Official Release', body: 'On June 20, 2025, the fifth project was officially released. THE GOOD ONE (ft. JHUZZ) was released as a collaborative single ahead of the official release.' }, { heading: 'After Release', body: 'In January 2026, the project became available on various streaming platforms.' } ],
  },
  {
    id: 'when-the-night-falls', title: 'when the night falls', subtitle: 'A Tribute to Hiro Jin', releasedAt: '2024-10-06', releaseLabel: 'Released Oct 6, 2024', artistId: 'ven', coverFile: 'whenthenightfalls.png', accentColor: '#1a1a2a', accentSoft: 'rgba(26, 26, 42, 0.45)', type: 'special', youtubeUrl: 'https://www.youtube.com/watch?v=Bwv_V82Kf_k&list=PLzGyT2iTgExAosOJUh0_59tYves_vLt7q',
    tracks: [ { title: 'in the quiet of the night' }, { title: 'heaven-sent' } ],
    history: [ { heading: 'Before Release', body: 'when the night falls was an unplanned release created to commemorate Hiro Jin\'s passing in late September 2024. Due to the sudden nature of the event, the project received no additional media content beyond the project cover and the tracks themselves.' }, { heading: 'Official Release', body: 'On October 6, 2024, the special tribute project was officially released.' } ],
  },
  {
    id: 'connections', title: 'connections', subtitle: 'The 4th Project', releasedAt: '2024-09-06', releaseLabel: 'Released Sep 6, 2024', artistId: 'ven', coverFile: 'connections.jpg', accentColor: '#3a1a0a', accentSoft: 'rgba(58, 26, 10, 0.45)', leadTrack: 'crimson red', type: 'project', spotifyUrl: 'https://open.spotify.com/album/1k7swO9gKAWtmhuv9T1cQl', youtubeUrl: 'https://www.youtube.com/watch?v=-eZcw8kWTwU&list=PLzGyT2iTgExADXuVcLSp_J_42I7RPm8Hf',
    tracks: [ { title: 'crimson red', badges: ['SINGLE'] }, { title: 'andromeda', badges: ['SINGLE'] }, { title: 'at peace', badges: ['LEAD', 'SINGLE'] }, { title: 'my everything', badges: ['SINGLE'] } ],
    history: [ { heading: 'Before Release', body: 'connections was initially designed to be a poetry-based project centered on the idea of "the connections we made along the way." It was refined into four tracks, each with its own dedicated promotional period. The lead track crimson red was released August 19, 2024 with a music video. andromeda — originally titled eyes of andromeda — and its sped-up version became the most-viewed videos on studioseven\'s YouTube channel, reaching more than 4,000 views.' }, { heading: 'Official Release', body: 'On September 6, 2024, the fourth project was officially released alongside the official video for at peace.' }, { heading: 'After Release', body: 'In January 2026, the project became available on various streaming platforms.' } ],
  },
  {
    id: 'something', title: 'Something', subtitle: 'The 3rd Project', releasedAt: '2023-07-03', releaseLabel: 'Released Jul 7, 2023', artistId: 'ven', coverFile: 'something.png', accentColor: '#2a2a0a', accentSoft: 'rgba(42, 42, 10, 0.45)', leadTrack: 'Something', type: 'project', spotifyUrl: 'https://open.spotify.com/album/1JUY1DqQpD6iv9RhXpSQf9', youtubeUrl: 'https://www.youtube.com/playlist?list=PLzGyT2iTgExBl8gwpkV0_DRsg_NzNwOPS',
    tracks: [ { title: 'Something', badges: ['LEAD', 'SINGLE'] }, { title: 'Hush' }, { title: 'Idle' }, { title: 'Nothing' }, { title: 'The Last Time', badges: ['DELUXE', 'SINGLE'] }, { title: 'Decode', badges: ['DELUXE', 'POEM'] } ],
    history: [ { heading: 'Before Release', body: 'The third project was designed as VEN\'s first visual project, with all four tracks paired with simultaneous visualizer videos on release day. However, this was not accomplished as only the lead single received a proper visual content.' }, { heading: 'Official Release', body: 'Released on July 3, 2023, the project featured four tracks. The official video for Something was released August 1, 2023. A post-release deluxe edition titled The Last Time was later added, including an additional track and a poem.' }, { heading: 'After Release', body: 'A holiday remix of the lead track Something was also released.' } ],
  },
  {
    id: 'bubble', title: 'BUBBLE', subtitle: 'The 2nd Project', releasedAt: '2022-11-21', releaseLabel: 'Released Nov 21, 2022', artistId: 'ven', coverFile: 'bubble.jpg', accentColor: '#0a2a3a', accentSoft: 'rgba(10, 42, 58, 0.45)', leadTrack: 'HERA', type: 'project', youtubeUrl: 'https://www.youtube.com/watch?v=7DuQMPxhdb4&list=PLzGyT2iTgExDZXnkGV4d3YM-qLBOmxv-d',
    tracks: [ { title: 'RESILIENCE', badges: ['SINGLE'] }, { title: 'Bad'}, { title: 'Drama' }, { title: 'HERA', badges: ['LEAD', 'SINGLE'] }, { title: 'Glistening Asteroid' }, { title: 'Satellite' }, { title: 'RESILIENCE (Extended Version)', badges: ['BONUS'] }, { title: 'Over', badges: ['BONUS'] }, { title: 'HERA' , badges: ['DELUXE'] }, { title: 'SATELLITE' , badges: ['DELUXE', 'SINGLE'] } ],
    history: [ { heading: 'Before Release', body: 'The BUBBLE era began with the release of Resilience on February 2, 2022 — nine months before the full project. Work on the track started in July 2021, originally intended for You Do You as Overturn pt. 2. The rollout for the lead track began October 21, 2022, introducing the project\'s new logo and previewing the bonus track Laugh. Posters, snippets, an album trailer, and teaser videos for HERA were shared across platforms in the days leading up to release.' }, { heading: 'Official Release', body: 'On November 21, 2022, the second full project was officially released alongside the official video for HERA. The release was met with significantly greater success than the previous project.' }, { heading: 'After Release', body: 'BUBBLE (Deluxe Edition) was released on April 10, 2023 — five months after the original — featuring new renditions of HERA and Satellite.' } ],
  },
  {
    id: 'you-do-you', title: 'You Do You', subtitle: 'The 1st Project', releasedAt: '2020-11-24', releaseLabel: 'Released Nov 24, 2020', artistId: 'ven', coverFile: 'youdoyou.jpg', accentColor: '#1a0a2a', accentSoft: 'rgba(26, 10, 42, 0.45)', leadTrack: 'Overturn', type: 'project', spotifyUrl: 'https://open.spotify.com/album/2qkcrMVIoipKOkehyEDZqk', youtubeUrl: 'https://www.youtube.com/watch?v=vkPTwlpQfX8&list=PLzGyT2iTgExBl8gwpkV0_DRsg_NzNwOPS',
    tracks: [ { title: 'LOVEHATE', badges: ['SINGLE']}, { title: 'Very Festive', badges: ['SINGLE']}, { title: 'Overturn', badges: ['LEAD', 'SINGLE']}, { title: '05170319 (Stranger)' } ],
    history: [ { heading: 'Before Release', body: 'You Do You began with two experimental demo tracks: Volatile in August 2020 and Schmaltz in October 2020. On November 14, LOVEHATE was released, followed by Very Festive on November 21.' }, { heading: 'Official Release', body: 'On November 24, 2020, the full project was officially released alongside a short concept video for Overturn.' }, { heading: 'After Release', body: 'You Do You (Final Version) was released July 30, 2021, featuring a remastered Overturn. Five years later, the 5th Anniversary Edition was released with refined instrumentals and improved mixing, excluding demo tracks — marking it as VEN\'s third project on streaming services.' } ],
  },
]

export const NEWS: NewsItem[] = [
  { 
    id: 'ss7ofcsite', 
    headline: 'Meet the new studioseven Website.', 
    preview: "New beginnings, and a more polished studioseven Website", 
    body: "New beginnings, and a more polished studioseven Website.\n\nTake a closer look at the expansive lore behind our projects, discover more about our featured artists, and trace our entire journey since 2020. Plus, catch a glimpse of our future endeavors in the Newsroom. Step into a more refined studioseven experience now!", 
    date: 'July 11, 2026', 
    projectId: 'sendoff', 
    url: 'ss7-ofc.vercel.app',
    image: 'https://drive.google.com/file/d/1LLIybwcV9AH8ar_mTtglpghC4HzmWbQJ/view?usp=drive_link'
  },

  { 
    id: 'sendoff-out', 
    headline: 'SENDOFF is Out Now', 
    preview: "Every story, every song, every lesson, from every era. SENDOFF is officially out now!", 
    body: "Every story, every song, every lesson, from every era. SENDOFF is officially out now!\n\nSENDOFF marks the culmination of a six-year artistic journey, bringing VEN's discography in a condensed single project. The project features a massive 17-track setlist from his previous projects.\n\nThis compilation project serves as a celebration for the listeners and collaborators who have supported this journey since its inception in 2020. SENDOFF is officially available to stream on all major platforms.", 
    date: 'May 29, 2026', 
    projectId: 'sendoff', 
    url: 'https://www.instagram.com/studioseven.ofc/p/DZBRUrSE8cz/',
    image: 'https://drive.google.com/file/d/1TWNMUdeem0RVzWf7desMQUl02g-J7zxp/view?usp=drive_link'
  },
  { 
    id: 'sendoff-announcement', 
    headline: 'SENDOFF - The Best Project', 
    preview: "The best project, SENDOFF, is soon approaching.", 
    body: "The best project, SENDOFF, is soon approaching.\n\nThe conclusion of an era is rapidly approaching. The curtain has been officially pulled back for SENDOFF, marking it as VEN's best and compilation project. The announcement signals the closure of a 6-year creative chapter of artistic reinventions.", 
    date: 'May 1, 2026', 
    projectId: 'sendoff', 
    url: 'https://www.instagram.com/studioseven.ofc/p/DY3j5eTj-GJ/',
    image:'https://drive.google.com/file/d/1ZgGAC8pJmp8Oq9nRUS6bEIP9rtsiU0ve/view?usp=drive_link'
  },
  { 
    id: 'the-video-lyric', 
    headline: 'The Video (Extended) Lyric Video is out!', 
    preview: "You haven't seen everythign yet. But even with more details, we may still never know.", 
    body: "You haven't seen everythign yet. But even with more details, we may still never know.\n\nUncover more wordplays on the 7th project with the official lyric video for the extended cut of 'The Video'. This new release extends the original's narrative flow and the dense, poetic structure of the lyrics.\n\nThe lyric video is now streaming exclusively on the studioseven YouTube channel.", 
    date: 'April 9, 2026', 
    projectId: 'what-do-you-know', 
    url: 'https://www.youtube.com/watch?v=QBDklz7FMBU', 
    image: 'https://img.youtube.com/vi/QBDklz7FMBU/maxresdefault.jpg' 
  },
  { 
    id: 'the-video-mv', 
    headline: 'The Video (Music Video) is out!', 
    preview: "I keep on replaying the video, hoping it will finally explain what happened — but every replay only proves how much I’ll never fully know.", 
    body: "I keep on replaying the video, hoping it will finally explain what happened — but every replay only proves how much I’ll never fully know.\n\nThe official music video for 'The Video', the lead and sole track of the 7th project, What Do You Know?, is out now!\n\nAs the sole musical track of the 'What Do You Know?' project, this music video carries the entirety of the project's sonic identity and bridges the gap between the album's spoken-word poetry and its musical ambitions.", 
    date: 'April 8, 2026', 
    projectId: 'what-do-you-know', 
    url: 'https://www.youtube.com/watch?v=SYLboWk7EE0', 
    image: 'https://img.youtube.com/vi/SYLboWk7EE0/maxresdefault.jpg' 
  },
  { 
    id: 'wdyk-contents', 
    headline: 'What do you know about "What Do You Know?"', 
    preview: "The official tracklist and contents for 'What Do You Know?' have been unveiled.", 
    body: "Unlike previous albums, this project breaks the mold by heavily featuring literary works and spoken-word poetry, rather than a traditional multi-track musical album.\n\nThe content reveal showcases a unique structure centered around a single musical anchor, 'The Video', surrounded by emotional poems.", 
    date: 'April 7, 2026', 
    projectId: 'what-do-you-know', 
    url: 'https://www.instagram.com/studioseven.ofc/p/DWyM_GHD38t/',
    image: 'https://drive.google.com/file/d/1hVwp02j4SxpXUlFhpmJcUeLai-nSjZsf/view?usp=drive_link'
  },
  { 
    id: 'wdyk-teaser', 
    headline: 'In every tear behind the flowers, What Do You Know?', 
    preview: "In every tear behind the flowers, what do you know?", 
    body: "A poetic and cryptic teaser gave the listeners their first taste of the monochromatic world that encompasses this era.\n\nThe teaser hinted the departure from traditional musical releases in favor of something far more experimental and was never done before by VEN.", 
    date: 'April 6, 2026', 
    projectId: 'what-do-you-know', 
    url: 'https://www.instagram.com/studioseven.ofc/p/DWxxe_ZD1fa/' 
  },
  { 
    id: 'siklaw-copa-sampaguita', 
    headline: 'studioseven as a Music Partner for COPA SAMPAGUITA', 
    preview: "studioseven as a Music Partner for COPA SAMPAGUITA", 
    body: "Another beautiful chapter in the studioseven journey.\n\nThank you to the organizers of 𝗖𝗢𝗣𝗔 𝗦𝗔𝗠𝗣𝗔𝗚𝗨𝗜𝗧𝗔 for having us as your official Music Partner. We loved providing the soundtrack for this incredible event. Congratulations on a massively successful run, and cheers to our fellow partners for making it all happen!", 
    date: 'March 27, 2026', 
    url: 'https://www.facebook.com/photo/?fbid=1260099726234289&set=a.412189177692019',
    image: 'https://drive.google.com/file/d/16WOlvfBNRYiPBEUEnfgHM-POkFM9gxQP/view?usp=drive_link'
  },
  { 
    id: 'ven-workshop-oca', 
    headline: 'DEEP DIVE: Audio Production Seminar and Workshop', 
    preview: "DEEP DIVE: Audio Production Seminar and Workshop", 
    body: "Step into the world of sound and creativity as we present 𝐃𝐄𝐄𝐏 𝐃𝐈𝐕𝐄: 𝐀𝐮𝐝𝐢𝐨 𝐏𝐫𝐨𝐝𝐮𝐜𝐭𝐢𝐨𝐧 𝐒𝐞𝐦𝐢𝐧𝐚𝐫 𝐚𝐧𝐝 𝐖𝐨𝐫𝐤𝐬𝐡𝐨𝐩. 🎶 This event aims to provide participants with valuable knowledge and practical insights into the art of audio production—from understanding sound fundamentals 🎛️ to enhancing production techniques 🎚️. It’s a great opportunity to learn how quality audio plays an important role in media and content creation. 🎥✨\n\nJoin us on 𝐌𝐚𝐫𝐜𝐡 𝟏𝟎, 𝟐𝟎𝟐𝟔, 𝐟𝐫𝐨𝐦 𝟏:𝟑𝟎 𝐏𝐌 𝐭𝐨 𝟒:𝟑𝟎 𝐏𝐌 𝐚𝐭 𝐭𝐡𝐞 𝐀𝐕𝐑 for an engaging and informative session. We are honored to have 𝐆𝐮𝐞𝐬𝐭 𝐒𝐩𝐞𝐚𝐤𝐞𝐫: 𝐕𝐞𝐧 𝐕𝐢𝐧𝐥𝐮𝐚𝐧, who will be sharing expertise, experiences, and helpful tips about the field of audio production. 🎧💡\n\nDon’t miss this chance to learn, discover new skills, and deepen your understanding of sound production. See you at the seminar! 🎤🔊🎵\n\n#PUPQCOCA\n#officeoftheculturalaffairs\n#OCA\n\n Caption from Office of the Cultural Affairs - PUPQC.", 
    date: 'March 9, 2026', 
    url: 'https://www.facebook.com/PUPQCPAGEANT/posts/pfbid0Ps7mo9HUbiayAyaiZdP4cWQc51JUaQHcLs1LAbWNA8n5m13WpwHUFuLbeuM6y8JMl',
    image: 'https://drive.google.com/file/d/1_TI3eCZSV4O1T6g3HRkzE6CiMzlEs18t/view?usp=drive_link'
  },
  { 
    id: 'gecko-13', 
    headline: 'The Gecko (ft. 13) is out', 
    preview: "Dont keep the lights out! The extended cut of The Gecko is out.", 
    body: "The CICATRIX saga continues to expand with the announcement of an extended single pack for 'The Gecko', featuring a collaboration with the artist 13.\n\nFeaturing 13, this new rendition brings a fresh dynamic through an added rap verse and an extended outro, which enriched the dark and complex themes explored in the original deluxe edition.", 
    date: 'February 10, 2026', 
    projectId: 'cicatrix', 
    url: 'https://www.instagram.com/studioseven.ofc/p/DTwyvsUD_Qc/',
    image: 'https://drive.google.com/file/d/1f0dFwtikwMpqc4uC26vUxcPUXiI7_w2H/view?usp=drive_link'
  },
  { 
    id: 'saccharin-film', 
    headline: 'Watch SACCHARIN Official Film', 
    preview: "NAMUJANE Studios and studioseven presents the official short film 'SACCHARIN'.", 
    body: "The short film 'SACCHARIN', produced by NAMUJANE Studios, is officially available to watch on studioseven YouTube channel. The film stands out as a remarkable collaborative achievement, blending compelling visual storytelling with an impactful auditory experience. The original soundtrack seamlessly integrates with the on-screen tension.", 
    date: 'January 21, 2026', 
    projectId: 'saccharin', 
    url: 'https://www.youtube.com/watch?v=4HbGb9511DU', 
    image: 'https://img.youtube.com/vi/4HbGb9511DU/maxresdefault.jpg' 
  },
  { 
    id: 'saccharin-poster', 
    headline: 'SACCHARIN Movie Poster Revealed', 
    preview: "The official poster for the upcoming film SACCHARIN has been revealed.", 
    body: "The visual identity of 'SACCHARIN' comes into focus with the reveal of its official movie poster. Made by Ralph Gerard Duenas, the artwork perfectly encapsulates the tension, mystery, and dramatic flair that the film promises to deliver to its audience.\n\nThe poster also officially highlights the collaboration with studioseven, crediting VEN and studioseven for the film's comprehensive sound design and original motion picture soundtrack.", 
    date: 'January 10, 2026', 
    projectId: 'saccharin', 
    url: 'https://www.youtube.com/post/UgkxIa0bnyiWr1cmuz2Yn7zZZP96MLSpbV1f',
    image: 'https://drive.google.com/file/d/1cjt1MCSWhZJK_0OaGi8mLqj0dRUZcliB/view?usp=drive_link'
  },
  { 
    id: 'cicatrix-out', 
    headline: 'CICATRIX is Out Now', 
    preview: "You are what you destroyed. The deluxe expansion to cuts and chances is officially out now.", 
    body: "The deluxe expansion to the critically acclaimed 'cuts and chances' project, officially titled CICATRIX, is out now. This expansive release brings a darker, more reflective conclusion to the era, serving as the literal and metaphorical 'scars' left behind.\n\nCICATRIX dramatically recontextualizes the original album, introducing a new track, sped-up renditions, and a shifting conceptual focus that turns the lens inward toward the person seeking to be loved.", 
    date: 'December 17, 2025', 
    projectId: 'cicatrix', 
    url: 'https://www.instagram.com/studioseven.ofc/p/DSKx96yD_hU/' 
  },
  { 
    id: 'cicatrix-announcement', 
    headline: 'cuts, chances, and CICATRIX', 
    preview: "See the expanded world with the upcoming deluxe project: CICATRIX.", 
    body: "Following the success of the 6th project, VEN and studioseven have officially announced the upcoming deluxe edition, titled CICATRIX. \n\nThis deluxe edition promises to dive deeper into the emotional aftermath of the original tracklist, introducing a brand new song and explores the lasting impact of the project's core themes.", 
    date: 'December 1, 2025', 
    projectId: 'cicatrix', 
    url: 'https://www.instagram.com/studioseven.ofc/p/DRaGgXhknG-/' 
  },
  { 
    id: 'chances-lyric', 
    headline: 'Chances (Lyric Video) is out', 
    preview: "Sing along with the official lyric video for 'Chances'.", 
    body: "The minimalist visual approach of \"Chances\" allows the raw, vulnerable songwriting to take center stage, creating an intimate connection with the listener.\n\nThe lyric video provides a focused look at the intricate narrative throughout the 'cuts and chances' project.", 
    date: 'August 7, 2025', 
    projectId: 'cuts-and-chances', 
    url: 'https://www.youtube.com/watch?v=F3_2LarUhOs', 
    image: 'https://img.youtube.com/vi/F3_2LarUhOs/maxresdefault.jpg' 
  },
  { 
    id: 'heist-mv', 
    headline: 'The Greatest Heist In History (Music Video) is out', 
    preview: "The music video's here and we love it!", 
    body: "The music video for 'The Greatest Heist In History' launches 2 days before the 6th project, delivering a cinematic experience of VEN's life during the time of when the project was conceptualized and produced.", 
    date: 'August 6, 2025', 
    projectId: 'cuts-and-chances', 
    url: 'https://www.youtube.com/watch?v=WUBXJUXAWPY', 
    image: 'https://img.youtube.com/vi/WUBXJUXAWPY/maxresdefault.jpg' 
  },
  { 
    id: 'cnc-announcement', 
    headline: 'cuts and chances, the project.', 
    preview: "the story of the closed book is about to be told, and a brighter story is now being written. The 6th project, 'cuts and chances', has been officially announced.", 
    body: "VEN and studioseven have officially announced the 6th project, 'cuts and chances'. Born from a period of intense personal reflection and creative restructuring, this album is designed to be VEN's most conceptually rich and coherent body of work yet.\n\nMoving away from the upbeat stylings of its predecessor, this project promises to deliver a raw, unfiltered look at emotional vulnerability, serving as a pivotal turning point in VEN's discography.", 
    date: 'August 6, 2025', 
    projectId: 'cuts-and-chances', 
    url: 'https://www.youtube.com/post/UgkxHn5yVBY0AjKu4t_uiE7IuyuKG3jSU7J6' 
  },
  { 
    id: 'heist-trailer', 
    headline: 'This might be "The Greatest Heist In History (Trailer)"', 
    preview: "Get a glimpse of the cinematic music video for The Greatest Heist In History.", 
    body: "This teaser sets the stage for a music video that immerse the viewers on the life behind the production of cuts and chances.", 
    date: 'July 30, 2025', 
    projectId: 'cuts-and-chances', 
    url: 'https://www.youtube.com/watch?v=gUjT1I3AoTI', 
    image: 'https://img.youtube.com/vi/gUjT1I3AoTI/maxresdefault.jpg' 
  },
  { 
    id: 'star-trailer', 
    headline: 'STAR (Project Trailer) is out', 
    preview: "The trailer for the STAR project has officially dropped.", 
    body: "The 5th project kicks into high gear with the release of the official STAR project trailer. The trailer captures the upbeat, vibrant, and condensed energy that defines this new musical era.\n\nServing as a stark contrast to previous releases, the trailer highlights a shift toward more dynamic production and a highly stylized aesthetic that perfectly complements the project's sonic direction.", 
    date: 'June 15, 2025', 
    projectId: 'star', 
    url: 'https://www.youtube.com/watch?v=QvBXlDqdlvU', 
    image: 'https://img.youtube.com/vi/QvBXlDqdlvU/maxresdefault.jpg' 
  },
  { 
    id: 'the-good-one-ft', 
    headline: 'THE GOOD ONE ft. JHUZZ is out!', 
    preview: "A special collaborative version of THE GOOD ONE featuring JHUZZ is now available.", 
    body: "VEN's first collaboration under studioseven has finally hit the airwaves. A special version of 'THE GOOD ONE' featuring JHUZZ has been officially released as a lead-up to the full STAR project launch.\n\nJHUZZ brings a distinct vocal flair to the track, elevating its energy and adding a new layer of depth to the song's underlying themes of complex relationships.", 
    date: 'June 10, 2025', 
    projectId: 'star', 
    url: 'https://www.youtube.com/post/Ugkx6EN9Atg1jALh2urgUhJIbMfU8JCO0zrz',
    image: 'https://drive.google.com/file/d/12OTLEHsNJGnQn7nx-fUvi8Q2GOPkOMim/view?usp=drive_link'
  },
  { 
    id: 'star-announcement', 
    headline: 'STAR Project Announcement', 
    preview: "Announcing STAR, the 5th project.", 
    body: "VEN and studioseven have officially pulled back the curtain on STAR, the 5th major project in VEN's catalog. After a period of creative restructuring, the project has been refined into a focused collection of five highly upbeat and energetic tracks.\n\nThis announcement marks a significant pivot in sound and artistic direction, trading sweeping melancholy for sharper, more immediate pop-centric production.", 
    date: 'June 1, 2025', 
    projectId: 'star', 
    url: 'https://www.youtube.com/post/UgkxUUhQkBmFP4UeN1ChGKQ3glHLK6zvhJkS' 
  },
  { 
    id: 'at-peace-mv', 
    headline: 'at peace (Music Video) is out!', 
    preview: "The peaceful conclusion. Watch the official music video for 'at peace'.", 
    body: "The 'connections' project reaches its serene and satisfying conclusion with the release of the official music video for 'at peace'. The visual direction completely abandons the intense reds of earlier singles in favor of calming imagery.", 
    date: 'September 6, 2024', 
    projectId: 'connections', 
    url: 'https://www.youtube.com/watch?v=QodRCWnGaqw', 
    image: 'https://img.youtube.com/vi/QodRCWnGaqw/maxresdefault.jpg' 
  },
  { 
    id: 'andromeda-vis', 
    headline: 'andromeda (Visualizer) is out!', 
    preview: "The official visualizer for andromeda has been released.", 
    body: "The visualizer for 'andromeda' is officially live. Having quickly become the most-viewed song in studioseven history with more than 4,000 views, the track's popularity continues to skyrocket.", 
    date: 'September 6, 2024', 
    projectId: 'connections', 
    url: 'https://www.youtube.com/watch?v=85NL2QJjGhM', 
    image: 'https://img.youtube.com/vi/85NL2QJjGhM/maxresdefault.jpg' 
  },
  { 
    id: 'crimson-red-mv', 
    headline: 'crimson red (Music Video) is out!', 
    preview: "Immerse yourself in the official music video for 'crimson red'.", 
    body: "Kicking off the 'connections' era with incredible momentum, the official music video for 'crimson red' is finally here. The video relies on striking, saturated color palettes to convey the intense, burning emotions of the lead single.", 
    date: 'August 19, 2024', 
    projectId: 'connections', 
    url: 'https://www.youtube.com/watch?v=-eZcw8kWTwU', 
    image: 'https://img.youtube.com/vi/-eZcw8kWTwU/maxresdefault.jpg' 
  },
  { 
    id: 'something-mv', 
    headline: 'Something (Music Video) is out', 
    preview: "The visual experience for 'Something' is finally here.", 
    body: "VEN's cryptic project launches with the release of the official music video for 'Something'. The video serves as the visual centerpiece of the 3rd project.", 
    date: 'August 1, 2023', 
    projectId: 'something', 
    url: 'https://www.youtube.com/watch?v=_7PN7Wao7-4', 
    image: 'https://img.youtube.com/vi/_7PN7Wao7-4/maxresdefault.jpg' 
  },
  { 
    id: 'hera-mv', 
    headline: "'HERA' Official Music Video is out!", 
    preview: "Watch the official music video for HERA, the lead single from BUBBLE.", 
    body: "The BUBBLE era officially takes flight with the release of the 'HERA' music video. Accompanying the launch of the 2nd project, this video represents a leap forward in studioseven's visual production.", 
    date: 'November 21, 2022', 
    projectId: 'bubble', 
    url: 'https://www.youtube.com/watch?v=dXxXj9qok5Q', 
    image: 'https://img.youtube.com/vi/dXxXj9qok5Q/maxresdefault.jpg' 
  },
  { 
    id: 'bubble-trailer', 
    headline: 'BUBBLE (Project Trailer) is out!', 
    preview: "The official project trailer for BUBBLE is out now.", 
    body: "Get ready to enter the cinematic universe of the 2nd project. The official trailer for BUBBLE has just dropped, hinting a tantalizing glimpse into the sonic and visual landscape of the upcoming release.\n\nThis trailer not only introduces the project's sleek aesthetic and brand new logo, but it also features snippets of highly anticipated tracks, setting the stage for what promises to be a massive era.", 
    date: 'October 21, 2022', 
    projectId: 'bubble', 
    url: 'https://www.youtube.com/watch?v=7DuQMPxhdb4', 
    image: 'https://img.youtube.com/vi/7DuQMPxhdb4/maxresdefault.jpg' 
  },
]

export function getFeaturedProject(): Project { return PROJECTS.find(p => p.featured) ?? PROJECTS[0] }
export function getProjectById(id: string): Project | undefined { return PROJECTS.find(p => p.id === id) }