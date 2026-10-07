'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const LOGO_URL = 'https://flrwvmfjjuyoyjeeosls.supabase.co/storage/v1/object/public/misc/ss7.png'

export default function NotFound() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    if (countdown <= 0) {
      router.push('/')
      return
    }

    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown, router])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      color: 'var(--text-main)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 20px',
      position: 'relative'
    }}>
      {/* Background radial glow */}
      <div style={{
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none'
      }} />

      <div
        className="material-card"
        style={{
          width: '100%',
          maxWidth: 520,
          padding: '48px 36px',
          borderRadius: 36,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 24,
          position: 'relative',
          boxShadow: 'var(--elevation-3)',
          border: '1px solid var(--border-default)',
          background: 'var(--bg-surface)'
        }}
      >
        {/* Brand Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <img src={LOGO_URL} alt="studioseven" style={{ height: 32, width: 'auto', marginBottom: 8 }} />
        </Link>

        {/* Status Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 14px',
          borderRadius: 999,
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          fontSize: 12.5,
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase'
        }}>
          <span>404</span>
          <span>•</span>
          <span>Unavailable / Not Found</span>
        </div>

        {/* Message */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h1 style={{
            fontSize: 'clamp(24px, 4vw, 30px)',
            fontWeight: 800,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}>
            Sorry, this page does not exist
          </h1>
          <p style={{
            fontSize: 14.5,
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            maxWidth: 420
          }}>
            The page you just accessed does not exist, has been removed, or is scheduled for future release and not yet posted.
          </p>
        </div>

        {/* Countdown Ring / Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 20px',
          borderRadius: 999,
          background: 'var(--bg-surface-variant)',
          border: '1px solid var(--border-subtle)',
          fontSize: 13,
          color: 'var(--text-muted)'
        }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'var(--text-main)',
            color: 'var(--bg-base)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 800
          }}>
            {countdown}
          </div>
          <span>Redirecting to homescreen in <strong>{countdown}s</strong>...</span>
        </div>

        {/* Go to Home Button */}
        <Link
          href="/"
          className="material-btn material-pill"
          style={{
            background: 'var(--text-main)',
            color: 'var(--bg-base)',
            borderColor: 'var(--text-main)',
            fontWeight: 800,
            fontSize: 14,
            padding: '13px 32px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            justifyContent: 'center'
          }}
        >
          <span>Go to Home</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  )
}
