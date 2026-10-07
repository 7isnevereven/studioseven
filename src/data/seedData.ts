import { Project, NewsItem, Track, TrackBadge, HistorySection, Artist } from '@/data/projects'
import { supabase } from '../utils/supabase'

/* ── UPDATED RATING INTERFACE ── */
export interface ProjectRating {
  id: string;
  project_id: string;
  track_title?: string;
  rating: number;
  name: string;
  description: string;
  created_at: string;
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

// ... (keep your existing imports and interfaces at the top)

export const PROJECTS: Project[] = [
  {
    id: 'what-do-you-know',
    title: 'What Do You Know?',
    subtitle: 'The 7th Project',
    description: "The 7th project and VEN's final chapter. A collection of poems and songs exploring questions of truth, silence, and what we choose to carry.",
    showcaseOrder: 1,
    showcaseLabel: 'Released Apr 8, 2026',
    featured: true,
    releasedAt: '2026-04-08',
    releaseLabel: 'Released Apr 8, 2026',
    artistId: 'ven',
    coverFile: 'whatdoyouknow.jpg',
    accentColor: '#38bdf8',
    accentSoft: 'rgba(56, 189, 248, 0.40)',
    leadTrack: 'The Video',
    type: 'project',
    spotifyUrl: 'https://open.spotify.com/album/2EYPKI5RNAOFfUE4Qie9vi',
    youtubeUrl: 'https://www.youtube.com/playlist?list=PLzGyT2iTgExANe62FnaNsXrYHpshYbP2X',
    tracks: [
      {
        title: 'In a Row',
        badges: ['POEM'],
        content: `Everything could’ve been simple
If you had said it sooner
No quiet guesses,
No questions left to linger

Chances were there for the taking
You held each one without a word
Like they meant something
Then turned away from what they were for

There will always be things I’ll never know
Pieces you chose not to show
Pieces you kept from being known
While this situation pulled me to my lowest low

And as I watch you close the door, I know you know
There are things about you that he’ll never know
Silences he will never hear
Truths I carried alone

And the one you destroyed for the second time in a row.`
      },
      {
        title: 'Where Does This Bring Me?',
        badges: ['POEM'],
        content: `I saw the weapons laid out like warnings
I heard every committed crime dressed up as honesty
Still, I won’t lie
The blindfold fit me better than the truth ever did.

Soft.
Familiar.
Comfortable.

I wore it with pride
Let it shield me from the fallout
From the meteor shower of almosts
And the bullets of “what are we?”

And when the air finally left my lungs
I stood there breathless and bare
I knew.

I, yes I was,
The one, the only who kept the knot intact,
The one who kept it tight,
The one who chose not to see
Because love felt safer 
Than asking “where does this bring me?”`
      },
      {
        title: 'The Healer',
        badges: ['POEM'],
        content: `As good as it sounds, as perfect as it seems
You had me on your hands, you knew me just from the cover page
You knew all my wounds—you were part of it
A doctor who claimed to heal, then chose to become one of it

The cuts were deeper than the scratch you made to get to know me
You went through the core and skipped the questions of "we"
The performance was perfection, and applause was eerie
As behind the scenes were where you went and erased me`
      },
      {
        title: 'What Do You Know?',
        badges: ['POEM'],
        content: `The love that you avoided
Was the love that you once fought for
And when the silence starts to creep in
You'll find anyone else but no one 

Will anyone know you?
Will someone dare to decode you?
But what do you know?
Like thoughts, you'd hide too

Just like the questions, you'll hide too
The unsaid answers, they'll hide too
Hands in your pocket, those feelings hide too
What do you know? when I know you'll hide too`
      },
      {
        title: 'To Those We Loved Before',
        badges: ['POEM'],
        content: `It was a dream, as one says
Lying on clouds and colder than rain
What felt like heaven for countless days
Is a rose hiding agonizing pain

To those we loved before
In all shades, form, perfections and horn
A mystical addition of a folklore
A wicked mist you thought to adorn

And as I look at the pages of ink and creed
A timeline of imagination-driven sin
A manuscript not to be involved with
And a blood-drowned body wishing to be cleansed`
      },
      {
        title: 'The Video',
        badges: ['POEM'],
        content: `And I rewatched the video from a new point of view,
It was a dream, something I never truly knew.
A candy wrapped in ill-fated sorrow,
But at the end of the day, what do I know?

Frames misalign
The tape wears thin
Nothing sounds the same

The video may have ended the story,
Or so we thought it had concluded.
And as I trace the footer’s note,
I’ll still be there to ask:

In every teardrop hidden by flowers,
What do you know?`
      },
      { title: 'The Video (Song)', badges: ['LEAD', 'SINGLE'] },
      {
        title: 'David (Fear) (from Vox Nova Literary Folio: Spectrum)',
        badges: ['POEM'],
        content: `I laughed as my story gets replayed
Like it was harmless entertainment.
A manic clown of a lover.
A community's happy pill, I must say.

But those folklores and questionable choices are not what I truly am.
Those laughs feel like warnings that echo louder than the last.

I do not wish to belong here.
I do not wish to belong to any of those stories.

People shouldn't hear "stupid" and "foolish" and think about me
Does "to love and be loved" really sound that stupid and foolish?
Why does it feel that way now?

This cannot be my legacy.
This cannot be my future history.

Was I just someone to dominate?
Was I just some young blood you can easily play?
I keep replaying the silence after you left
Like a door I’m afraid to open again.

I made you my God because that's all I know
You took that and left me dry and sore
I thought gods are not supposed to abandon the ones who kneel.
Now, every memory’s a trap ready to seize my soul

And as I hear the stories, there's a question I can never ignore

"Am I ever going to love again?"

From the voices of friends I got used to ignore
From the random strangers I glance at and ghost
From the younger me who never knew “love and care”
And until the last shiver of my body,

"Am I ever going to love again?"`
      },
      {
        title: 'No Matter',
        badges: ['POEM'],
        content: `As the sole voice of this empty canvas
I encompass the unsaid but written dilemmas
The clean translation of the curses
The ghosts of what became my muses

And as I close the casket of the undead
A few questions will always linger
In happiness, in darkness, in peace, and in pain
A thing of matter that will never be reborn

And for the last moment, I will still remain
With these flowers wilted,
With these teardrops on my ashes,

What do you know?`
      },
      { title: 'The Video (Extended)', badges: ['SINGLE', 'BONUS'] },
      { title: 'The Video (Instrumental)', badges: ['BONUS'] },
      { title: 'The Video (Sped Up)', badges: ['BONUS'] },
    ],
    history: [
      { heading: 'Before Release', body: 'The concept for What Do You Know? was planned before the release of CICATRIX. The main track was always intended to be titled The Video. Originally set for Q3 2026, it was first introduced as a literary work on February 14, 2026, featuring a glass-inspired look with an off-white colour scheme, reflecting the project\'s themes of clarity and openness.' },
      { heading: 'Official Release', body: 'On April 8, 2026, the seventh and final project was officially released — including The Video as its only song, alongside additional poems. The official music video for The Video accompanied the release. Ten days later it became available on major streaming platforms including Spotify and YouTube Music.' },
      { heading: 'After Release', body: 'One day after release, The Video (Single Pack) was uploaded to studioseven\'s YouTube channel, including an extended track with a rap verse and a lyric video. What Do You Know? is planned to be VEN\'s final project, closing the series that began in 2020.' }
    ],
  },
  {
    id: 'saccharin',
    title: 'SACCHARIN',
    subtitle: 'Official Movie Soundtrack',
    description: "Official movie soundtrack for NAMUJANE Studios' short film. An auditory tension piece exploring the bitter cure through ambient soundscapes and emotive compositions.",
    showcaseOrder: 2,
    showcaseLabel: 'Released Jan 21, 2026',
    featured: true,
    releasedAt: '2026-01-21',
    releaseLabel: 'Released Jan 21, 2026',
    artistId: 'ven',
    coverFile: 'saccharin.png',
    accentColor: '#10b981',
    accentSoft: 'rgba(16, 185, 129, 0.40)',
    type: 'soundtrack',
    youtubeUrl: 'https://www.youtube.com/playlist?list=PLzGyT2iTgExBb4NRWG6IB3jAckjfvbwhp',
    tracks: [
      { title: 'Sweetener' },
      { title: 'Saccharin' },
      { title: 'The Gecko' },
      { title: 'Fits Right' },
      { title: 'In The Quiet Of The Night' },
      { title: 'Aftertaste' },
    ],
    history: [
      { heading: 'Before Release', body: 'VEN served as the sound director for NAMUJANE Studios, who then conceptualized an album dedicated to the film. Three tracks were drawn from previous projects; three were new compositions.' },
      { heading: 'Official Release', body: 'The official soundtrack for the movie "SACCHARIN" was released 2 days after its premier on PUPQC MMFF 2026.' }
    ],
  },
  {
    id: 'cicatrix',
    title: 'CICATRIX',
    subtitle: 'The 6th Project – Deluxe',
    description: "The deluxe expansion to 'cuts and chances', representing the scars left after the emotional journey. Features 'The Gecko' and collaborations with 13.",
    showcaseOrder: 3,
    showcaseLabel: 'Released Dec 17, 2025',
    featured: true,
    releasedAt: '2025-12-17',
    releaseLabel: 'Released Dec 17, 2025',
    artistId: 'ven',
    coverFile: 'cicatrix.png',
    accentColor: '#ef4444',
    accentSoft: 'rgba(239, 68, 68, 0.40)',
    leadTrack: 'The Gecko',
    type: 'project',
    spotifyUrl: 'https://open.spotify.com/album/2N3nb2GfkHySKNSqcJxM16',
    youtubeUrl: 'https://www.youtube.com/watch?v=uWQR4ILCLWA&list=PLzGyT2iTgExCzTiK2Ccd7ez_L4Ai7wmG5',
    tracks: [
      { title: 'Cuts' },
      { title: 'Chances' },
      { title: 'The Greatest Heist In History' },
      { title: 'Cut!' },
      { title: 'Young Again' },
      { title: 'Brighter Days' },
      { title: 'Fits Right' },
      { title: 'The Gecko', badges: ['LEAD', 'SINGLE'] },
      { title: 'Chances (Sped Up)' },
      { title: 'The Greatest Heist In History (Sped Up)' },
      { title: 'Brighter Days (Sped Up)' },
      { title: 'Young Again (Sped Up)' },
      { title: 'Fits Right (Sped Up)' },
      { title: 'The Gecko (Sped Up)' },
      { title: 'The Gecko (Instrumental)' },
      { title: 'The Gecko (ft. 13)', badges: ['SINGLE', 'DELUXE'] },
    ],
    history: [
      { heading: 'Before Release', body: 'CICATRIX was the closing statement of cuts and chances, representing the "scars" left after the emotional journey. The album cover transformed the symbolic burning effect, originally representing love, into imagery of the person who sought to be loved. The Gecko was written less than two weeks before release as the conclusion to a trilogy beginning with THE GOOD ONE.' },
      { heading: 'Official Release', body: 'On December 17, 2025, the deluxe edition was released alongside a lyric video for The Gecko.' },
      { heading: 'After Release', body: 'In January 2026 the project became available on streaming platforms. The Gecko was re-released in collaboration with 13, featuring a rap verse and extended outro. The single pack was released February 2026.' }
    ],
  },
  {
    id: 'cuts-and-chances',
    title: 'cuts and chances',
    subtitle: 'The 6th Project',
    description: "VEN's 6th project and debut on streaming platforms. A deeply coherent, raw chronicle of heartbreak, choices, and vulnerability featuring 'The Greatest Heist In History'.",
    showcaseOrder: 4,
    showcaseLabel: 'Released Aug 8, 2025',
    releasedAt: '2025-08-08',
    releaseLabel: 'Released Aug 8, 2025',
    artistId: 'ven',
    coverFile: 'cutsandchances.jpg',
    accentColor: '#f97316',
    accentSoft: 'rgba(249, 115, 22, 0.40)',
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
      { heading: 'Before Release', body: 'Following the restructuring of STAR and personal events in May–June 2025, cuts and chances was envisioned to reflect these experiences. Initially titled CUTS, it was designed to be VEN\'s most coherent and conceptually rich project. Development began in June 2025, prior to STAR\'s release. The Greatest Heist In History — originally from STAR — became the focal point, exploring themes of infidelity closely related to THE GOOD ONE (ft. JHUZZ).' },
      { heading: 'Official Release', body: 'On August 8, 2025, the sixth project was officially released and simultaneously made available on Spotify and Apple Music — marking VEN\'s first project on streaming services. The lead track was released August 6, 2025 alongside a music video that became VEN\'s most successful video to date.' },
      { heading: 'After Release', body: 'The project was received positively. Multiple versions of The Greatest Heist In History were released, and Chances was accompanied by a lyric video and additional versions on August 7, 2025.' }
    ],
  },
  {
    id: 'star',
    title: 'STAR',
    subtitle: 'The 5th Project',
    description: "The 5th project and beginning of 'The' Trilogy. An upbeat, electronic-infused sonic evolution featuring 'REAL FORM' and 'THE GOOD ONE (ft. JHUZZ)'.",
    showcaseOrder: 5,
    showcaseLabel: 'Released Jun 20, 2025',
    releasedAt: '2025-06-20',
    releaseLabel: 'Released Jun 20, 2025',
    artistId: 'ven',
    coverFile: 'star.jpg',
    accentColor: '#3b82f6',
    accentSoft: 'rgba(59, 130, 246, 0.40)',
    leadTrack: 'REAL FORM',
    type: 'project',
    spotifyUrl: 'https://open.spotify.com/album/5Uke3afS2BkUV30mR5V6ty',
    youtubeUrl: 'https://www.youtube.com/watch?v=pvO0XnJ2Kkg&list=PLzGyT2iTgExCO8eATL1hhIx2peol_vY-G',
    tracks: [
      { title: 'REAL FORM', badges: ['LEAD', 'SINGLE'] },
      { title: 'KEEP IT' },
      { title: 'MESSY' },
      { title: 'ON THE PHONE' },
      { title: 'THE GOOD ONE' },
      { title: 'THE GOOD ONE (ft. JHUZZ)', badges: ['SINGLE'] },
    ],
    history: [
      { heading: 'Before Release', body: 'STAR was originally planned as VEN\'s only 2025 project — an ongoing release that would grow over time. Personal reasons caused a restructure, condensing it to five upbeat tracks. Songs like The Greatest Heist In History were moved to cuts and chances for not fitting the concept.' },
      { heading: 'Official Release', body: 'On June 20, 2025, the fifth project was officially released. THE GOOD ONE (ft. JHUZZ) was released as a collaborative single ahead of the official release.' },
      { heading: 'After Release', body: 'In January 2026, the project became available on various streaming platforms.' }
    ],
  },
  {
    id: 'when-the-night-falls',
    title: 'when the night falls',
    subtitle: 'A Tribute to Hiro Jin',
    description: "A sacred tribute project commemorating Hiro Jin. Ambient nocturnes exploring grief, remembrance, and the peace found in twilight.",
    showcaseOrder: 6,
    showcaseLabel: 'Released Oct 6, 2024',
    releasedAt: '2024-10-06',
    releaseLabel: 'Released Oct 6, 2024',
    artistId: 'ven',
    coverFile: 'whenthenightfalls.png',
    accentColor: '#8b5cf6',
    accentSoft: 'rgba(139, 92, 246, 0.40)',
    type: 'special',
    youtubeUrl: 'https://www.youtube.com/watch?v=Bwv_V82Kf_k&list=PLzGyT2iTgExAosOJUh0_59tYves_vLt7q',
    tracks: [
      { title: 'in the quiet of the night' },
      { title: 'heaven-sent' }
    ],
    history: [
      { heading: 'Before Release', body: 'when the night falls was an unplanned release created to commemorate Hiro Jin\'s passing in late September 2024. Due to the sudden nature of the event, the project received no additional media content beyond the project cover and the tracks themselves.' },
      { heading: 'Official Release', body: 'On October 6, 2024, the special tribute project was officially released.' }
    ],
  },
  {
    id: 'connections',
    title: 'connections',
    subtitle: 'The 4th Project',
    description: "The 4th project examining ties, unspoken words, and the bonds we forge. Featuring the channel-defining ambient singles 'crimson red' and 'andromeda'.",
    showcaseOrder: 7,
    showcaseLabel: 'Released Sep 6, 2024',
    releasedAt: '2024-09-06',
    releaseLabel: 'Released Sep 6, 2024',
    artistId: 'ven',
    coverFile: 'connections.jpg',
    accentColor: '#f59e0b',
    accentSoft: 'rgba(245, 158, 11, 0.40)',
    leadTrack: 'crimson red',
    type: 'project',
    spotifyUrl: 'https://open.spotify.com/album/1k7swO9gKAWtmhuv9T1cQl',
    youtubeUrl: 'https://www.youtube.com/watch?v=-eZcw8kWTwU&list=PLzGyT2iTgExADXuVcLSp_J_42I7RPm8Hf',
    tracks: [
      { title: 'crimson red', badges: ['SINGLE'] },
      { title: 'andromeda', badges: ['SINGLE'] },
      { title: 'at peace', badges: ['LEAD', 'SINGLE'] },
      { title: 'my everything', badges: ['SINGLE'] }
    ],
    history: [
      { heading: 'Before Release', body: 'connections was initially designed to be a poetry-based project centered on the idea of "the connections we made along the way." It was refined into four tracks, each with its own dedicated promotional period. The lead track crimson red was released August 19, 2024 with a music video. andromeda — originally titled eyes of andromeda — and its sped-up version became the most-viewed videos on studioseven\'s YouTube channel, reaching more than 4,000 views.' },
      { heading: 'Official Release', body: 'On September 6, 2024, the fourth project was officially released alongside the official video for at peace.' },
      { heading: 'After Release', body: 'In January 2026, the project became available on various streaming platforms.' }
    ],
  },
  {
    id: 'something',
    title: 'Something',
    subtitle: 'The 3rd Project',
    description: "The 3rd project marking VEN's transition into visual storytelling and introspection. An emotive narrative exploring stillness, longing, and closure.",
    showcaseOrder: 8,
    showcaseLabel: 'Released Jul 7, 2023',
    releasedAt: '2023-07-03',
    releaseLabel: 'Released Jul 7, 2023',
    artistId: 'ven',
    coverFile: 'something.png',
    accentColor: '#14b8a6',
    accentSoft: 'rgba(20, 184, 166, 0.40)',
    leadTrack: 'Something',
    type: 'project',
    spotifyUrl: 'https://open.spotify.com/album/1JUY1DqQpD6iv9RhXpSQf9',
    youtubeUrl: 'https://www.youtube.com/playlist?list=PLzGyT2iTgExBl8gwpkV0_DRsg_NzNwOPS',
    tracks: [
      { title: 'Something', badges: ['LEAD', 'SINGLE'] },
      { title: 'Hush' },
      { title: 'Idle' },
      { title: 'Nothing' },
      { title: 'The Last Time', badges: ['DELUXE', 'SINGLE'] },
      { title: 'Decode', badges: ['DELUXE', 'POEM'] }
    ],
    history: [
      { heading: 'Before Release', body: 'The third project was designed as VEN\'s first visual project, with all four tracks paired with simultaneous visualizer videos on release day. However, this was not accomplished as only the lead single received a proper visual content.' },
      { heading: 'Official Release', body: 'Released on July 3, 2023, the project featured four tracks. The official video for Something was released August 1, 2023. A post-release deluxe edition titled The Last Time was later added, including an additional track and a poem.' },
      { heading: 'After Release', body: 'A holiday remix of the lead track Something was also released.' }
    ],
  },
  {
    id: 'bubble',
    title: 'BUBBLE',
    subtitle: 'The 2nd Project',
    description: "The 2nd project and breakthrough era. A soaring dreamscape of resilience, vulnerability, and cinematic pop centered around 'HERA' and 'RESILIENCE'.",
    showcaseOrder: 9,
    showcaseLabel: 'Released Nov 21, 2022',
    releasedAt: '2022-11-21',
    releaseLabel: 'Released Nov 21, 2022',
    artistId: 'ven',
    coverFile: 'bubble.jpg',
    accentColor: '#a855f7',
    accentSoft: 'rgba(168, 85, 247, 0.40)',
    leadTrack: 'HERA',
    type: 'project',
    youtubeUrl: 'https://www.youtube.com/watch?v=7DuQMPxhdb4&list=PLzGyT2iTgExDZXnkGV4d3YM-qLBOmxv-d',
    tracks: [
      { title: 'RESILIENCE', badges: ['SINGLE'] },
      { title: 'Bad' },
      { title: 'Drama' },
      { title: 'HERA', badges: ['LEAD', 'SINGLE'] },
      { title: 'Glistening Asteroid' },
      { title: 'Satellite' },
      { title: 'RESILIENCE (Extended Version)', badges: ['BONUS'] },
      { title: 'Over', badges: ['BONUS'] },
      { title: 'HERA', badges: ['DELUXE'] },
      { title: 'SATELLITE', badges: ['DELUXE', 'SINGLE'] }
    ],
    history: [
      { heading: 'Before Release', body: 'The BUBBLE era began with the release of Resilience on February 2, 2022 — nine months before the full project. Work on the track started in July 2021, originally intended for You Do You as Overturn pt. 2. The rollout for the lead track began October 21, 2022, introducing the project\'s new logo and previewing the bonus track Laugh. Posters, snippets, an album trailer, and teaser videos for HERA were shared across platforms in the days leading up to release.' },
      { heading: 'Official Release', body: 'On November 21, 2022, the second full project was officially released alongside the official video for HERA. The release was met with significantly greater success than the previous project.' },
      { heading: 'After Release', body: 'BUBBLE (Deluxe Edition) was released on April 10, 2023 — five months after the original — featuring new renditions of HERA and Satellite.' }
    ],
  },
  {
    id: 'you-do-you',
    title: 'You Do You',
    subtitle: 'The 1st Project',
    description: "The foundational debut project that started studioseven. A raw, experimental journey of identity and catharsis featuring 'Overturn' and 'LOVEHATE'.",
    showcaseOrder: 10,
    showcaseLabel: 'Released Nov 24, 2020',
    releasedAt: '2020-11-24',
    releaseLabel: 'Released Nov 24, 2020',
    artistId: 'ven',
    coverFile: 'youdoyou.jpg',
    accentColor: '#ec4899',
    accentSoft: 'rgba(236, 72, 153, 0.40)',
    leadTrack: 'Overturn',
    type: 'project',
    spotifyUrl: 'https://open.spotify.com/album/2qkcrMVIoipKOkehyEDZqk',
    youtubeUrl: 'https://www.youtube.com/watch?v=vkPTwlpQfX8&list=PLzGyT2iTgExBl8gwpkV0_DRsg_NzNwOPS',
    tracks: [
      { title: 'LOVEHATE', badges: ['SINGLE'] },
      { title: 'Very Festive', badges: ['SINGLE'] },
      { title: 'Overturn', badges: ['LEAD', 'SINGLE'] },
      { title: '05170319 (Stranger)' }
    ],
    history: [
      { heading: 'Before Release', body: 'You Do You began with two experimental demo tracks: Volatile in August 2020 and Schmaltz in October 2020. On November 14, LOVEHATE was released, followed by Very Festive on November 21.' },
      { heading: 'Official Release', body: 'On November 24, 2020, the full project was officially released alongside a short concept video for Overturn.' },
      { heading: 'After Release', body: 'You Do You (Final Version) was released July 30, 2021, featuring a remastered Overturn. Five years later, the 5th Anniversary Edition was released with refined instrumentals and improved mixing, excluding demo tracks — marking it as VEN\'s third project on streaming services.' }
    ],
  },
]

export const NEWS: NewsItem[] = [
  {
    id: '07w201',
    headline: 'studioseven Feature Drop 07W201: A Seamless New Listening Experience',
    preview: "studioseven Feature Drop 07W201: A Seamless New Listening Experience",
    body: `The latest update to the studioseven website brings a wave of design refinements and interactive features. With Feature Drop 07W201, the focus is firmly on elevating the user experience, making music discovery more engaging, and wrapping the entire platform in a cleaner, premium aesthetic.

1. The All-New "Now Playing" Sidebar: The left menu has been completely redesigned to serve as a dedicated, breathable music hub, keeping your current tracks front and center without cluttering the interface.

2. Interactive Mini-Player: A permanent YouTube player is now embedded directly in the sidebar for uninterrupted listening.

3. "Up Next" Queue: Beneath the player sits a clickable tracklist. Tapping any song in the queue instantly switches the mini-player to that track.

4. Collapsible Menu: For users who prefer a wider view, the left sidebar can now be completely hidden. Closing it smoothly expands the main page, allowing news and projects to fill the entire screen.

5. Live Community Ratings & Reviews: Music is a shared experience, and the new interactive review system allows the studioseven community to voice their opinions in real-time.

6. Rate Everything: Users can now leave 1-to-5 star ratings and written reviews. This applies not only to full projects but also to individual songs and poems.

7. Live Updates: The review system is dynamic and fully live. If another user leaves a rating while you are viewing a project, it will appear on your screen instantly. No page refresh required.

8. At-A-Glance Scores: Homepage project cards now display their average community star rating directly next to the title, making it easier to spot people's favorites.

9. Review Details: Transparency has been improved in the community reviews section, which now displays the exact date and time each review was posted.

10. A Smoother, Premium Aesthetic: The visual language of studioseven has been tightened and polished to deliver a fluid, high-end browsing experience.

11. Refined Hover Effects: Buttons and project cards now feature a subtle, premium "lift" effect when hovered over, replacing the previous aggressive zoom animations.

12. Flawless Glass UI: The frosted-glass aesthetic has been perfected. Visual inconsistencies, such as cut-off drop shadows and random lines on the top navigation bar, have been completely eliminated.

13. Seamless Scrolling: Default browser scrollbars have been hidden to give the entire site an edge-to-edge, liquid glass appearance, while maintaining normal scrolling functionality.

14. Optimized Artist Pages: Spacing issues on Artist pages have been resolved. Project thumbnails now align in a perfect, organized grid, removing awkward blank gaps and stretched images.

15. A Tidier Mobile Experience For users browsing on their phones, the platform has been optimized to ensure the mobile site feels just as premium as the desktop version.

16. Streamlined Layout: When viewing a project on a mobile device, the album cover is now perfectly sized to fit the screen. Menu buttons for the Tracklist, History, and Ratings have been reorganized into a sleek, swipeable horizontal row.

17. Cleaner Artist Profiles: Mobile artist profiles have been restructured, neatly stacking the project count directly under the artist's picture for a much more balanced and tidy look.

Experience the new features today by visiting the studioseven website and exploring Feature Drop 07W201.`,
    date: 'July 17, 2026',
    projectId: 'what-do-you-know',
    image: 'https://drive.google.com/file/d/14H9sLepetvc6Tv3-c2Zfuk6U8L9xAHHs/view?usp=drive_link'
  },
  {
    id: 'ss7ofcsite',
    headline: 'Meet the new studioseven Website.',
    preview: "New beginnings, and a more polished studioseven Website",
    body: `New beginnings, and a more polished studioseven Website.

Take a closer look at the expansive lore behind our projects, discover more about our featured artists, and trace our entire journey since 2020. Plus, catch a glimpse of our future endeavors in the Newsroom. Step into a more refined studioseven experience now!`,
    date: 'July 11, 2026',
    projectId: 'what-do-you-know',
    image: 'https://drive.google.com/file/d/1LLIybwcV9AH8ar_mTtglpghC4HzmWbQJ/view?usp=drive_link'
  },
  {
    id: 'the-video-lyric',
    headline: 'The Video (Extended) Lyric Video is out!',
    preview: "You haven't seen everythign yet. But even with more details, we may still never know.",
    body: `You haven't seen everythign yet. But even with more details, we may still never know.

Uncover more wordplays on the 7th project with the official lyric video for the extended cut of 'The Video'. This new release extends the original's narrative flow and the dense, poetic structure of the lyrics.

The lyric video is now streaming exclusively on the studioseven YouTube channel.`,
    date: 'April 9, 2026',
    projectId: 'what-do-you-know',
    url: 'https://www.youtube.com/watch?v=QBDklz7FMBU',
    image: 'https://img.youtube.com/vi/QBDklz7FMBU/maxresdefault.jpg'
  },
  {
    id: 'the-video-mv',
    headline: 'The Video (Music Video) is out!',
    preview: "I keep on replaying the video, hoping it will finally explain what happened — but every replay only proves how much I’ll never fully know.",
    body: `I keep on replaying the video, hoping it will finally explain what happened — but every replay only proves how much I’ll never fully know.

The official music video for 'The Video', the lead and sole track of the 7th project, What Do You Know?, is out now!

As the sole musical track of the 'What Do You Know?' project, this music video carries the entirety of the project's sonic identity and bridges the gap between the album's spoken-word poetry and its musical ambitions.`,
    date: 'April 8, 2026',
    projectId: 'what-do-you-know',
    url: 'https://www.youtube.com/watch?v=SYLboWk7EE0',
    image: 'https://img.youtube.com/vi/SYLboWk7EE0/maxresdefault.jpg'
  },
  {
    id: 'wdyk-contents',
    headline: 'What do you know about "What Do You Know?"',
    preview: "The official tracklist and contents for 'What Do You Know?' have been unveiled.",
    body: `Unlike previous albums, this project breaks the mold by heavily featuring literary works and spoken-word poetry, rather than a traditional multi-track musical album.

The content reveal showcases a unique structure centered around a single musical anchor, 'The Video', surrounded by emotional poems.`,
    date: 'April 7, 2026',
    projectId: 'what-do-you-know',
    url: 'https://www.instagram.com/studioseven.ofc/p/DWyM_GHD38t/',
    image: 'https://drive.google.com/file/d/1hVwp02j4SxpXUlFhpmJcUeLai-nSjZsf/view?usp=drive_link'
  },
  {
    id: 'wdyk-teaser',
    headline: 'In every tear behind the flowers, What Do You Know?',
    preview: "In every tear behind the flowers, what do you know?",
    body: `A poetic and cryptic teaser gave the listeners their first taste of the monochromatic world that encompasses this era.

The teaser hinted the departure from traditional musical releases in favor of something far more experimental and was never done before by VEN.`,
    date: 'April 6, 2026',
    projectId: 'what-do-you-know',
    url: 'https://www.instagram.com/studioseven.ofc/p/DWxxe_ZD1fa/'
  },
  {
    id: 'siklaw-copa-sampaguita',
    headline: 'studioseven as a Music Partner for COPA SAMPAGUITA',
    preview: "studioseven as a Music Partner for COPA SAMPAGUITA",
    body: `Another beautiful chapter in the studioseven journey.

Thank you to the organizers of 𝗖𝗢𝗣𝗔 𝗦𝗔𝗠𝗣𝗔𝗚𝗨𝗜𝗧𝗔 for having us as your official Music Partner. We loved providing the soundtrack for this incredible event. Congratulations on a massively successful run, and cheers to our fellow partners for making it all happen!`,
    date: 'March 27, 2026',
    url: 'https://www.facebook.com/photo/?fbid=1260099726234289&set=a.412189177692019',
    image: 'https://drive.google.com/file/d/16WOlvfBNRYiPBEUEnfgHM-POkFM9gxQP/view?usp=drive_link'
  },
  {
    id: 'ven-workshop-oca',
    headline: 'DEEP DIVE: Audio Production Seminar and Workshop',
    preview: "DEEP DIVE: Audio Production Seminar and Workshop",
    body: `Step into the world of sound and creativity as we present 𝐃𝐄𝐄𝐏 𝐃𝐈𝐕𝐄: 𝐀𝐮𝐝𝐢𝐨 𝐏𝐫𝐨𝐝𝐮𝐜𝐭𝐢𝐨𝐧 𝐒𝐞𝐦𝐢𝐧𝐚𝐫 𝐚𝐧𝐝 𝐖𝐨𝐫𝐤𝐬𝐡𝐨𝐩. 🎶 This event aims to provide participants with valuable knowledge and practical insights into the art of audio production—from understanding sound fundamentals 🎛️ to enhancing production techniques 🎚️. It’s a great opportunity to learn how quality audio plays an important role in media and content creation. 🎥✨

Join us on 𝐌𝐚𝐫𝐜𝐡 𝟏𝟎, 𝟐𝟎𝟐𝟔, 𝐟𝐫𝐨𝐦 𝟏:𝟑𝟎 𝐏𝐌 𝐭𝐨 𝟒:𝟑𝟎 𝐏𝐌 𝐚𝐭 𝐭𝐡𝐞 𝐀𝐕𝐑 for an engaging and informative session. We are honored to have 𝐆𝐮𝐞𝐬𝐭 𝐒𝐩𝐞𝐚𝐤𝐞𝐫: 𝐕𝐞𝐧 𝐕𝐢𝐧𝐥𝐮𝐚𝐧, who will be sharing expertise, experiences, and helpful tips about the field of audio production. 🎧💡

Don’t miss this chance to learn, discover new skills, and deepen your understanding of sound production. See you at the seminar! 🎤🔊🎵

#PUPQCOCA
#officeoftheculturalaffairs
#OCA

 Caption from Office of the Cultural Affairs - PUPQC.`,
    date: 'March 9, 2026',
    url: 'https://www.facebook.com/PUPQCPAGEANT/posts/pfbid0Ps7mo9HUbiayAyaiZdP4cWQc51JUaQHcLs1LAbWNA8n5m13WpwHUFuLbeuM6y8JMl',
    image: 'https://drive.google.com/file/d/1_TI3eCZSV4O1T6g3HRkzE6CiMzlEs18t/view?usp=drive_link'
  },
  {
    id: 'gecko-13',
    headline: 'VEN and 13 for the extended cut of "The Gecko", out now!',
    preview: "Dont keep the lights out! The extended cut of The Gecko is out.",
    body: `The CICATRIX saga continues to expand with the announcement of an extended single pack for 'The Gecko', featuring a collaboration with the artist 13.

Featuring 13, this new rendition brings a fresh dynamic through an added rap verse and an extended outro, which enriched the dark and complex themes explored in the original deluxe edition.`,
    date: 'February 10, 2026',
    projectId: 'cicatrix',
    url: 'https://www.instagram.com/studioseven.ofc/p/DTwyvsUD_Qc/',
    image: 'https://drive.google.com/file/d/1f0dFwtikwMpqc4uC26vUxcPUXiI7_w2H/view?usp=drive_link'
  },
  {
    id: 'saccharin-film',
    headline: "NAMUJANE Studios and studioseven presents the official short film 'SACCHARIN'.",
    preview: "NAMUJANE Studios and studioseven presents the official short film 'SACCHARIN'.",
    body: `The short film 'SACCHARIN', produced by NAMUJANE Studios, is officially available to watch on studioseven YouTube channel. The film stands out as a remarkable collaborative achievement, blending compelling visual storytelling with an impactful auditory experience. The original soundtrack seamlessly integrates with the on-screen tension.`,
    date: 'January 21, 2026',
    projectId: 'saccharin',
    url: 'https://www.youtube.com/watch?v=4HbGb9511DU',
    image: 'https://img.youtube.com/vi/4HbGb9511DU/maxresdefault.jpg'
  },
  {
    id: 'saccharin-poster',
    headline: 'Life is bitter. The cure is SACCHARIN. Movie Poster Revealed',
    preview: "The official poster for the upcoming film SACCHARIN has been revealed.",
    body: `The visual identity of 'SACCHARIN' comes into focus with the reveal of its official movie poster. Made by Ralph Gerard Duenas, the artwork perfectly encapsulates the tension, mystery, and dramatic flair that the film promises to deliver to its audience.

The poster also officially highlights the collaboration with studioseven, crediting VEN and studioseven for the film's comprehensive sound design and original motion picture soundtrack.`,
    date: 'January 10, 2026',
    projectId: 'saccharin',
    url: 'https://www.youtube.com/post/UgkxIa0bnyiWr1cmuz2Yn7zZZP96MLSpbV1f',
    image: 'https://drive.google.com/file/d/1cjt1MCSWhZJK_0OaGi8mLqj0dRUZcliB/view?usp=drive_link'
  },
  {
    id: 'cicatrix-out',
    headline: 'CICATRIX is out now!',
    preview: "You are what you destroyed. The deluxe expansion to cuts and chances is officially out now.",
    body: `The deluxe expansion to the critically acclaimed 'cuts and chances' project, officially titled CICATRIX, is out now. This expansive release brings a darker, more reflective conclusion to the era, serving as the literal and metaphorical 'scars' left behind.

CICATRIX dramatically recontextualizes the original album, introducing a new track, sped-up renditions, and a shifting conceptual focus that turns the lens inward toward the person seeking to be loved.`,
    date: 'December 17, 2025',
    projectId: 'cicatrix',
    url: 'https://www.instagram.com/studioseven.ofc/p/DSKx96yD_hU/'
  },
  {
    id: 'cicatrix-announcement',
    headline: 'cuts, chances, and CICATRIX.',
    preview: "See the expanded world with the upcoming deluxe project: CICATRIX.",
    body: `Following the success of the 6th project, VEN and studioseven have officially announced the upcoming deluxe edition, titled CICATRIX. 

This deluxe edition promises to dive deeper into the emotional aftermath of the original tracklist, introducing a brand new song and explores the lasting impact of the project's core themes.`,
    date: 'December 1, 2025',
    projectId: 'cicatrix',
    url: 'https://www.instagram.com/studioseven.ofc/p/DRaGgXhknG-/'
  },
  {
    id: 'chances-lyric',
    headline: 'Chances (Lyric Video) is out!',
    preview: "Sing along with the official lyric video for 'Chances'.",
    body: `The minimalist visual approach of "Chances" allows the raw, vulnerable songwriting to take center stage, creating an intimate connection with the listener.

The lyric video provides a focused look at the intricate narrative throughout the 'cuts and chances' project.`,
    date: 'August 7, 2025',
    projectId: 'cuts-and-chances',
    url: 'https://www.youtube.com/watch?v=F3_2LarUhOs',
    image: 'https://img.youtube.com/vi/F3_2LarUhOs/maxresdefault.jpg'
  },
  {
    id: 'heist-mv',
    headline: 'The Greatest Heist In History (Music Video) is out!',
    preview: "The music video's here and we love it!",
    body: `The music video for 'The Greatest Heist In History' launches 2 days before the 6th project, delivering a cinematic experience of VEN's life during the time of when the project was conceptualized and produced.`,
    date: 'August 6, 2025',
    projectId: 'cuts-and-chances',
    url: 'https://www.youtube.com/watch?v=WUBXJUXAWPY',
    image: 'https://img.youtube.com/vi/WUBXJUXAWPY/maxresdefault.jpg'
  },
  {
    id: 'cnc-announcement',
    headline: 'cuts and chances, the project.',
    preview: "the story of the closed book is about to be told, and a brighter story is now being written. The 6th project, 'cuts and chances', has been officially announced.",
    body: `VEN and studioseven have officially announced the 6th project, 'cuts and chances'. Born from a period of intense personal reflection and creative restructuring, this album is designed to be VEN's most conceptually rich and coherent body of work yet.

Moving away from the upbeat stylings of its predecessor, this project promises to deliver a raw, unfiltered look at emotional vulnerability, serving as a pivotal turning point in VEN's discography.`,
    date: 'August 6, 2025',
    projectId: 'cuts-and-chances',
    url: 'https://www.youtube.com/post/UgkxHn5yVBY0AjKu4t_uiE7IuyuKG3jSU7J6'
  },
  {
    id: 'heist-trailer',
    headline: 'This might be "The Greatest Heist In History (Trailer)"',
    preview: "Get a glimpse of the cinematic music video for The Greatest Heist In History.",
    body: `This teaser sets the stage for a music video that immerse the viewers on the life behind the production of cuts and chances.`,
    date: 'July 30, 2025',
    projectId: 'cuts-and-chances',
    url: 'https://www.youtube.com/watch?v=gUjT1I3AoTI',
    image: 'https://img.youtube.com/vi/gUjT1I3AoTI/maxresdefault.jpg'
  },
  {
    id: 'star-trailer',
    headline: 'STAR (Project Trailer) is out!',
    preview: "The trailer for the STAR project has officially dropped.",
    body: `The 5th project kicks into high gear with the release of the official STAR project trailer. The trailer captures the upbeat, vibrant, and condensed energy that defines this new musical era.

Serving as a stark contrast to previous releases, the trailer highlights a shift toward more dynamic production and a highly stylized aesthetic that perfectly complements the project's sonic direction.`,
    date: 'June 15, 2025',
    projectId: 'star',
    url: 'https://www.youtube.com/watch?v=QvBXlDqdlvU',
    image: 'https://img.youtube.com/vi/QvBXlDqdlvU/maxresdefault.jpg'
  },
  {
    id: 'the-good-one-ft',
    headline: 'THE GOOD ONE ft. JHUZZ is out!',
    preview: "A special collaborative version of THE GOOD ONE featuring JHUZZ is now available.",
    body: `VEN's first collaboration under studioseven has finally hit the airwaves. A special version of 'THE GOOD ONE' featuring JHUZZ has been officially released as a lead-up to the full STAR project launch.

JHUZZ brings a distinct vocal flair to the track, elevating its energy and adding a new layer of depth to the song's underlying themes of complex relationships.`,
    date: 'June 10, 2025',
    projectId: 'star',
    url: 'https://www.youtube.com/post/Ugkx6EN9Atg1jALh2urgUhJIbMfU8JCO0zrz',
    image: 'https://drive.google.com/file/d/12OTLEHsNJGnQn7nx-fUvi8Q2GOPkOMim/view?usp=drive_link'
  },
  {
    id: 'star-announcement',
    headline: 'STAR, The 5th Project.',
    preview: "Announcing STAR, the 5th project.",
    body: `VEN and studioseven have officially pulled back the curtain on STAR, the 5th major project in VEN's catalog. After a period of creative restructuring, the project has been refined into a focused collection of five highly upbeat and energetic tracks.

This announcement marks a significant pivot in sound and artistic direction, trading sweeping melancholy for sharper, more immediate pop-centric production.`,
    date: 'June 1, 2025',
    projectId: 'star',
    url: 'https://www.youtube.com/post/UgkxUUhQkBmFP4UeN1ChGKQ3glHLK6zvhJkS'
  },
  {
    id: 'at-peace-mv',
    headline: 'at peace (Music Video) is out!',
    preview: "The peaceful conclusion. Watch the official music video for 'at peace'.",
    body: `The 'connections' project reaches its serene and satisfying conclusion with the release of the official music video for 'at peace'. The visual direction completely abandons the intense reds of earlier singles in favor of calming imagery.`,
    date: 'September 6, 2024',
    projectId: 'connections',
    url: 'https://www.youtube.com/watch?v=QodRCWnGaqw',
    image: 'https://img.youtube.com/vi/QodRCWnGaqw/maxresdefault.jpg'
  },
  {
    id: 'andromeda-vis',
    headline: 'andromeda (Visualizer) is out!',
    preview: "The official visualizer for andromeda has been released.",
    body: `The visualizer for 'andromeda' is officially live. Having quickly become the most-viewed song in studioseven history with more than 4,000 views, the track's popularity continues to skyrocket.`,
    date: 'September 6, 2024',
    projectId: 'connections',
    url: 'https://www.youtube.com/watch?v=85NL2QJjGhM',
    image: 'https://img.youtube.com/vi/85NL2QJjGhM/maxresdefault.jpg'
  },
  {
    id: 'crimson-red-mv',
    headline: 'crimson red (Music Video) is out!',
    preview: "Immerse yourself in the official music video for 'crimson red'.",
    body: `Kicking off the 'connections' era with incredible momentum, the official music video for 'crimson red' is finally here. The video relies on striking, saturated color palettes to convey the intense, burning emotions of the lead single.`,
    date: 'August 19, 2024',
    projectId: 'connections',
    url: 'https://www.youtube.com/watch?v=-eZcw8kWTwU',
    image: 'https://img.youtube.com/vi/-eZcw8kWTwU/maxresdefault.jpg'
  },
  {
    id: 'something-mv',
    headline: 'Something (Music Video) is out!',
    preview: "The visual experience for 'Something' is finally here.",
    body: `VEN's cryptic project launches with the release of the official music video for 'Something'. The video serves as the visual centerpiece of the 3rd project.`,
    date: 'August 1, 2023',
    projectId: 'something',
    url: 'https://www.youtube.com/watch?v=_7PN7Wao7-4',
    image: 'https://img.youtube.com/vi/_7PN7Wao7-4/maxresdefault.jpg'
  },
  {
    id: 'hera-mv',
    headline: "Watch the official music video for HERA, the lead single from BUBBLE.",
    preview: "Watch the official music video for HERA, the lead single from BUBBLE.",
    body: `The BUBBLE era officially takes flight with the release of the 'HERA' music video. Accompanying the launch of the 2nd project, this video represents a leap forward in studioseven's visual production.`,
    date: 'November 21, 2022',
    projectId: 'bubble',
    url: 'https://www.youtube.com/watch?v=dXxXj9qok5Q',
    image: 'https://img.youtube.com/vi/dXxXj9qok5Q/maxresdefault.jpg'
  },
  {
    id: 'bubble-trailer',
    headline: 'The official project trailer for BUBBLE is out now!',
    preview: "The official project trailer for BUBBLE is out now.",
    body: `Get ready to enter the cinematic universe of the 2nd project. The official trailer for BUBBLE has just dropped, hinting a tantalizing glimpse into the sonic and visual landscape of the upcoming release.

This trailer not only introduces the project's sleek aesthetic and brand new logo, but it also features snippets of highly anticipated tracks, setting the stage for what promises to be a massive era.`,
    date: 'October 21, 2022',
    projectId: 'bubble',
    url: 'https://www.youtube.com/watch?v=7DuQMPxhdb4',
    image: 'https://img.youtube.com/vi/7DuQMPxhdb4/maxresdefault.jpg'
  },
]

export function getFeaturedProject(): Project {
  return PROJECTS.find(p => p.featured) ?? PROJECTS[0]
}

export function getProjectById(id: string): Project | undefined {
  return PROJECTS.find(p => p.id === id)
}