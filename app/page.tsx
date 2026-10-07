'use client'

import { useState, useEffect, useCallback } from 'react'
import RightPanel from '@/components/RightPanel'

type View = 'home' | 'projects' | 'artists' | 'newsroom' | 'about'

const VALID_VIEWS: View[] = ['home', 'projects', 'artists', 'newsroom', 'about']

export default function Page() {
  const [currentView, setCurrentView] = useState<View>('home')

  // Restore active view from URL search param, hash, or session storage
  const syncViewFromLocation = useCallback(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const qView = params.get('view') as View | null
    const hash = window.location.hash.replace('#', '') as View

    if (qView && VALID_VIEWS.includes(qView)) {
      setCurrentView(qView)
      sessionStorage.setItem('ss7_active_view', qView)
      return
    }

    if (hash && VALID_VIEWS.includes(hash)) {
      setCurrentView(hash)
      sessionStorage.setItem('ss7_active_view', hash)
      return
    }

    const saved = sessionStorage.getItem('ss7_active_view') as View | null
    if (saved && VALID_VIEWS.includes(saved)) {
      setCurrentView(saved)
    }
  }, [])

  useEffect(() => {
    syncViewFromLocation()
    window.addEventListener('popstate', syncViewFromLocation)
    window.addEventListener('hashchange', syncViewFromLocation)
    return () => {
      window.removeEventListener('popstate', syncViewFromLocation)
      window.removeEventListener('hashchange', syncViewFromLocation)
    }
  }, [syncViewFromLocation])

  const handleSetView = (v: View) => {
    setCurrentView(v)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ss7_active_view', v)
      if (v === 'home') {
        window.history.replaceState(null, '', '/')
      } else {
        window.history.replaceState(null, '', `/?view=${v}`)
      }
    }
  }

  return (
    <RightPanel
      currentView={currentView}
      setCurrentView={handleSetView}
    />
  )
}