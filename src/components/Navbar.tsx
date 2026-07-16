'use client'

import { useState, useEffect } from 'react'

const LOGO_URL = 'https://flrwvmfjjuyoyjeeosls.supabase.co/storage/v1/object/public/misc/ss7.png'

interface NavBarProps {
  currentView: string;
  setCurrentView: (view: 'home' | 'projects' | 'artists' | 'newsroom' | 'about') => void;
  onToggleSidebar: () => void;
}

const NAV_LINKS = [
  { label: 'Home',     id: 'home' },
  { label: 'Newsroom', id: 'newsroom' },
  { label: 'Projects', id: 'projects' },
  { label: 'Artists',  id: 'artists' },
] as const

function SunIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> }
function MoonIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> }
function SidebarIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg> }

export default function Navbar({ currentView, setCurrentView, onToggleSidebar }: NavBarProps) {
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    setIsLight(document.body.classList.contains('light-mode'))
  }, [])

  const toggleTheme = () => {
    document.body.classList.toggle('light-mode')
    setIsLight(!isLight)
  }

  return (
    <nav className="navbar nav-progressive-blur">
      
      {/* Sidebar Toggle & Smart Hiding Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <button onClick={onToggleSidebar} className="glass-btn glass-icon-sm" style={{ color: 'var(--text-main)' }}>
          <SidebarIcon />
        </button>
        <div className="navbar-logo-container desktop-only">
          <img src={LOGO_URL} alt="studioseven" style={{ height: 18, objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
        </div>
      </div>

      <div className="nav-links" style={{ margin: '0 auto' }}>
        {NAV_LINKS.map(link => (
          <button
            key={link.id}
            onClick={() => setCurrentView(link.id)}
            className={`glass-btn glass-pill-sm ${currentView === link.id ? 'active' : ''}`}
            style={{ letterSpacing: '0.02em', color: currentView === link.id ? 'var(--text-main)' : 'var(--text-muted)' }}
          >
            {link.label}
          </button>
        ))}
      </div>

      <div style={{ width: 44, display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
        <button onClick={toggleTheme} className="glass-btn glass-icon-sm" style={{ color: 'var(--text-main)' }}>
          {isLight ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>

    </nav>
  )
}