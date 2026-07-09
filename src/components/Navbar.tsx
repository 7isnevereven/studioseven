'use client'

import { useState, useEffect } from 'react'

interface NavBarProps {
  currentView: string;
  setCurrentView: (view: 'home' | 'projects' | 'artists' | 'newsroom' | 'about') => void;
  onOpenMenu: () => void;
}

const NAV_LINKS = [
  { label: 'Home',     id: 'home' },
  { label: 'Newsroom', id: 'newsroom' },
  { label: 'Projects', id: 'projects' },
  { label: 'Artists',  id: 'artists' },
] as const

function SunIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> }
function MoonIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> }
function MenuIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg> }

export default function Navbar({ currentView, setCurrentView, onOpenMenu }: NavBarProps) {
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    setIsLight(document.body.classList.contains('light-mode'))
  }, [])

  const toggleTheme = () => {
    document.body.classList.toggle('light-mode')
    setIsLight(!isLight)
  }

  return (
    <nav 
      className="navbar" 
      style={{ 
        width: '100%', height: '70px', minHeight: '70px', flexShrink: 0, position: 'sticky', top: 0, zIndex: 20, 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
        background: 'var(--modal-overlay)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderBottom: '1px solid var(--glass-border-b)' 
      }}
    >
      <div className="mobile-only" style={{ width: 44 }}>
        <button onClick={onOpenMenu} className="glass-btn glass-icon-sm" style={{ color: 'var(--text-main)' }}><MenuIcon /></button>
      </div>

      <div className="nav-links">
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

      <div style={{ width: 44, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={toggleTheme} className="glass-btn glass-icon-sm" style={{ color: 'var(--text-main)' }}>
          {isLight ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>
    </nav>
  )
}