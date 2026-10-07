'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const LOGO_URL = 'https://flrwvmfjjuyoyjeeosls.supabase.co/storage/v1/object/public/misc/ss7.png'

export interface NavBarProps {
  currentView?: string
  setCurrentView?: (view: 'home' | 'projects' | 'artists' | 'newsroom' | 'about') => void
  backTo?: { href: string; label: string }
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

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="7" x2="20" y2="7"></line>
      <line x1="4" y1="12" x2="20" y2="12"></line>
      <line x1="4" y1="17" x2="20" y2="17"></line>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function NewsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Z"/>
      <path d="M18 14h-8"/>
      <path d="M15 18h-5"/>
      <path d="M10 6h8v4h-8V6Z"/>
    </svg>
  )
}

function DiscIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

export default function Navbar({ currentView = 'home', setCurrentView, backTo }: NavBarProps) {
  const router = useRouter()
  const [isLight, setIsLight] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        window.history.back()
        return
      }
    }
    if (backTo?.href) {
      router.push(backTo.href)
    } else {
      router.push('/')
    }
  }

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
    setMobileMenuOpen(false)
  }

  // Close drawer on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setMobileMenuOpen(false)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileMenuOpen, handleKeyDown])

  const renderNavIcon = (id: string) => {
    switch (id) {
      case 'home': return <HomeIcon />
      case 'newsroom': return <NewsIcon />
      case 'projects': return <DiscIcon />
      case 'artists': return <UserIcon />
      default: return null
    }
  }

  return (
    <>
      <header className="navbar-wrapper">
        
        {/* Left Side: Back button (if provided) and Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {backTo && (
            <button
              type="button"
              onClick={handleBackClick}
              className="material-btn material-pill-sm"
              style={{
                gap: 6,
                textDecoration: 'none',
                padding: '6px 14px',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Back to previous page"
            >
              <ArrowLeftIcon />
              <span className="back-btn-text">Back</span>
            </button>
          )}

          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }} title="studioseven">
            <img
              src={LOGO_URL}
              alt="studioseven"
              className="brand-logo-img"
            />
          </Link>
        </div>

        {/* Desktop Navigation Dock (Hidden on mobile) */}
        <nav className="nav-dock nav-links-desktop">
          {NAV_LINKS.map(link => {
            const isActive = currentView === link.id
            if (setCurrentView) {
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`material-btn material-pill-sm ${isActive ? 'active' : ''}`}
                  style={{
                    border: 'none',
                    boxShadow: isActive ? 'var(--elevation-1)' : 'none',
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
                className={`material-btn material-pill-sm ${isActive ? 'active' : ''}`}
                style={{
                  border: 'none',
                  textDecoration: 'none',
                  boxShadow: isActive ? 'var(--elevation-1)' : 'none',
                  fontSize: 12.5,
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Side: Theme Toggle + Mobile Menu Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={toggleTheme}
            className="material-btn material-icon-sm"
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle theme"
          >
            {isLight ? <MoonIcon /> : <SunIcon />}
          </button>

          {/* Menu Button for Mobile Viewports */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="material-btn material-icon-sm mobile-menu-btn"
            title="Navigation Menu"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

      </header>

      {/* Mobile Navigation Drawer & Scrim */}
      {mobileMenuOpen && (
        <>
          <div
            className="mobile-nav-scrim"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <aside className="mobile-nav-drawer" role="dialog" aria-modal="true" aria-label="Navigation Menu">
            {/* Drawer Header */}
            <div className="mobile-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={LOGO_URL}
                  alt="logo"
                  className="brand-logo-img"
                  style={{ height: 22 }}
                />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="material-btn material-icon-sm"
                aria-label="Close menu"
                style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Navigation List — Styled as Rounded Pills matching dock */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {NAV_LINKS.map(link => {
                const isActive = currentView === link.id
                if (setCurrentView) {
                  return (
                    <button
                      key={link.id}
                      onClick={() => handleNavClick(link.id)}
                      className={`mobile-drawer-link ${isActive ? 'active' : ''}`}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', opacity: isActive ? 1 : 0.7 }}>
                        {renderNavIcon(link.id)}
                      </span>
                      <span>{link.label}</span>
                    </button>
                  )
                }

                return (
                  <Link
                    key={link.id}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`mobile-drawer-link ${isActive ? 'active' : ''}`}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', opacity: isActive ? 1 : 0.7 }}>
                      {renderNavIcon(link.id)}
                    </span>
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Drawer Footer with Theme Toggle */}
            <div className="mobile-drawer-footer">
              <button
                onClick={toggleTheme}
                className="mobile-drawer-link"
                style={{ justifyContent: 'space-between' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {isLight ? <MoonIcon /> : <SunIcon />}
                  <span>{isLight ? 'Dark Theme' : 'Light Theme'}</span>
                </span>
                <span style={{ fontSize: 11.5, opacity: 0.6 }}>Toggle</span>
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  )
}