'use client'

import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { label: 'Home',     href: '#home' },
  { label: 'Newsroom', href: '#newsroom' },
  { label: 'Artists',  href: '#artists' },
  { label: 'Projects', href: '#projects' },
  { label: 'About',    href: '#about' },
]

export default function Navbar() {
  const [active, setActive] = useState('home')

  // Track which section is in view
  useEffect(() => {
    const sections = NAV_LINKS.map(l => l.href.slice(1))
    const observers: IntersectionObserver[] = []

    sections.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id) },
        { threshold: 0.4 }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [])

  const handleClick = (href: string) => {
    const id = href.slice(1)
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth' })
    setActive(id)
  }

  return (
    <nav className="navbar">
      {/* Logo text - right side of left panel mirrors here */}
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 13,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.35)',
          marginRight: 'auto',
          letterSpacing: '-0.01em',
        }}
      >
        studio<strong style={{ fontWeight: 700 }}>seven</strong>
      </span>

      {NAV_LINKS.map(link => (
        <button
          key={link.href}
          onClick={() => handleClick(link.href)}
          className={`navbar-link ${active === link.href.slice(1) ? 'active' : ''}`}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {link.label}
        </button>
      ))}
    </nav>
  )
}