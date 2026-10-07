'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase'
import {
  getLiveNews,
  getLiveProjects,
  getLiveArtists,
  saveNewsItem,
  deleteNewsItem,
  saveProject,
  deleteProject,
  saveArtist,
  deleteArtist,
  sortNewsByDateDesc,
  sortProjectsByDateDesc,
} from '@/utils/dataStore'
import {
  NewsItem,
  Project,
  Track,
  TrackBadge,
  TrackCredits,
  ProjectCredits,
  HistorySection,
  Artist,
  getCoverUrl,
  formatTimeAgo,
  getDefaultProjectCredits,
  getDefaultTrackCredits,
} from '@/data/projects'
import type { User } from '@supabase/supabase-js'

const LOGO_URL = 'https://flrwvmfjjuyoyjeeosls.supabase.co/storage/v1/object/public/misc/ss7.png'

const TRACK_BADGES: TrackBadge[] = ['LEAD', 'SINGLE', 'DELUXE', 'BONUS', 'POEM']

// ─── ZERO TRUST SECURITY CONFIGURATION ───
const AUTHORIZED_ADMIN_EMAILS = ['vinluan.carlsteven24@gmail.com']
const LOCKOUT_KEY = 'ss7_admin_lockout_until'
const ATTEMPTS_KEY = 'ss7_admin_failed_attempts'
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes lockout
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes session expiry

// ─── PRESET STUDIO COLOR PALETTES ───
const PRESET_PALETTES = [
  { name: 'Sky Cyan', accent: '#38bdf8', soft: 'rgba(56, 189, 248, 0.40)' },
  { name: 'Emerald', accent: '#10b981', soft: 'rgba(16, 185, 129, 0.40)' },
  { name: 'Sunset Amber', accent: '#f59e0b', soft: 'rgba(245, 158, 11, 0.40)' },
  { name: 'Crimson Ember', accent: '#ef4444', soft: 'rgba(239, 68, 68, 0.40)' },
  { name: 'Electric Violet', accent: '#a855f7', soft: 'rgba(168, 85, 247, 0.40)' },
  { name: 'Deep Indigo', accent: '#6366f1', soft: 'rgba(99, 102, 241, 0.40)' },
  { name: 'Rose Petal', accent: '#f43f5e', soft: 'rgba(244, 63, 94, 0.40)' },
  { name: 'Slate Smoke', accent: '#64748b', soft: 'rgba(100, 116, 139, 0.40)' },
]

// ─── CALENDAR & DATE PICKER UTILITIES ───
function toDateInputValue(dateStr?: string): string {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  const parsed = new Date(dateStr)
  if (isNaN(parsed.getTime())) return ''
  const y = parsed.getFullYear()
  const m = String(parsed.getMonth() + 1).padStart(2, '0')
  const d = String(parsed.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDateFromInput(dateVal: string): string {
  if (!dateVal) return ''
  const [y, m, d] = dateVal.split('-').map(Number)
  if (!y || !m || !d) return dateVal
  const dateObj = new Date(y, m - 1, d)
  return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function toDatetimeLocalValue(isoOrDateStr?: string): string {
  if (!isoOrDateStr) return ''
  const parsed = new Date(isoOrDateStr)
  if (isNaN(parsed.getTime())) return ''
  const y = parsed.getFullYear()
  const m = String(parsed.getMonth() + 1).padStart(2, '0')
  const d = String(parsed.getDate()).padStart(2, '0')
  const h = String(parsed.getHours()).padStart(2, '0')
  const min = String(parsed.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d}T${h}:${min}`
}

export default function AdminPortalClient() {
  const [user, setUser] = useState<User | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Login form state & Brute-force protection
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [lockoutSecondsRemaining, setLockoutSecondsRemaining] = useState<number>(0)

  // Navigation & Search State
  const [activeTab, setActiveTab] = useState<'news' | 'projects' | 'showcase' | 'artists'>('news')
  const [newsSearch, setNewsSearch] = useState('')
  const [projectSearch, setProjectSearch] = useState('')
  const [artistSearch, setArtistSearch] = useState('')

  // Data
  const [newsList, setNewsList] = useState<NewsItem[]>([])
  const [projectsList, setProjectsList] = useState<Project[]>([])
  const [artistsList, setArtistsList] = useState<Artist[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // News Editor Modal
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null)
  const [originalNewsId, setOriginalNewsId] = useState<string | null>(null)
  const [savingNews, setSavingNews] = useState(false)

  // Project Editor Modal (with sub-tabs)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [originalProjectId, setOriginalProjectId] = useState<string | null>(null)
  const [projectEditorTab, setProjectEditorTab] = useState<'details' | 'links' | 'tracks' | 'credits' | 'history' | 'showcase'>('details')
  const [savingProject, setSavingProject] = useState(false)

  // Artist Editor Modal
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null)
  const [originalArtistId, setOriginalArtistId] = useState<string | null>(null)
  const [savingArtist, setSavingArtist] = useState(false)

  // Quick Showcase Banner Editor Modal
  const [editingShowcaseProject, setEditingShowcaseProject] = useState<Project | null>(null)
  const [savingShowcase, setSavingShowcase] = useState(false)

  // Track Editor within Project Editor
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number | null>(null)

  // Toast notifier
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type })
    setTimeout(() => setToast(null), 4000)
  }

  // ─── BRUTE FORCE LOCKOUT CHECKER ───
  useEffect(() => {
    const checkLockout = () => {
      if (typeof window === 'undefined') return
      const lockoutUntil = parseInt(localStorage.getItem(LOCKOUT_KEY) || '0', 10)
      const now = Date.now()
      if (lockoutUntil > now) {
        setLockoutSecondsRemaining(Math.ceil((lockoutUntil - now) / 1000))
      } else {
        setLockoutSecondsRemaining(0)
        localStorage.removeItem(LOCKOUT_KEY)
      }
    }

    checkLockout()
    const timer = setInterval(checkLockout, 1000)
    return () => clearInterval(timer)
  }, [])

  // ─── ZERO-TRUST IDENTITY VALIDATION ───
  const validateZeroTrustUser = useCallback((candidateUser: User | null): boolean => {
    if (!candidateUser) return false
    const candidateEmail = candidateUser.email?.toLowerCase().trim() || ''
    const isAuthorized = AUTHORIZED_ADMIN_EMAILS.some(e => e.toLowerCase() === candidateEmail)
    if (!isAuthorized) {
      supabase.auth.signOut()
      setUser(null)
      setLoginError('Access Denied: Zero-Trust verification failed. Account is not an authorized administrator.')
      return false
    }
    return true
  }, [])

  // ─── AUTH SESSION VERIFICATION ───
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user && validateZeroTrustUser(session.user)) {
        setUser(session.user)
      } else {
        setUser(null)
      }
      setCheckingAuth(false)
    }

    checkSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && validateZeroTrustUser(session.user)) {
        setUser(session.user)
      } else {
        setUser(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [validateZeroTrustUser])

  // ─── SESSION INACTIVITY AUTO-LOGOUT WATCHDOG ───
  const lastActivityRef = useRef<number>(Date.now())
  useEffect(() => {
    if (!user) return

    const updateActivity = () => {
      lastActivityRef.current = Date.now()
    }

    const activityEvents = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click']
    activityEvents.forEach(ev => window.addEventListener(ev, updateActivity, { passive: true }))

    const inactivityCheck = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current
      if (idleTime >= INACTIVITY_TIMEOUT_MS) {
        supabase.auth.signOut()
        setUser(null)
        showToast('Session expired due to inactivity (Zero-Trust Security Policy).', 'error')
      }
    }, 15000)

    return () => {
      activityEvents.forEach(ev => window.removeEventListener(ev, updateActivity))
      clearInterval(inactivityCheck)
    }
  }, [user])

  // ─── LINK & SCHEDULING UTILITIES ───
  const copyPublicLink = (path: string) => {
    if (typeof window === 'undefined') return
    const fullUrl = `${window.location.origin}${path}`
    navigator.clipboard.writeText(fullUrl).then(() => {
      showToast(`Copied link to clipboard: ${fullUrl}`)
    }).catch(() => {
      showToast(`Public Link: ${fullUrl}`)
    })
  }

  const isFutureScheduled = (dateStr?: string) => {
    if (!dateStr) return false
    const time = new Date(dateStr).getTime()
    return !isNaN(time) && time > Date.now()
  }

  const formatScheduledDate = (dateStr?: string) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
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

  // ─── LOAD DATA (ALWAYS ORDERED LATEST TO OLDEST, INCLUDING SCHEDULED FOR ADMIN) ───
  const loadContent = useCallback(async () => {
    setLoadingData(true)
    const [newsRes, projRes, artistsRes] = await Promise.all([
      getLiveNews(true), // Admin can view and manage scheduled news
      getLiveProjects(true), // Admin can view and manage scheduled releases
      getLiveArtists(),
    ])

    if (newsRes.error || projRes.error || artistsRes.error) {
      showToast(`Database error: ${newsRes.error || projRes.error || artistsRes.error}`, 'error')
    }

    // Always enforce latest-to-oldest ordering
    setNewsList(sortNewsByDateDesc(newsRes.data))
    setProjectsList(sortProjectsByDateDesc(projRes.data))
    setArtistsList(artistsRes.data)
    setLoadingData(false)
  }, [])

  useEffect(() => {
    if (user) {
      loadContent()
    }
  }, [user, loadContent])

  // ─── LOGIN HANDLER WITH BRUTE-FORCE DEFENSE ───
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (lockoutSecondsRemaining > 0) return

    setLoginError('')
    setLoggingIn(true)

    const cleanEmail = email.trim().toLowerCase()
    if (!AUTHORIZED_ADMIN_EMAILS.some(a => a.toLowerCase() === cleanEmail)) {
      setLoginError('Access Denied: Unrecognized administrator credentials.')
      setLoggingIn(false)
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    if (error) {
      // Increment failed attempts
      const currentAttempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10) + 1
      localStorage.setItem(ATTEMPTS_KEY, currentAttempts.toString())

      if (currentAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS
        localStorage.setItem(LOCKOUT_KEY, lockoutUntil.toString())
        localStorage.removeItem(ATTEMPTS_KEY)
        setLockoutSecondsRemaining(Math.ceil(LOCKOUT_DURATION_MS / 1000))
        setLoginError(`Security Lockout: Too many failed login attempts. Locked for 15 minutes.`)
      } else {
        const remaining = MAX_FAILED_ATTEMPTS - currentAttempts
        setLoginError(`${error.message} (${remaining} attempt${remaining === 1 ? '' : 's'} remaining before lockout)`)
      }
    } else {
      localStorage.removeItem(ATTEMPTS_KEY)
      localStorage.removeItem(LOCKOUT_KEY)
      if (validateZeroTrustUser(data.user)) {
        setUser(data.user)
      }
    }
    setLoggingIn(false)
  }

  // ─── LOGOUT HANDLER ───
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // ─── SAVE NEWS ITEM (SUPPORTS EDITABLE ID) ───
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingNews) return

    setSavingNews(true)

    // Clean any old self-referencing links
    const cleanedNews: NewsItem = {
      ...editingNews,
      url: editingNews.url === 'https://ss7-ofc.vercel.app' ? undefined : (editingNews.url || undefined)
    }

    // If ID was modified, delete the old ID record first
    if (originalNewsId && originalNewsId !== cleanedNews.id) {
      await deleteNewsItem(originalNewsId)
    }

    const { error } = await saveNewsItem(cleanedNews)
    if (error) {
      showToast(`Failed to save: ${error.message}`, 'error')
    } else {
      showToast('Article published to Supabase!')
      setEditingNews(null)
      setOriginalNewsId(null)
      loadContent()
    }
    setSavingNews(false)
  }

  // ─── DELETE NEWS ITEM ───
  const handleDeleteNews = async (id: string, headline: string) => {
    if (!confirm(`Permanently delete "${headline}" from database?`)) return

    const { error } = await deleteNewsItem(id)
    if (error) {
      showToast(`Failed to delete: ${error.message}`, 'error')
    } else {
      showToast('Article deleted from Supabase.')
      loadContent()
    }
  }

  // ─── SAVE PROJECT (SUPPORTS EDITABLE ID & BANNER CONTENT) ───
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProject) return

    setSavingProject(true)

    // If ID was modified, delete the old ID record first
    if (originalProjectId && originalProjectId !== editingProject.id) {
      await deleteProject(originalProjectId)
    }

    const { error } = await saveProject(editingProject)
    if (error) {
      showToast(`Failed to save project: ${error.message}`, 'error')
    } else {
      showToast(`"${editingProject.title}" saved to Supabase!`)
      setEditingProject(null)
      setOriginalProjectId(null)
      loadContent()
    }
    setSavingProject(false)
  }

  // ─── SAVE ARTIST (SUPPORTS EDITABLE ID) ───
  const handleSaveArtist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingArtist) return

    setSavingArtist(true)

    // If ID was modified, delete old record
    if (originalArtistId && originalArtistId !== editingArtist.id) {
      await deleteArtist(originalArtistId)
    }

    const { error } = await saveArtist(editingArtist)
    if (error) {
      showToast(`Failed to save artist: ${error.message}`, 'error')
    } else {
      showToast(`Artist "${editingArtist.name}" saved to Supabase!`)
      setEditingArtist(null)
      setOriginalArtistId(null)
      loadContent()
    }
    setSavingArtist(false)
  }

  // ─── DELETE ARTIST ───
  const handleDeleteArtist = async (id: string, name: string) => {
    if (!confirm(`Permanently delete creator "${name}"?`)) return
    const { error } = await deleteArtist(id)
    if (error) {
      showToast(`Failed to delete artist: ${error.message}`, 'error')
    } else {
      showToast(`Artist "${name}" deleted.`)
      loadContent()
    }
  }

  // ─── SHOWCASE ORDERING & REORDERING ───
  // Active showcase projects sorted strictly by showcaseOrder ascending
  const activeShowcase = projectsList
    .filter(p => p.featured)
    .sort((a, b) => (a.showcaseOrder ?? 999) - (b.showcaseOrder ?? 999))

  const handleMoveShowcase = async (project: Project, direction: 'up' | 'down') => {
    const currentIndex = activeShowcase.findIndex(p => p.id === project.id)
    if (currentIndex === -1) return
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= activeShowcase.length) return

    const targetProject = activeShowcase[targetIndex]
    const currentSlot = currentIndex + 1
    const targetSlot = targetIndex + 1

    await Promise.all([
      saveProject({ ...project, showcaseOrder: targetSlot, featured: true }),
      saveProject({ ...targetProject, showcaseOrder: currentSlot, featured: true }),
    ])

    showToast(`Reordered banner: "${project.title}" is now Slide #${targetSlot}`)
    loadContent()
  }

  const handleToggleShowcase = async (project: Project) => {
    const isNowFeatured = !project.featured
    const nextOrder = isNowFeatured ? activeShowcase.length + 1 : 999
    const updated = { ...project, featured: isNowFeatured, showcaseOrder: nextOrder }
    const { error } = await saveProject(updated)
    if (error) {
      showToast(`Failed to update showcase: ${error.message}`, 'error')
    } else {
      showToast(`${project.title} ${isNowFeatured ? 'added to' : 'removed from'} Homescreen Showcase!`)
      loadContent()
    }
  }

  const handleSaveShowcaseBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingShowcaseProject) return
    setSavingShowcase(true)
    const { error } = await saveProject(editingShowcaseProject)
    if (error) {
      showToast(`Failed to save banner: ${error.message}`, 'error')
    } else {
      showToast(`Banner content for "${editingShowcaseProject.title}" updated!`)
      setEditingShowcaseProject(null)
      loadContent()
    }
    setSavingShowcase(false)
  }

  // ─── TRACK REORDERING HELPERS ───
  const moveTrackUp = (index: number) => {
    if (index <= 0 || !editingProject) return
    const newTracks = [...editingProject.tracks]
    const temp = newTracks[index - 1]
    newTracks[index - 1] = newTracks[index]
    newTracks[index] = temp
    setEditingProject({ ...editingProject, tracks: newTracks })
    setSelectedTrackIndex(index - 1)
  }

  const moveTrackDown = (index: number) => {
    if (!editingProject || index >= editingProject.tracks.length - 1) return
    const newTracks = [...editingProject.tracks]
    const temp = newTracks[index + 1]
    newTracks[index + 1] = newTracks[index]
    newTracks[index] = temp
    setEditingProject({ ...editingProject, tracks: newTracks })
    setSelectedTrackIndex(index + 1)
  }

  const handleAddTrack = () => {
    if (!editingProject) return
    const newTrack: Track = {
      title: `New Track ${editingProject.tracks.length + 1}`,
      badges: [],
      content: ''
    }
    setEditingProject({
      ...editingProject,
      tracks: [...editingProject.tracks, newTrack]
    })
    setSelectedTrackIndex(editingProject.tracks.length)
  }

  const handleDeleteTrack = (idx: number) => {
    if (!editingProject) return
    const updated = [...editingProject.tracks]
    updated.splice(idx, 1)
    setEditingProject({ ...editingProject, tracks: updated })
    if (selectedTrackIndex === idx) setSelectedTrackIndex(null)
  }

  // ─── COLOR PALETTE GENERATOR ───
  const handleAutoColor = () => {
    if (!editingProject) return
    const chosen = PRESET_PALETTES[Math.floor(Math.random() * PRESET_PALETTES.length)]
    setEditingProject({
      ...editingProject,
      accentColor: chosen.accent,
      accentSoft: chosen.soft,
    })
    showToast(`Applied ${chosen.name} studio palette!`)
  }

  // ─── ADD CHAPTER HELPER ───
  const handleAddHistorySection = () => {
    if (!editingProject) return
    const newSection: HistorySection = {
      heading: 'Chapter Title',
      body: 'Write the lore or production history for this release...'
    }
    setEditingProject({
      ...editingProject,
      history: [...editingProject.history, newSection]
    })
  }

  // ─── APPLY PROJECT CREDITS TO ALL TRACKS HELPER ───
  const handleApplyCreditsToTracks = () => {
    if (!editingProject) return
    const pc = editingProject.credits || getDefaultProjectCredits(editingProject)
    const updatedTracks = editingProject.tracks.map(t => {
      const defaultForTrack = getDefaultTrackCredits(t.title, pc)
      return {
        ...t,
        credits: {
          writtenBy: pc.writtenBy || 'VEN',
          producedBy: pc.producedBy || 'VEN',
          featuredArtists: t.credits?.featuredArtists || defaultForTrack.featuredArtists,
          additionalCredits: t.credits?.additionalCredits || defaultForTrack.additionalCredits,
        }
      }
    })
    setEditingProject({ ...editingProject, tracks: updatedTracks })
    showToast(`Applied studio credits across all ${updatedTracks.length} tracks!`)
  }

  // ─── FILTERED LISTS (ALL ORDERED LATEST TO OLDEST) ───
  const filteredNews = newsList.filter(n =>
    n.headline.toLowerCase().includes(newsSearch.toLowerCase()) ||
    (n.projectId && n.projectId.toLowerCase().includes(newsSearch.toLowerCase()))
  )

  const filteredProjects = projectsList.filter(p =>
    p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.releaseLabel.toLowerCase().includes(projectSearch.toLowerCase())
  )

  const filteredArtists = artistsList.filter(a =>
    a.name.toLowerCase().includes(artistSearch.toLowerCase()) ||
    a.id.toLowerCase().includes(artistSearch.toLowerCase())
  )

  // ─── LOADING SCREEN ───
  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', color: 'var(--text-main)' }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Verifying zero-trust credentials...</div>
      </div>
    )
  }

  // ─── LOGIN SCREEN (ZERO-TRUST HARDENED) ───
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 20 }}>
        <div
          className="material-card"
          style={{
            width: '100%',
            maxWidth: 420,
            padding: '42px 34px',
            borderRadius: 34,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            boxShadow: 'var(--elevation-3)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--bg-surface-variant)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: 'var(--text-main)'
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              System Access
            </h1>
          </div>

          {lockoutSecondsRemaining > 0 ? (
            <div style={{
              padding: '16px 20px',
              borderRadius: 20,
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              textAlign: 'center',
              color: '#ef4444',
              fontSize: 13,
              lineHeight: 1.5
            }}>
              <strong>Brute-Force Lockout Active</strong><br />
              Too many consecutive failed attempts. Please wait {Math.floor(lockoutSecondsRemaining / 60)}m {lockoutSecondsRemaining % 60}s before retrying.
            </div>
          ) : (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {loginError && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 16,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontSize: 12.5,
                  lineHeight: 1.45
                }}>
                  {loginError}
                </div>
              )}

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Administrator Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@studioseven.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="material-input"
                  style={{ width: '100%', padding: '12px 18px', borderRadius: 999 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Master Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="material-input"
                  style={{ width: '100%', padding: '12px 18px', borderRadius: 999 }}
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn || lockoutSecondsRemaining > 0}
                className="material-btn material-pill"
                style={{
                  background: 'var(--text-main)',
                  color: 'var(--bg-base)',
                  borderColor: 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: 13.5,
                  padding: '12px 24px',
                  marginTop: 6,
                  width: '100%'
                }}
              >
                {loggingIn ? 'Authenticating...' : 'Sign In to Portal'}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-faint)', lineHeight: 1.5 }}>
            Restricted access. Unauthorized connection attempts are logged with IP & timestamp.
          </div>
        </div>
      </div>
    )
  }

  // ─── AUTHENTICATED ADMIN PORTAL ───
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>

      {/* Floating Status Toast */}
      {toast && (
        <div
          className="material-card"
          style={{
            position: 'fixed',
            top: 24,
            right: 28,
            zIndex: 9999,
            padding: '12px 22px',
            borderRadius: 999,
            background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 600,
            boxShadow: 'var(--elevation-3)'
          }}
        >
          {toast.text}
        </div>
      )}

      {/* Fixed Admin Header */}
      <header className="navbar-wrapper">
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <img src={LOGO_URL} alt="Logo" style={{ height: 26, width: 'auto' }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(34, 197, 94, 0.12)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            padding: '3px 9px',
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 700,
            color: '#4ade80',
            letterSpacing: '0.04em'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
            <span>ADMIN CONSOLE</span>
          </div>
        </div>

        {/* Central Segmented Pill Dock */}
        <div className="nav-dock desktop-only" style={{ borderRadius: 999 }}>
          <button
            onClick={() => setActiveTab('news')}
            className={`material-btn material-pill-sm ${activeTab === 'news' ? 'active' : ''}`}
          >
            Newsroom ({newsList.length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`material-btn material-pill-sm ${activeTab === 'projects' ? 'active' : ''}`}
          >
            Releases ({projectsList.length})
          </button>
          <button
            onClick={() => setActiveTab('showcase')}
            className={`material-btn material-pill-sm ${activeTab === 'showcase' ? 'active' : ''}`}
          >
            Showcase ({activeShowcase.length})
          </button>
          <button
            onClick={() => setActiveTab('artists')}
            className={`material-btn material-pill-sm ${activeTab === 'artists' ? 'active' : ''}`}
          >
            Artists ({artistsList.length})
          </button>
        </div>

        {/* User Badge & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span className="desktop-only" style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
            {user.email}
          </span>
          <Link
            href="/"
            target="_blank"
            className="material-btn material-pill-sm desktop-only"
            style={{ fontSize: 12, textDecoration: 'none' }}
          >
            View Site ↗
          </Link>
          <button
            onClick={handleLogout}
            className="material-btn material-pill-sm"
            style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.35)', fontSize: 12 }}
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Spacer below fixed navbar */}
      <div className="navbar-spacer" />

      {/* Mobile Tab Switcher */}
      <div className="mobile-only" style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <div className="nav-dock" style={{ width: '100%', justifyContent: 'center', flexWrap: 'wrap', gap: 4 }}>
          <button onClick={() => setActiveTab('news')} className={`material-btn material-pill-sm ${activeTab === 'news' ? 'active' : ''}`}>News</button>
          <button onClick={() => setActiveTab('projects')} className={`material-btn material-pill-sm ${activeTab === 'projects' ? 'active' : ''}`}>Releases</button>
          <button onClick={() => setActiveTab('showcase')} className={`material-btn material-pill-sm ${activeTab === 'showcase' ? 'active' : ''}`}>Showcase</button>
          <button onClick={() => setActiveTab('artists')} className={`material-btn material-pill-sm ${activeTab === 'artists' ? 'active' : ''}`}>Artists</button>
        </div>
      </div>

      {/* Main Container */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 32px 96px 32px', width: '100%' }}>

        {/* ═══════════════ TAB 1: NEWSROOM ═══════════════ */}
        {activeTab === 'news' && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 className="section-title">Newsroom Articles</h1>
              </div>

              <button
                onClick={() => {
                  const newId = `news-${Date.now()}`
                  setOriginalNewsId(null)
                  setEditingNews({
                    id: newId,
                    headline: '',
                    preview: '',
                    body: '',
                    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                    projectId: projectsList[0]?.id || '',
                    url: ''
                  })
                }}
                className="material-btn material-pill"
                style={{
                  background: 'var(--text-main)',
                  color: 'var(--bg-base)',
                  borderColor: 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: 13.5,
                  padding: '9px 20px',
                  gap: 8
                }}
              >
                <span>+ Write New Article</span>
              </button>
            </div>

            {/* Search Filter Bar */}
            <div style={{ width: '100%', position: 'relative' }}>
              <input
                type="text"
                placeholder="Search articles by headline or project..."
                value={newsSearch}
                onChange={e => setNewsSearch(e.target.value)}
                className="material-input"
                style={{ width: '100%', height: 46, borderRadius: 999, padding: '0 24px', fontSize: 13.5 }}
              />
            </div>

            {/* Grid of News Cards */}
            {loadingData ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading articles...</div>
            ) : filteredNews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-faint)' }}>No articles match your search.</div>
            ) : (
              <div className="grid-3">
                {filteredNews.map(item => {
                  const project = projectsList.find(p => p.id === item.projectId)
                  const imgUrl = item.image ? getCoverUrl(item.image) : (project ? getCoverUrl(project.coverFile) : '')

                  return (
                    <div
                      key={item.id}
                      className="material-card"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: 20,
                        height: '100%',
                        borderRadius: 30,
                        position: 'relative'
                      }}
                    >
                      {/* Image Preview */}
                      <div style={{
                        width: '100%',
                        aspectRatio: '16/9',
                        borderRadius: 22,
                        overflow: 'hidden',
                        backgroundColor: 'var(--bg-surface-solid)',
                        marginBottom: 16,
                        border: '1px solid var(--border-subtle)',
                        position: 'relative'
                      }}>
                        {imgUrl ? (
                          <img src={imgUrl} alt={item.headline} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: 12 }}>
                            No Cover Media
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {item.date} {item.projectId ? `• ${item.projectId}` : ''}
                          </span>
                          {isFutureScheduled(item.scheduledAt) && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '2px 8px',
                              borderRadius: 99,
                              background: 'rgba(56, 189, 248, 0.15)',
                              border: '1px solid rgba(56, 189, 248, 0.4)',
                              color: '#38bdf8',
                              fontSize: 10.5,
                              fontWeight: 700
                            }}>
                              <span>🕒 Scheduled</span>
                            </span>
                          )}
                        </div>

                        {isFutureScheduled(item.scheduledAt) && (
                          <div style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600 }}>
                            Goes live: {formatScheduledDate(item.scheduledAt)}
                          </div>
                        )}

                        <h3 style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.35, letterSpacing: '-0.02em' }}>
                          {item.headline}
                        </h3>

                        <p style={{
                          fontSize: 12.5,
                          color: 'var(--text-muted)',
                          lineHeight: 1.5,
                          marginTop: 4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {item.body}
                        </p>

                        {/* Admin Action Buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto', paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 6 }}>
                            <button
                              onClick={() => {
                                setOriginalNewsId(item.id)
                                setEditingNews({ ...item })
                              }}
                              className="material-btn material-pill-sm"
                              style={{ fontWeight: 700, fontSize: 12, padding: '7px 14px', width: '100%', whiteSpace: 'nowrap' }}
                            >
                              Edit Article
                            </button>
                            <button
                              onClick={() => handleDeleteNews(item.id, item.headline)}
                              className="material-btn material-pill-sm"
                              style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', fontSize: 11.5, padding: '7px 12px', whiteSpace: 'nowrap' }}
                            >
                              Delete
                            </button>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => copyPublicLink(`/news/${item.id}`)}
                              className="material-btn material-pill-sm"
                              style={{ fontSize: 11.5, padding: '6px 10px', width: '100%', whiteSpace: 'nowrap' }}
                              title="Copy Public Link"
                            >
                              📋 Link
                            </button>
                            <Link
                              href={`/news/${item.id}`}
                              target="_blank"
                              className="material-btn material-pill-sm"
                              style={{ textDecoration: 'none', fontSize: 11.5, padding: '6px 10px', width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}
                              title="Preview Public Page"
                            >
                              View ↗
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ TAB 2: RELEASES & SONGS ═══════════════ */}
        {activeTab === 'projects' && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 className="section-title">Releases & Songs</h1>
              </div>

              <button
                onClick={() => {
                  const newId = `project-${Date.now()}`
                  const defaultCreds = getDefaultProjectCredits({ id: newId, artistId: artistsList[0]?.id || 'ven' })
                  setOriginalProjectId(null)
                  setEditingProject({
                    id: newId,
                    title: '',
                    subtitle: '',
                    description: '',
                    releasedAt: new Date().toISOString().split('T')[0],
                    releaseLabel: `Released ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
                    artistId: artistsList[0]?.id || 'ven',
                    coverFile: '',
                    accentColor: '#38bdf8',
                    accentSoft: 'rgba(56, 189, 248, 0.40)',
                    tracks: [],
                    history: [],
                    featured: false,
                    type: 'project',
                    credits: defaultCreds
                  })
                  setProjectEditorTab('details')
                  setSelectedTrackIndex(null)
                }}
                className="material-btn material-pill"
                style={{
                  background: 'var(--text-main)',
                  color: 'var(--bg-base)',
                  borderColor: 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: 13.5,
                  padding: '9px 20px',
                  gap: 8
                }}
              >
                <span>+ Add New Release</span>
              </button>
            </div>

            {/* Search Filter Bar */}
            <div style={{ width: '100%', position: 'relative' }}>
              <input
                type="text"
                placeholder="Search releases by title or label..."
                value={projectSearch}
                onChange={e => setProjectSearch(e.target.value)}
                className="material-input"
                style={{ width: '100%', height: 46, borderRadius: 999, padding: '0 24px', fontSize: 13.5 }}
              />
            </div>

            {/* Grid of Project Cards */}
            <div className="grid-4">
              {filteredProjects.map(project => {
                const coverUrl = getCoverUrl(project.coverFile)
                const accent = project.accentColor || '#38bdf8'

                return (
                  <div
                    key={project.id}
                    className="material-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: 18,
                      borderRadius: 30,
                      background: `linear-gradient(165deg, ${accent}25 0%, var(--bg-surface) 60%)`,
                      border: `1px solid ${accent}45`,
                      position: 'relative'
                    }}
                  >
                    {/* Cover Art */}
                    <div style={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: 22,
                      overflow: 'hidden',
                      backgroundColor: 'var(--bg-surface-solid)',
                      marginBottom: 14,
                      border: `1px solid ${accent}35`,
                      position: 'relative'
                    }}>
                      {coverUrl && <img src={coverUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}

                      {project.featured && (
                        <div style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          background: 'rgba(0, 0, 0, 0.75)',
                          border: '1px solid #facc15',
                          borderRadius: 999,
                          padding: '3px 8px',
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: '#facc15',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          <span>⭐</span> <span>Slide #{project.showcaseOrder ?? 1}</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                          {project.releaseLabel}
                        </span>
                        {isFutureScheduled(project.scheduledAt) && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '2px 8px',
                            borderRadius: 99,
                            background: 'rgba(56, 189, 248, 0.15)',
                            border: '1px solid rgba(56, 189, 248, 0.4)',
                            color: '#38bdf8',
                            fontSize: 10.5,
                            fontWeight: 700
                          }}>
                            <span>🕒 Scheduled</span>
                          </span>
                        )}
                      </div>

                      {isFutureScheduled(project.scheduledAt) && (
                        <div style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600 }}>
                          Goes live: {formatScheduledDate(project.scheduledAt)}
                        </div>
                      )}

                      <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                        {project.title}
                      </h3>
                      <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                        {project.tracks.length} Tracks · {project.artistId.toUpperCase()}
                      </span>

                      {/* Action Pills */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto', paddingTop: 14 }}>
                        <button
                          type="button"
                          onClick={() => {
                            setOriginalProjectId(project.id)
                            setEditingProject({
                              ...project,
                              credits: project.credits || getDefaultProjectCredits(project)
                            })
                            setProjectEditorTab('details')
                            setSelectedTrackIndex(null)
                          }}
                          className="material-btn material-pill-sm"
                          style={{
                            width: '100%',
                            fontWeight: 700,
                            fontSize: 12,
                            padding: '7px 12px',
                            background: 'var(--text-main)',
                            color: 'var(--bg-base)',
                            borderColor: 'var(--text-main)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Edit Details & Songs
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => copyPublicLink(`/projects/${project.id}`)}
                            className="material-btn material-pill-sm"
                            style={{ fontSize: 11.5, padding: '5px 8px', width: '100%', whiteSpace: 'nowrap' }}
                            title="Copy Public Link (works once published, or redirects to 404 countdown if scheduled)"
                          >
                            📋 Link
                          </button>
                          <Link
                            href={`/projects/${project.id}`}
                            target="_blank"
                            className="material-btn material-pill-sm"
                            style={{ textDecoration: 'none', fontSize: 11.5, padding: '5px 8px', width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}
                            title="Preview Public Page"
                          >
                            View ↗
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ═══════════════ TAB 3: HOMESCREEN HERO SHOWCASE ═══════════════ */}
        {activeTab === 'showcase' && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 940 }}>
            <div>
              <h1 className="section-title">Homescreen Hero Showcase</h1>
            </div>

            {/* Active Showcase Banner Slides in Order */}
            <div className="material-card" style={{ padding: 28, borderRadius: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 17, fontWeight: 700 }}>Active Hero Banner Rotation</h3>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {activeShowcase.length} Active Slides
                </span>
              </div>

              {activeShowcase.length === 0 ? (
                <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No projects are currently selected for the hero banner. Add releases below to showcase them.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {activeShowcase.map((project, idx) => {
                    const cover = getCoverUrl(project.coverFile)
                    const slotNum = idx + 1

                    return (
                      <div
                        key={project.id}
                        style={{
                          padding: '18px 22px',
                          borderRadius: 24,
                          background: 'var(--bg-surface-variant)',
                          border: '1px solid #38bdf8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 16
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0, flex: 1 }}>
                          {/* Slot Badge */}
                          <div style={{
                            padding: '4px 10px',
                            borderRadius: 99,
                            background: '#38bdf8',
                            color: '#000000',
                            fontSize: 12,
                            fontWeight: 800,
                            flexShrink: 0
                          }}>
                            Slot #{slotNum} {slotNum === 1 ? '(Lead)' : ''}
                          </div>

                          <div style={{ width: 50, height: 50, borderRadius: 14, overflow: 'hidden', backgroundColor: 'var(--bg-surface-solid)', flexShrink: 0 }}>
                            {cover && <img src={cover} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                          </div>

                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>{project.title}</h4>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                • {project.showcaseLabel || project.releaseLabel}
                              </span>
                            </div>
                            <p style={{
                              fontSize: 12.5,
                              color: 'var(--text-muted)',
                              marginTop: 3,
                              lineHeight: 1.45,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {project.description || 'No custom banner description provided.'}
                            </p>
                          </div>
                        </div>

                        {/* Actions: Reorder & Customize */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() => handleMoveShowcase(project, 'up')}
                            disabled={idx === 0}
                            className="material-btn material-pill-sm"
                            style={{ fontSize: 13, padding: '5px 12px', opacity: idx === 0 ? 0.35 : 1 }}
                            title="Move Up in Rotation"
                          >
                            ▲ Up
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveShowcase(project, 'down')}
                            disabled={idx === activeShowcase.length - 1}
                            className="material-btn material-pill-sm"
                            style={{ fontSize: 13, padding: '5px 12px', opacity: idx === activeShowcase.length - 1 ? 0.35 : 1 }}
                            title="Move Down in Rotation"
                          >
                            ▼ Down
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingShowcaseProject({ ...project })}
                            className="material-btn material-pill-sm"
                            style={{ fontWeight: 700, fontSize: 12.5 }}
                          >
                            Customize Banner Copy
                          </button>
                          <button
                            type="button"
                            onClick={() => copyPublicLink(`/projects/${project.id}`)}
                            className="material-btn material-pill-sm"
                            style={{ fontSize: 12.5 }}
                            title="Copy Public Link"
                          >
                            📋 Link
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleShowcase(project)}
                            className="material-btn material-pill-sm"
                            style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', fontSize: 12.5 }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Available Projects to Add to Showcase */}
            <div className="material-card" style={{ padding: 28, borderRadius: 32, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700 }}>Available Releases to Add to Banner</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {projectsList.filter(p => !p.featured).map(project => {
                  const cover = getCoverUrl(project.coverFile)
                  return (
                    <div
                      key={project.id}
                      style={{
                        padding: '14px 18px',
                        borderRadius: 20,
                        background: 'var(--bg-surface-variant)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, overflow: 'hidden', backgroundColor: 'var(--bg-surface-solid)', flexShrink: 0 }}>
                          {cover && <img src={cover} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>{project.title}</h4>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{project.releaseLabel}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleShowcase(project)}
                        className="material-btn material-pill-sm"
                        style={{ fontWeight: 700, fontSize: 12.5 }}
                      >
                        + Add to Banner
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ TAB 4: ARTISTS & COLLECTIVE ═══════════════ */}
        {activeTab === 'artists' && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 className="section-title">Artists & Collective</h1>
              </div>

              <button
                onClick={() => {
                  const newId = `artist-${Date.now()}`
                  setOriginalArtistId(null)
                  setEditingArtist({
                    id: newId,
                    name: '',
                    image: '',
                    bio: '',
                    spotifyUrl: '',
                    youtubeUrl: ''
                  })
                }}
                className="material-btn material-pill"
                style={{
                  background: 'var(--text-main)',
                  color: 'var(--bg-base)',
                  borderColor: 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: 13.5,
                  padding: '9px 20px',
                  gap: 8
                }}
              >
                <span>+ Add New Artist</span>
              </button>
            </div>

            {/* Search Filter Bar */}
            <div style={{ width: '100%', position: 'relative' }}>
              <input
                type="text"
                placeholder="Search artists by name or ID..."
                value={artistSearch}
                onChange={e => setArtistSearch(e.target.value)}
                className="material-input"
                style={{ width: '100%', height: 46, borderRadius: 999, padding: '0 24px', fontSize: 13.5 }}
              />
            </div>

            {/* Grid of Artist Cards */}
            <div className="grid-3">
              {filteredArtists.map(artist => {
                const imgUrl = getCoverUrl(artist.image)
                const artistProjects = projectsList.filter(p => p.artistId === artist.id)

                return (
                  <div
                    key={artist.id}
                    className="material-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      padding: '32px 24px',
                      borderRadius: 30,
                      gap: 16
                    }}
                  >
                    <div style={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '2px solid var(--border-default)',
                      backgroundColor: 'var(--bg-surface-solid)'
                    }}>
                      {imgUrl ? (
                        <img src={imgUrl} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)' }}>
                          No Avatar
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>{artist.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        ID: <code style={{ color: '#38bdf8' }}>{artist.id}</code> · {artistProjects.length} Releases
                      </span>
                    </div>

                    {artist.bio && (
                      <p style={{
                        fontSize: 12.5,
                        color: 'var(--text-muted)',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {artist.bio}
                      </p>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 6, marginTop: 'auto', paddingTop: 14, width: '100%' }}>
                      <button
                        onClick={() => {
                          setOriginalArtistId(artist.id)
                          setEditingArtist({ ...artist })
                        }}
                        className="material-btn material-pill-sm"
                        style={{ fontWeight: 700, fontSize: 12, padding: '7px 12px', whiteSpace: 'nowrap' }}
                      >
                        Edit Artist
                      </button>
                      <Link
                        href={`/artists/${artist.id}`}
                        target="_blank"
                        className="material-btn material-pill-sm"
                        style={{ textDecoration: 'none', fontSize: 11.5, padding: '6px 12px', whiteSpace: 'nowrap' }}
                        title="View Public Profile"
                      >
                        View ↗
                      </Link>
                      <button
                        onClick={() => handleDeleteArtist(artist.id, artist.name)}
                        className="material-btn material-pill-sm"
                        style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', fontSize: 11.5, padding: '6px 12px', whiteSpace: 'nowrap' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}


      </main>

      {/* ═══════════════ MODAL: NEWS ARTICLE EDITOR ═══════════════ */}
      {editingNews && (
        <div className="modal-overlay" onClick={() => setEditingNews(null)}>
          <div
            className="modal-container"
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 720, padding: 32, borderRadius: 32, backgroundColor: 'var(--bg-surface-solid)', display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800 }}>
                  {originalNewsId ? 'Edit Article' : 'Write New Article'}
                </h3>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  ID: {editingNews.id}
                </span>
              </div>
              <button
                onClick={() => setEditingNews(null)}
                className="material-btn"
                style={{ width: 34, height: 34, borderRadius: '50%', fontSize: 14 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNews} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Editable Slug / ID */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Article Slug / ID *
                </label>
                <input
                  type="text"
                  required
                  value={editingNews.id}
                  onChange={e => setEditingNews({ ...editingNews, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                  className="material-input"
                  style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                  placeholder="e.g. saccharin-premiere"
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Headline *</label>
                <input
                  type="text"
                  required
                  value={editingNews.headline}
                  onChange={e => setEditingNews({ ...editingNews, headline: e.target.value })}
                  className="material-input"
                  style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                  placeholder="Catchy headline..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    📅 Publication Date (Interactive Calendar) *
                  </label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="date"
                      value={toDateInputValue(editingNews.date)}
                      onChange={e => {
                        const val = e.target.value
                        if (val) {
                          setEditingNews({ ...editingNews, date: formatDateFromInput(val) })
                        }
                      }}
                      className="material-input"
                      style={{ width: 140, padding: '10px 12px', borderRadius: 999, colorScheme: 'dark', cursor: 'pointer' }}
                      title="Open Calendar to select date"
                    />
                    <input
                      type="text"
                      required
                      value={editingNews.date}
                      onChange={e => setEditingNews({ ...editingNews, date: e.target.value })}
                      className="material-input"
                      style={{ flex: 1, padding: '10px 16px', borderRadius: 999 }}
                      placeholder="e.g. October 8, 2026"
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Associated Project</label>
                  <select
                    value={editingNews.projectId || ''}
                    onChange={e => setEditingNews({ ...editingNews, projectId: e.target.value || undefined })}
                    className="material-input"
                    style={{ width: '100%', height: 42, padding: '0 16px', borderRadius: 999 }}
                  >
                    <option value="" style={{ background: 'var(--bg-surface)' }}>None / General Studio News</option>
                    {projectsList.map(p => (
                      <option key={p.id} value={p.id} style={{ background: 'var(--bg-surface)' }}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Schedule Article for Future Release */}
              <div style={{
                padding: '16px 20px',
                borderRadius: 22,
                background: editingNews.scheduledAt ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-surface-variant)',
                border: editingNews.scheduledAt ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>🕒</span>
                    <div>
                      <h4 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-main)' }}>
                        Schedule Publication for Future Date & Time (Optional)
                      </h4>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (editingNews.scheduledAt) {
                        setEditingNews({ ...editingNews, scheduledAt: undefined })
                      } else {
                        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
                        setEditingNews({ ...editingNews, scheduledAt: tomorrow.toISOString() })
                      }
                    }}
                    className={`material-btn material-pill-sm ${editingNews.scheduledAt ? 'active' : ''}`}
                    style={{ fontSize: 12, fontWeight: 700 }}
                  >
                    {editingNews.scheduledAt ? '✕ Remove Schedule (Publish Now)' : '+ Schedule Future Date (Optional)'}
                  </button>
                </div>

                {editingNews.scheduledAt && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>
                        📅 Pick Calendar Date & Time (Your Local Timezone)
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={toDatetimeLocalValue(editingNews.scheduledAt)}
                        onChange={e => {
                          const val = e.target.value
                          if (val) {
                            setEditingNews({ ...editingNews, scheduledAt: new Date(val).toISOString() })
                          }
                        }}
                        className="material-input"
                        style={{ width: '100%', padding: '10px 18px', borderRadius: 999, colorScheme: 'dark', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--bg-surface)',
                      padding: '12px 16px',
                      borderRadius: 18,
                      fontSize: 12.5,
                      gap: 12,
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                        Future Public Link: <strong style={{ color: '#38bdf8' }}>/news/{editingNews.id}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyPublicLink(`/news/${editingNews.id}`)}
                        className="material-btn material-pill-sm"
                        style={{ fontSize: 12, fontWeight: 700, padding: '5px 14px', flexShrink: 0 }}
                      >
                        📋 Copy Link
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Cover Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={editingNews.image || ''}
                  onChange={e => setEditingNews({ ...editingNews, image: e.target.value })}
                  className="material-input"
                  style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                  placeholder="https://drive.google.com/... or leave blank to inherit project cover"
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  External Media / Source URL (Optional)
                </label>
                <input
                  type="text"
                  value={editingNews.url || ''}
                  onChange={e => setEditingNews({ ...editingNews, url: e.target.value })}
                  className="material-input"
                  style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                  placeholder="e.g. YouTube video, Spotify link, Billboard article. Leave blank for studio news."
                />
                <span style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4, display: 'block' }}>
                  Leave blank for internal studio news which already has its own dedicated page at <code>/news/[id]</code>.
                </span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Article Body Text *</label>
                <textarea
                  required
                  rows={8}
                  value={editingNews.body}
                  onChange={e => setEditingNews({ ...editingNews, body: e.target.value })}
                  className="material-input"
                  style={{ width: '100%', borderRadius: 20, padding: '14px 18px', lineHeight: 1.6 }}
                  placeholder="Write the full news story..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditingNews(null)}
                  className="material-btn material-pill"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNews}
                  className="material-btn material-pill"
                  style={{ background: 'var(--text-main)', color: 'var(--bg-base)', fontWeight: 700 }}
                >
                  {savingNews ? 'Publishing...' : 'Save & Publish to Supabase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ MODAL: RELEASE & SONGS MASTER EDITOR ═══════════════ */}
      {editingProject && (
        <div className="modal-overlay" onClick={() => setEditingProject(null)}>
          <div
            className="modal-container"
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 860, padding: 34, borderRadius: 34, backgroundColor: 'var(--bg-surface-solid)', display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800 }}>
                  Release Master: {editingProject.title || 'New Release'}
                </h3>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  ID: {editingProject.id}
                </span>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="material-btn"
                style={{ width: 34, height: 34, borderRadius: '50%', fontSize: 14 }}
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="nav-dock" style={{ borderRadius: 999, width: 'fit-content' }}>
              <button
                type="button"
                onClick={() => setProjectEditorTab('details')}
                className={`material-btn material-pill-sm ${projectEditorTab === 'details' ? 'active' : ''}`}
              >
                Details
              </button>
              <button
                type="button"
                onClick={() => setProjectEditorTab('links')}
                className={`material-btn material-pill-sm ${projectEditorTab === 'links' ? 'active' : ''}`}
              >
                Media & Colors
              </button>
              <button
                type="button"
                onClick={() => setProjectEditorTab('tracks')}
                className={`material-btn material-pill-sm ${projectEditorTab === 'tracks' ? 'active' : ''}`}
              >
                Tracks & Songs ({editingProject.tracks.length})
              </button>
              <button
                type="button"
                onClick={() => setProjectEditorTab('credits')}
                className={`material-btn material-pill-sm ${projectEditorTab === 'credits' ? 'active' : ''}`}
              >
                Credits & Personnel
              </button>
              <button
                type="button"
                onClick={() => setProjectEditorTab('history')}
                className={`material-btn material-pill-sm ${projectEditorTab === 'history' ? 'active' : ''}`}
              >
                Lore & History ({editingProject.history.length})
              </button>
              <button
                type="button"
                onClick={() => setProjectEditorTab('showcase')}
                className={`material-btn material-pill-sm ${projectEditorTab === 'showcase' ? 'active' : ''}`}
              >
                Homescreen
              </button>
            </div>

            <form onSubmit={handleSaveProject} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* SUB-TAB: DETAILS */}
              {projectEditorTab === 'details' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Editable Project ID */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      Project Slug / ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject.id}
                      onChange={e => setEditingProject({ ...editingProject, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                      className="material-input"
                      style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                      placeholder="e.g. saccharin"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Title *</label>
                      <input
                        type="text"
                        required
                        value={editingProject.title}
                        onChange={e => setEditingProject({ ...editingProject, title: e.target.value })}
                        className="material-input"
                        style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Subtitle</label>
                      <input
                        type="text"
                        value={editingProject.subtitle}
                        onChange={e => setEditingProject({ ...editingProject, subtitle: e.target.value })}
                        className="material-input"
                        style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                        📅 Release Date (Interactive Calendar) *
                      </label>
                      <input
                        type="date"
                        required
                        value={toDateInputValue(editingProject.releasedAt)}
                        onChange={e => {
                          const val = e.target.value
                          if (val) {
                            const formatted = formatDateFromInput(val)
                            setEditingProject({
                              ...editingProject,
                              releasedAt: val,
                              releaseLabel: !editingProject.releaseLabel || editingProject.releaseLabel.startsWith('Released')
                                ? `Released ${formatted}`
                                : editingProject.releaseLabel
                            })
                          }
                        }}
                        className="material-input"
                        style={{ width: '100%', padding: '10px 18px', borderRadius: 999, colorScheme: 'dark', cursor: 'pointer' }}
                        title="Open Calendar to select release date"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                        Release Display Label *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingProject.releaseLabel}
                        onChange={e => setEditingProject({ ...editingProject, releaseLabel: e.target.value })}
                        className="material-input"
                        style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                        placeholder="e.g. Released October 8, 2026"
                      />
                    </div>
                  </div>

                  {/* Schedule Release for Future Date & Time */}
                  <div style={{
                    padding: '16px 20px',
                    borderRadius: 22,
                    background: editingProject.scheduledAt ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-surface-variant)',
                    border: editingProject.scheduledAt ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 20 }}>🕒</span>
                        <div>
                          <h4 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-main)' }}>
                            Schedule Release for Future Date & Time (Optional)
                          </h4>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (editingProject.scheduledAt) {
                            setEditingProject({ ...editingProject, scheduledAt: undefined })
                          } else {
                            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
                            setEditingProject({ ...editingProject, scheduledAt: tomorrow.toISOString() })
                          }
                        }}
                        className={`material-btn material-pill-sm ${editingProject.scheduledAt ? 'active' : ''}`}
                        style={{ fontSize: 12, fontWeight: 700 }}
                      >
                        {editingProject.scheduledAt ? '✕ Remove Schedule (Release Now)' : '+ Schedule Future Release (Optional)'}
                      </button>
                    </div>

                    {editingProject.scheduledAt && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>
                            📅 Pick Calendar Date & Time (Your Local Timezone)
                          </label>
                          <input
                            type="datetime-local"
                            required
                            value={toDatetimeLocalValue(editingProject.scheduledAt)}
                            onChange={e => {
                              const val = e.target.value
                              if (val) {
                                setEditingProject({ ...editingProject, scheduledAt: new Date(val).toISOString() })
                              }
                            }}
                            className="material-input"
                            style={{ width: '100%', padding: '10px 18px', borderRadius: 999, colorScheme: 'dark', cursor: 'pointer' }}
                          />
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'var(--bg-surface)',
                          padding: '12px 16px',
                          borderRadius: 18,
                          fontSize: 12.5,
                          gap: 12,
                          border: '1px solid var(--border-subtle)'
                        }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                            Future Public Link: <strong style={{ color: '#38bdf8' }}>/projects/{editingProject.id}</strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyPublicLink(`/projects/${editingProject.id}`)}
                            className="material-btn material-pill-sm"
                            style={{ fontSize: 12, fontWeight: 700, padding: '5px 14px', flexShrink: 0 }}
                          >
                            📋 Copy Link
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Artist</label>
                      <select
                        value={editingProject.artistId}
                        onChange={e => setEditingProject({ ...editingProject, artistId: e.target.value })}
                        className="material-input"
                        style={{ width: '100%', height: 42, padding: '0 16px', borderRadius: 999 }}
                      >
                        {artistsList.map(a => (
                          <option key={a.id} value={a.id} style={{ background: 'var(--bg-surface)' }}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Project Category Type</label>
                      <select
                        value={editingProject.type || 'project'}
                        onChange={e => setEditingProject({ ...editingProject, type: e.target.value as any })}
                        className="material-input"
                        style={{ width: '100%', height: 42, padding: '0 16px', borderRadius: 999 }}
                      >
                        <option value="project" style={{ background: 'var(--bg-surface)' }}>Project</option>
                        <option value="soundtrack" style={{ background: 'var(--bg-surface)' }}>Soundtrack</option>
                        <option value="special" style={{ background: 'var(--bg-surface)' }}>Special</option>
                        <option value="final" style={{ background: 'var(--bg-surface)' }}>Final</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB: MEDIA & COLORS */}
              {projectEditorTab === 'links' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      Cover Art URL / Google Drive link
                    </label>
                    <input
                      type="text"
                      value={editingProject.coverFile}
                      onChange={e => setEditingProject({ ...editingProject, coverFile: e.target.value })}
                      className="material-input"
                      style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                      placeholder="https://drive.google.com/... or saccharin.png"
                    />
                  </div>

                  {/* Accent Color with Auto-Palette Generator */}
                  <div style={{ padding: 18, borderRadius: 24, background: 'var(--bg-surface-variant)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700 }}>Accent Theme Color & Cover Palette</span>
                      <button
                        type="button"
                        onClick={handleAutoColor}
                        className="material-btn material-pill-sm"
                        style={{ background: 'var(--text-main)', color: 'var(--bg-base)', fontWeight: 700, fontSize: 12 }}
                      >
                        🎨 Auto-Suggest Studio Palette
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Hex Accent Color</label>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <input
                            type="color"
                            value={editingProject.accentColor}
                            onChange={e => {
                              const hex = e.target.value
                              setEditingProject({
                                ...editingProject,
                                accentColor: hex,
                                accentSoft: `${hex}66`
                              })
                            }}
                            style={{ width: 40, height: 40, border: 'none', background: 'transparent', cursor: 'pointer' }}
                          />
                          <input
                            type="text"
                            value={editingProject.accentColor}
                            onChange={e => setEditingProject({ ...editingProject, accentColor: e.target.value })}
                            className="material-input"
                            style={{ width: '100%', padding: '8px 14px', borderRadius: 999 }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Preset Studio Palettes</label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {PRESET_PALETTES.map(p => (
                            <button
                              key={p.name}
                              type="button"
                              onClick={() => setEditingProject({ ...editingProject, accentColor: p.accent, accentSoft: p.soft })}
                              title={p.name}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                background: p.accent,
                                border: editingProject.accentColor === p.accent ? '2px solid #ffffff' : '1px solid rgba(0,0,0,0.4)',
                                cursor: 'pointer',
                                transition: 'transform 0.15s ease'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                        Lead Single Track
                      </label>
                      <input
                        type="text"
                        value={editingProject.leadTrack || ''}
                        onChange={e => setEditingProject({ ...editingProject, leadTrack: e.target.value })}
                        className="material-input"
                        style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                        placeholder="e.g. The Video"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                        Spotify URL (Optional)
                      </label>
                      <input
                        type="text"
                        value={editingProject.spotifyUrl || ''}
                        onChange={e => setEditingProject({ ...editingProject, spotifyUrl: e.target.value })}
                        className="material-input"
                        style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                        placeholder="https://open.spotify.com/..."
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      YouTube URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={editingProject.youtubeUrl || ''}
                      onChange={e => setEditingProject({ ...editingProject, youtubeUrl: e.target.value })}
                      className="material-input"
                      style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>
              )}

              {/* SUB-TAB: TRACKS & SONGS MANAGER (WITH REORDERING) */}
              {projectEditorTab === 'tracks' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      Manage track titles, order (▲ / ▼), badges, lyrics, and poems
                    </span>
                    <button
                      type="button"
                      onClick={handleAddTrack}
                      className="material-btn material-pill-sm"
                      style={{ background: 'var(--bg-surface-variant)', fontWeight: 700 }}
                    >
                      + Add Track
                    </button>
                  </div>

                  {/* Track List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 380, overflowY: 'auto' }}>
                    {editingProject.tracks.map((track, idx) => {
                      const isExpanded = selectedTrackIndex === idx
                      return (
                        <div
                          key={idx}
                          style={{
                            padding: '14px 18px',
                            borderRadius: 20,
                            background: isExpanded ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-variant)',
                            border: isExpanded ? '1px solid var(--accent-color)' : '1px solid var(--border-subtle)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                            <div
                              onClick={() => setSelectedTrackIndex(isExpanded ? null : idx)}
                              style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flex: 1 }}
                            >
                              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-faint)' }}>{idx + 1}</span>
                              <span style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-main)' }}>{track.title}</span>
                              {track.badges?.map(b => (
                                <span key={b} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 99, background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)' }}>
                                  {b}
                                </span>
                              ))}
                              {track.credits?.featuredArtists && (
                                <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>
                                  • feat. {track.credits.featuredArtists}
                                </span>
                              )}
                              {track.credits?.writtenBy && (
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                  • {track.credits.writtenBy}
                                </span>
                              )}
                              {track.content && (
                                <span style={{ fontSize: 11, color: '#38bdf8' }}>• Lyrics/Poem</span>
                              )}
                            </div>

                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              {/* Reorder Buttons */}
                              <button
                                type="button"
                                onClick={() => moveTrackUp(idx)}
                                disabled={idx === 0}
                                className="material-btn material-pill-sm"
                                style={{ fontSize: 12, padding: '4px 8px', opacity: idx === 0 ? 0.3 : 1 }}
                                title="Move Track Up"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                onClick={() => moveTrackDown(idx)}
                                disabled={idx === editingProject.tracks.length - 1}
                                className="material-btn material-pill-sm"
                                style={{ fontSize: 12, padding: '4px 8px', opacity: idx === editingProject.tracks.length - 1 ? 0.3 : 1 }}
                                title="Move Track Down"
                              >
                                ▼
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedTrackIndex(isExpanded ? null : idx)}
                                className="material-btn material-pill-sm"
                                style={{ fontSize: 12, padding: '4px 10px' }}
                              >
                                {isExpanded ? 'Done' : 'Edit'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTrack(idx)}
                                className="material-btn material-pill-sm"
                                style={{ color: '#ef4444', fontSize: 12, padding: '4px 10px' }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          {/* Expanded Track Editor */}
                          {isExpanded && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                              <div>
                                <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Track Title</label>
                                <input
                                  type="text"
                                  value={track.title}
                                  onChange={e => {
                                    const updated = [...editingProject.tracks]
                                    updated[idx].title = e.target.value
                                    setEditingProject({ ...editingProject, tracks: updated })
                                  }}
                                  className="material-input"
                                  style={{ width: '100%', padding: '8px 16px', borderRadius: 999 }}
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Badges / Tags</label>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                  {TRACK_BADGES.map(badge => {
                                    const hasBadge = track.badges?.includes(badge)
                                    return (
                                      <button
                                        key={badge}
                                        type="button"
                                        onClick={() => {
                                          const updated = [...editingProject.tracks]
                                          const currentBadges = updated[idx].badges || []
                                          updated[idx].badges = hasBadge
                                            ? currentBadges.filter(b => b !== badge)
                                            : [...currentBadges, badge]
                                          setEditingProject({ ...editingProject, tracks: updated })
                                        }}
                                        className={`material-btn material-pill-sm ${hasBadge ? 'active' : ''}`}
                                        style={{ fontSize: 11 }}
                                      >
                                        {badge}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>

                              <div>
                                <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                                  Lyrics or Poem Text (Optional)
                                </label>
                                <textarea
                                  rows={5}
                                  value={track.content || ''}
                                  onChange={e => {
                                    const updated = [...editingProject.tracks]
                                    updated[idx].content = e.target.value
                                    setEditingProject({ ...editingProject, tracks: updated })
                                  }}
                                  className="material-input"
                                  style={{ width: '100%', borderRadius: 16, padding: '10px 14px', lineHeight: 1.5 }}
                                  placeholder="Paste lyrics or written poem..."
                                />
                              </div>

                              {/* Track-level Individual Credits */}
                              <div style={{
                                padding: 14,
                                borderRadius: 18,
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid var(--border-subtle)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 10,
                                marginTop: 4
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-main)' }}>
                                    🎵 Track Credits & Personnel
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...editingProject.tracks]
                                      const pc = editingProject.credits || getDefaultProjectCredits(editingProject)
                                      const defaultCreds = getDefaultTrackCredits(track.title, pc)
                                      updated[idx].credits = defaultCreds
                                      setEditingProject({ ...editingProject, tracks: updated })
                                    }}
                                    className="material-btn material-pill-sm"
                                    style={{ fontSize: 10.5, padding: '2px 8px' }}
                                  >
                                    Use Project Defaults
                                  </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                  <div>
                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>
                                      Written By
                                    </label>
                                    <input
                                      type="text"
                                      value={track.credits?.writtenBy ?? ''}
                                      onChange={e => {
                                        const updated = [...editingProject.tracks]
                                        updated[idx].credits = {
                                          ...updated[idx].credits,
                                          writtenBy: e.target.value
                                        }
                                        setEditingProject({ ...editingProject, tracks: updated })
                                      }}
                                      className="material-input"
                                      style={{ width: '100%', padding: '6px 12px', borderRadius: 999, fontSize: 12 }}
                                      placeholder={editingProject.credits?.writtenBy || 'VEN'}
                                    />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>
                                      Produced By
                                    </label>
                                    <input
                                      type="text"
                                      value={track.credits?.producedBy ?? ''}
                                      onChange={e => {
                                        const updated = [...editingProject.tracks]
                                        updated[idx].credits = {
                                          ...updated[idx].credits,
                                          producedBy: e.target.value
                                        }
                                        setEditingProject({ ...editingProject, tracks: updated })
                                      }}
                                      className="material-input"
                                      style={{ width: '100%', padding: '6px 12px', borderRadius: 999, fontSize: 12 }}
                                      placeholder={editingProject.credits?.producedBy || 'VEN'}
                                    />
                                  </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                  <div>
                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>
                                      Featured Artist(s)
                                    </label>
                                    <input
                                      type="text"
                                      value={track.credits?.featuredArtists ?? ''}
                                      onChange={e => {
                                        const updated = [...editingProject.tracks]
                                        updated[idx].credits = {
                                          ...updated[idx].credits,
                                          featuredArtists: e.target.value
                                        }
                                        setEditingProject({ ...editingProject, tracks: updated })
                                      }}
                                      className="material-input"
                                      style={{ width: '100%', padding: '6px 12px', borderRadius: 999, fontSize: 12 }}
                                      placeholder="e.g. 13 or JHUZZ"
                                    />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>
                                      Additional Credits / Notes
                                    </label>
                                    <input
                                      type="text"
                                      value={track.credits?.additionalCredits ?? ''}
                                      onChange={e => {
                                        const updated = [...editingProject.tracks]
                                        updated[idx].credits = {
                                          ...updated[idx].credits,
                                          additionalCredits: e.target.value
                                        }
                                        setEditingProject({ ...editingProject, tracks: updated })
                                      }}
                                      className="material-input"
                                      style={{ width: '100%', padding: '6px 12px', borderRadius: 999, fontSize: 12 }}
                                      placeholder="e.g. Mixing, Mastering, Guitar solo"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* SUB-TAB: CREDITS & PERSONNEL */}
              {projectEditorTab === 'credits' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{
                    padding: '16px 20px',
                    borderRadius: 22,
                    background: 'var(--bg-surface-variant)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12
                  }}>
                    <div>
                      <h4 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-main)' }}>
                        Executive & Project Credits
                      </h4>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const def = getDefaultProjectCredits(editingProject)
                          setEditingProject({
                            ...editingProject,
                            credits: { ...def }
                          })
                          showToast('Reset project credits to canonical studio defaults!')
                        }}
                        className="material-btn material-pill-sm"
                        style={{ fontSize: 12 }}
                      >
                        Reset Defaults
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyCreditsToTracks}
                        className="material-btn material-pill-sm"
                        style={{
                          background: 'var(--text-main)',
                          color: 'var(--bg-base)',
                          fontWeight: 700,
                          fontSize: 12
                        }}
                      >
                        ⚡ Apply to All {editingProject.tracks.length} Tracks
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                        Written By (Songwriting / Composition)
                      </label>
                      <input
                        type="text"
                        value={editingProject.credits?.writtenBy ?? 'VEN'}
                        onChange={e => setEditingProject({
                          ...editingProject,
                          credits: {
                            ...(editingProject.credits || getDefaultProjectCredits(editingProject)),
                            writtenBy: e.target.value
                          }
                        })}
                        className="material-input"
                        style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                        placeholder="e.g. VEN"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                        Produced By (Beat Production / Sound Engineering)
                      </label>
                      <input
                        type="text"
                        value={editingProject.credits?.producedBy ?? 'VEN'}
                        onChange={e => setEditingProject({
                          ...editingProject,
                          credits: {
                            ...(editingProject.credits || getDefaultProjectCredits(editingProject)),
                            producedBy: e.target.value
                          }
                        })}
                        className="material-input"
                        style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                        placeholder="e.g. VEN"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                        Released Under (Label / Imprint)
                      </label>
                      <input
                        type="text"
                        value={editingProject.credits?.releasedUnder ?? 'studioseven'}
                        onChange={e => setEditingProject({
                          ...editingProject,
                          credits: {
                            ...(editingProject.credits || getDefaultProjectCredits(editingProject)),
                            releasedUnder: e.target.value
                          }
                        })}
                        className="material-input"
                        style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                        placeholder="e.g. studioseven"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                        Collaboration for Release (Studio / Partner)
                      </label>
                      <input
                        type="text"
                        value={editingProject.credits?.collaboration ?? ''}
                        onChange={e => setEditingProject({
                          ...editingProject,
                          credits: {
                            ...(editingProject.credits || getDefaultProjectCredits(editingProject)),
                            collaboration: e.target.value
                          }
                        })}
                        className="material-input"
                        style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                        placeholder="e.g. NAMUJANE Studios"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      Featured Artist(s) on Project
                    </label>
                    <input
                      type="text"
                      value={editingProject.credits?.featuredArtists ?? ''}
                      onChange={e => setEditingProject({
                        ...editingProject,
                        credits: {
                          ...(editingProject.credits || getDefaultProjectCredits(editingProject)),
                          featuredArtists: e.target.value
                        }
                      })}
                      className="material-input"
                      style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                      placeholder="e.g. 13, JHUZZ"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      Additional Executive Production Notes / Memoriam
                    </label>
                    <textarea
                      rows={3}
                      value={editingProject.credits?.additionalNotes ?? ''}
                      onChange={e => setEditingProject({
                        ...editingProject,
                        credits: {
                          ...(editingProject.credits || getDefaultProjectCredits(editingProject)),
                          additionalNotes: e.target.value
                        }
                      })}
                      className="material-input"
                      style={{ width: '100%', borderRadius: 16, padding: '10px 14px', lineHeight: 1.5 }}
                      placeholder="e.g. Official Motion Picture Soundtrack developed alongside NAMUJANE Studios."
                    />
                  </div>
                </div>
              )}

              {/* SUB-TAB: LORE & HISTORY */}
              {projectEditorTab === 'history' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={handleAddHistorySection}
                      className="material-btn material-pill-sm"
                      style={{ fontWeight: 700 }}
                    >
                      + Add Chapter
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 380, overflowY: 'auto' }}>
                    {editingProject.history.map((sec, idx) => (
                      <div key={idx} style={{ padding: '16px 20px', borderRadius: 20, background: 'var(--bg-surface-variant)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={sec.heading}
                            onChange={e => {
                              const updated = [...editingProject.history]
                              updated[idx].heading = e.target.value
                              setEditingProject({ ...editingProject, history: updated })
                            }}
                            className="material-input"
                            style={{ flex: 1, padding: '8px 14px', borderRadius: 999, fontWeight: 700, fontSize: 14 }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...editingProject.history]
                              updated.splice(idx, 1)
                              setEditingProject({ ...editingProject, history: updated })
                            }}
                            className="material-btn material-pill-sm"
                            style={{ color: '#ef4444', marginLeft: 10 }}
                          >
                            ✕
                          </button>
                        </div>
                        <textarea
                          value={sec.body}
                          onChange={e => {
                            const updated = [...editingProject.history]
                            updated[idx].body = e.target.value
                            setEditingProject({ ...editingProject, history: updated })
                          }}
                          className="material-input"
                          style={{ width: '100%', minHeight: 90, borderRadius: 16, padding: '12px 14px', lineHeight: 1.6 }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-TAB: SHOWCASE SETTINGS */}
              {projectEditorTab === 'showcase' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderRadius: 20, background: 'var(--bg-surface-variant)', border: '1px solid var(--border-subtle)' }}>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 700 }}>Featured in Hero Banner</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingProject({ ...editingProject, featured: !editingProject.featured })}
                      className={`material-btn material-pill ${editingProject.featured ? 'active' : ''}`}
                      style={{ fontWeight: 700 }}
                    >
                      {editingProject.featured ? '★ Featured in Banner' : 'Not Featured'}
                    </button>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      Showcase Banner Subtitle / Tagline (Optional)
                    </label>
                    <input
                      type="text"
                      value={editingProject.showcaseLabel || ''}
                      onChange={e => setEditingProject({ ...editingProject, showcaseLabel: e.target.value })}
                      className="material-input"
                      style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                      placeholder="e.g. RELEASED JAN 21, 2026 or OFFICIAL MOVIE SOUNDTRACK"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      Showcase Hero Banner Description
                    </label>
                    <textarea
                      value={editingProject.description || ''}
                      onChange={e => setEditingProject({ ...editingProject, description: e.target.value })}
                      className="material-input"
                      style={{ width: '100%', minHeight: 90, borderRadius: 18, padding: '12px 16px', lineHeight: 1.5 }}
                      placeholder="Concise 1-2 sentence description shown in the homescreen hero banner (e.g. like Saccharin)..."
                    />
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10, borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="material-btn material-pill"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProject}
                  className="material-btn material-pill"
                  style={{ background: 'var(--text-main)', color: 'var(--bg-base)', fontWeight: 700 }}
                >
                  {savingProject ? 'Saving...' : 'Save Release to Supabase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ MODAL: QUICK HERO BANNER COPY EDITOR ═══════════════ */}
      {editingShowcaseProject && (
        <div className="modal-overlay" onClick={() => setEditingShowcaseProject(null)}>
          <div
            className="modal-container"
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 640, padding: 32, borderRadius: 32, backgroundColor: 'var(--bg-surface-solid)', display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800 }}>
                  Customize Hero Banner: {editingShowcaseProject.title}
                </h3>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Slot #{editingShowcaseProject.showcaseOrder ?? 1} on Homescreen
                </span>
              </div>
              <button
                onClick={() => setEditingShowcaseProject(null)}
                className="material-btn"
                style={{ width: 34, height: 34, borderRadius: '50%', fontSize: 14 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveShowcaseBanner} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Banner Headline Title
                </label>
                <input
                  type="text"
                  required
                  value={editingShowcaseProject.title}
                  onChange={e => setEditingShowcaseProject({ ...editingShowcaseProject, title: e.target.value })}
                  className="material-input"
                  style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Top Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={editingShowcaseProject.showcaseLabel || ''}
                  onChange={e => setEditingShowcaseProject({ ...editingShowcaseProject, showcaseLabel: e.target.value })}
                  className="material-input"
                  style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                  placeholder="e.g. RELEASED JAN 21, 2026 or OFFICIAL SOUNDTRACK"
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Hero Banner Description (shown on homepage)
                </label>
                <textarea
                  required
                  rows={4}
                  value={editingShowcaseProject.description || ''}
                  onChange={e => setEditingShowcaseProject({ ...editingShowcaseProject, description: e.target.value })}
                  className="material-input"
                  style={{ width: '100%', borderRadius: 18, padding: '12px 16px', lineHeight: 1.55 }}
                  placeholder="Write the atmospheric, compelling banner description..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditingShowcaseProject(null)}
                  className="material-btn material-pill"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingShowcase}
                  className="material-btn material-pill"
                  style={{ background: 'var(--text-main)', color: 'var(--bg-base)', fontWeight: 700 }}
                >
                  {savingShowcase ? 'Saving...' : 'Update Hero Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ MODAL: ARTIST EDITOR ═══════════════ */}
      {editingArtist && (
        <div className="modal-overlay" onClick={() => setEditingArtist(null)}>
          <div
            className="modal-container"
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 640, padding: 32, borderRadius: 32, backgroundColor: 'var(--bg-surface-solid)', display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800 }}>
                  {originalArtistId ? 'Edit Creator Profile' : 'Add New Artist'}
                </h3>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  ID: {editingArtist.id}
                </span>
              </div>
              <button
                onClick={() => setEditingArtist(null)}
                className="material-btn"
                style={{ width: 34, height: 34, borderRadius: '50%', fontSize: 14 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveArtist} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Editable Slug / ID */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Artist Slug / ID *
                </label>
                <input
                  type="text"
                  required
                  value={editingArtist.id}
                  onChange={e => setEditingArtist({ ...editingArtist, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                  className="material-input"
                  style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                  placeholder="e.g. ven, jhuzz, 13"
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingArtist.name}
                  onChange={e => setEditingArtist({ ...editingArtist, name: e.target.value })}
                  className="material-input"
                  style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                  placeholder="e.g. VEN"
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Avatar Image File or URL *
                </label>
                <input
                  type="text"
                  required
                  value={editingArtist.image}
                  onChange={e => setEditingArtist({ ...editingArtist, image: e.target.value })}
                  className="material-input"
                  style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                  placeholder="e.g. ven.png, star.jpg, or external URL"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    Spotify URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingArtist.spotifyUrl || ''}
                    onChange={e => setEditingArtist({ ...editingArtist, spotifyUrl: e.target.value })}
                    className="material-input"
                    style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                    placeholder="https://open.spotify.com/artist/..."
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    YouTube URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingArtist.youtubeUrl || ''}
                    onChange={e => setEditingArtist({ ...editingArtist, youtubeUrl: e.target.value })}
                    className="material-input"
                    style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                    placeholder="https://youtube.com/@..."
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Artist Biography
                </label>
                <textarea
                  rows={6}
                  value={editingArtist.bio || ''}
                  onChange={e => setEditingArtist({ ...editingArtist, bio: e.target.value })}
                  className="material-input"
                  style={{ width: '100%', borderRadius: 20, padding: '14px 18px', lineHeight: 1.6 }}
                  placeholder="Write the artist background, contributions, and lore..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditingArtist(null)}
                  className="material-btn material-pill"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingArtist}
                  className="material-btn material-pill"
                  style={{ background: 'var(--text-main)', color: 'var(--bg-base)', fontWeight: 700 }}
                >
                  {savingArtist ? 'Saving...' : 'Save Artist to Supabase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
