'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const LOGO_URL = 'https://flrwvmfjjuyoyjeeosls.supabase.co/storage/v1/object/public/misc/ss7.png'

interface NavBarProps {
  currentView?: string
  setCurrentView?: (view: 'home' | 'projects' | 'artists' | 'newsroom' | 'about') => void
}

const NAV_LINKS = [
  { label: 'Home',     id: 'home',     href: '/' },
  { label: 'Newsroom', id: 'newsroom', href: '/#newsroom' },
  { label: 'Projects', id: 'projects', href: '/#projects' },
  { label: 'Artists',  id: 'artists',  href: '/#artists' },
] as const

function SunIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

export default function Navbar({ currentView = 'home', setCurrentView }: NavBarProps) {
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    setIsLight(document.body.classList.contains('light-mode'))
  }, [])

  const toggleTheme = () => {
    const nextIsLight = !isLight
    setIsLight(nextIsLight)
    if (nextIsLight) {
      document.body.classList.add('light-mode')
    } else {
      document.body.classList.remove('light-mode')
    }
  }

  const handleNavClick = (id: 'home' | 'projects' | 'artists' | 'newsroom' | 'about') => {
    if (setCurrentView) {
      setCurrentView(id)
    }
  }

  return (
    <header className="navbar-wrapper">
      
      {/* Brand Logo only (no text next to it) */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }} title="studioseven">
          <img
            src={LOGO_URL}
            alt="studioseven"
            className="brand-logo-img"
          />
        </Link>
      </div>

      {/* Floating Center Dock */}
      <nav className="liquid-dock nav-links">
        {NAV_LINKS.map(link => {
          const isActive = currentView === link.id
          if (setCurrentView) {
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`liquid-btn liquid-pill-sm ${isActive ? 'active' : ''}`}
                style={{
                  border: 'none',
                  background: isActive ? 'var(--liquid-glass-active)' : 'transparent',
                  boxShadow: isActive ? 'var(--liquid-inner-rim-hover), 0 3px 12px rgba(0,0,0,0.18)' : 'none',
                  color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 12.5,
                }}
              >
                {link.label}
              </button>
            )
          }

          return (
            <Link
              key={link.id}
              href={link.href}
              className={`liquid-btn liquid-pill-sm ${isActive ? 'active' : ''}`}
              style={{
                border: 'none',
                textDecoration: 'none',
                background: isActive ? 'var(--liquid-glass-active)' : 'transparent',
                boxShadow: isActive ? 'var(--liquid-inner-rim-hover), 0 3px 12px rgba(0,0,0,0.18)' : 'none',
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: 12.5,
              }}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Theme Toggle */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button
          onClick={toggleTheme}
          className="liquid-btn liquid-icon-sm"
          title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          aria-label="Toggle theme"
        >
          {isLight ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>

    </header>
  )
}