'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Application Error Boundary caught error]:', error)
  }, [error])

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        backgroundColor: '#09090b',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ef4444',
          marginBottom: 20,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
        Unable to load page
      </h1>

      <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.65)', maxWidth: 440, lineHeight: 1.6, margin: '0 0 28px 0' }}>
        A temporary error occurred while rendering this view. You can retry or head back to the main studioseven catalog.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => reset()}
          style={{
            padding: '11px 22px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            color: '#09090b',
            border: 'none',
            fontSize: 13.5,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>

        <Link
          href="/"
          style={{
            padding: '11px 22px',
            borderRadius: 10,
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#f8fafc',
            textDecoration: 'none',
            fontSize: 13.5,
            fontWeight: 500,
          }}
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}


