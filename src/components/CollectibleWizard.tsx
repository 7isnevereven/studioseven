'use client'

import { useState, useRef } from 'react'
import { toPng } from 'html-to-image'
import { supabase } from '../utils/supabase'

const LOGO_URL = '/declassified.svg'
const FIREWORKS_URL = '/declassified-fireworks.svg'

const TRACK_OPTIONS = [
  { id: 'chances', title: 'Chances', color: '#4a5a67' },
  { id: 'heist', title: 'The Greatest Heist In History', color: '#807177' },
  { id: 'brighter-days', title: 'Brighter Days', color: '#b87b7d' },
  { id: 'fits-right', title: 'Fits Right', color: '#e2a373' },
  { id: 'half-a-lie', title: 'Half a Lie', color: '#d67043' },
]

const LYRIC_OPTIONS = [
  "You talk about forever plans and I nod, but I don't know if I can",
  "I still come home, I still try, but half of me's living a different life",
  "I'm not all here, and I hate it",
  "You're giving love I wish I could feel",
  "You deserve more than not knowing",
  "But I know, I'm not all here",
  "Still loving you while losing me",
  "Might be the worst kind of robbery in history",
  "Love shouldn't hurt this much to feel good",
  "This time, I'm choosing mine",
  "I stayed through storms, I still tried",
  "Truth can hurt without knowing",
  "You played me so close and lived half a lie",
  "Still wore my love while you're with him",
  "I cried for love that's gone",
]

// 10 Strong, cinematic color themes directly inspired by the project cover art
const THEMES = [
  'linear-gradient(135deg, #4f758b 0%, #d48a60 100%)', // Sky Blue to Hand Warmth
  'linear-gradient(135deg, #2a4150 0%, #b55d3d 100%)', // Deep Teal to Coral
  'linear-gradient(135deg, #9a5b65 0%, #2b3d4a 100%)', // Firework Pink to Night Blue
  'linear-gradient(135deg, #e0a383 0%, #689cb5 100%)', // Peach to Sky
  'linear-gradient(135deg, #782626 0%, #c48862 100%)', // Deep Crimson to Tan
  'linear-gradient(135deg, #1d3748 0%, #e0bc9c 100%)', // Night Sky to Spark Glow
  'linear-gradient(135deg, #a3797f 0%, #365666 100%)', // Muted Rose to Teal
  'linear-gradient(135deg, #d6875c 0%, #873e1c 100%)', // Warm Orange to Rust
  'linear-gradient(135deg, #4a748c 0%, #823e43 100%)', // Hazy Blue to Crimson
  'linear-gradient(135deg, #152430 0%, #c28466 100%)', // Twilight to Warm Peach
]

interface CollectibleWizardProps {
  onClose: () => void;
}

export default function CollectibleWizard({ onClose }: CollectibleWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [selectedTrack, setSelectedTrack] = useState(TRACK_OPTIONS[1])
  const [nickname, setNickname] = useState('')
  const [selectedLyric, setSelectedLyric] = useState(LYRIC_OPTIONS[8])
  const [selectedTheme, setSelectedTheme] = useState(0)
  
  const [refNumber, setRefNumber] = useState('')
  const [isSaving, setIsSubmitting] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => { setIsClosing(false); onClose(); }, 300)
  }

  const generateRefNumber = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let result = 'SS7-DC-'
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const handleRandomLyric = () => {
    const randomIndex = Math.floor(Math.random() * LYRIC_OPTIONS.length)
    setSelectedLyric(LYRIC_OPTIONS[randomIndex])
  }

  const handleNextToPreview = async () => {
    const newRef = generateRefNumber()
    setRefNumber(newRef)
    setStep(4)

    try {
      await supabase.from('virtual_collectibles').insert([
        {
          ref_number: newRef,
          name: nickname.trim() || 'VEN',
          track_title: selectedTrack.title,
          lyric: selectedLyric,
          theme_id: selectedTheme,
        }
      ])
    } catch (e) {
      console.error('Error saving collectible reference:', e)
    }
  }

  const handleDownload = async () => {
    if (!cardRef.current) return
    setIsSubmitting(true)
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 })
      const link = document.createElement('a')
      link.download = `declassified-collectible-${refNumber || 'ss7'}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to generate PNG:', err)
    }
    setIsSubmitting(false)
  }

  const stepTitles = [
    'choose your track',
    'fill the details',
    'pick a color theme',
    'take a look at your customized collectible!'
  ]

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      
      {/* ── SOLID MODAL CONTAINER (Cinematic Theme) ── */}
      <div 
        className={`collectible-solid-modal ${isClosing ? 'closing' : ''}`} 
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 840, height: '90vh', position: 'relative' }}
      >
        <button onClick={handleClose} style={{ position: 'absolute', top: 24, right: 32, zIndex: 60, background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}>✕</button>

        {/* ── STAPLE HEADER (Never Scrolls) ── */}
        <div className="collectible-solid-modal-header" style={{ padding: '40px 40px 20px 40px', textAlign: 'center', zIndex: 10 }}>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
            {[1, 2, 3, 4].map(s => (
              <div key={s} style={{ width: 8, height: 8, borderRadius: '50%', background: step >= s ? '#f3e8df' : 'rgba(255,255,255,0.2)', transition: 'all 0.3s ease' }} />
            ))}
          </div>
          <p className="collectible-title-serif" style={{ fontSize: 24, letterSpacing: '0.02em', margin: 0, color: '#fff' }}>
            customize your <span className="collectible-title-script" style={{ fontSize: '1.8em', color: '#fff' }}>declassified</span> project!
          </p>
          <p className="collectible-title-serif" style={{ fontSize: 16, color: '#d0c4c4', marginTop: 0, fontStyle: 'italic' }}>
            step {step}: {stepTitles[step - 1]}
          </p>
        </div>

        {/* ── SCROLLING MIDDLE CONTENT ── */}
        <div className="solid-scrollbar" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '32px 40px' }}>
          
          {step === 1 && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, paddingTop: 32 }}>
              <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
                {TRACK_OPTIONS.map(track => (
                  <div 
                    key={track.id} 
                    onClick={() => setSelectedTrack(track)}
                    style={{
                      width: 130, height: 180, borderRadius: 12, background: track.color,
                      display: 'flex', alignItems: 'flex-end', padding: 16, color: '#ffffff', textAlign: 'right', cursor: 'pointer',
                      border: selectedTrack.id === track.id ? '2px solid #fff' : '2px solid transparent',
                      transform: selectedTrack.id === track.id ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.2s', boxShadow: '0 8px 16px rgba(0,0,0,0.5)'
                    }}
                  >
                    <span className="collectible-title-serif" style={{ fontSize: 16, lineHeight: 1.2, width: '100%', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                      {track.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 32, width: '100%', maxWidth: 760, margin: '0 auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label className="collectible-title-serif" style={{ fontSize: 18, color: '#fff', fontStyle: 'italic' }}>Nickname</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="enter nickname here"
                  style={{ padding: '16px 24px', fontSize: 18, borderRadius: 12, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="collectible-title-serif" style={{ fontSize: 18, color: '#fff', fontStyle: 'italic' }}>Select a lyric</label>
                  <button 
                    onClick={handleRandomLyric} 
                    className="collectible-title-serif"
                    style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 99, color: '#fff', cursor: 'pointer' }}
                  >
                    Random Lyric
                  </button>
                </div>
                
                {/* 2-Column Grid Layout */}
                <div className="solid-scrollbar" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  {LYRIC_OPTIONS.map((lyric, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedLyric(lyric)}
                      style={{ 
                        padding: '20px 24px', cursor: 'pointer', borderRadius: 12,
                        border: selectedLyric === lyric ? '1px solid #fff' : '1px solid rgba(255,255,255,0.1)',
                        background: selectedLyric === lyric ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.3)',
                        transition: 'all 0.2s', display: 'flex', alignItems: 'center'
                      }}
                    >
                      <span className="collectible-title-serif" style={{ fontSize: 16, color: '#fff', display: 'block', lineHeight: 1.6 }}>{lyric}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in" style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20, width: '100%', maxWidth: 700 }}>
                {THEMES.map((themeGradient, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedTheme(idx)}
                    style={{
                      width: '100%', aspectRatio: '3/4', borderRadius: 12, background: themeGradient, cursor: 'pointer',
                      border: selectedTheme === idx ? '2px solid #fff' : '2px solid transparent',
                      transform: selectedTheme === idx ? 'scale(1.08)' : 'scale(1)',
                      transition: 'all 0.2s', boxShadow: '0 8px 16px rgba(0,0,0,0.5)'
                    }} 
                  />
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in" style={{ display: 'flex', justifyContent: 'center', paddingBottom: 24 }}>
              
              {/* ── THE COLLECTIBLE PREVIEW ── */}
              <div
                ref={cardRef}
                style={{
                  width: 540, maxWidth: '100%', backgroundColor: '#ffffff',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.6)', borderRadius: 24, overflow: 'hidden'
                }}
              >
                {/* Artwork Card */}
                <div
                  style={{
                    width: '100%', minHeight: 560, background: THEMES[selectedTheme],
                    position: 'relative', display: 'flex', flexDirection: 'column',
                    color: '#f3e8df', boxSizing: 'border-box'
                  }}
                >
                  {/* FIREWORKS BACKGROUND */}
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
                    WebkitMaskImage: `url('${FIREWORKS_URL}')`, WebkitMaskSize: 'cover', WebkitMaskPosition: 'center',
                    maskImage: `url('${FIREWORKS_URL}')`, maskSize: 'cover', maskPosition: 'center',
                    backgroundColor: '#f3e8df', opacity: 0.12
                  }} />

                  {/* PERFECTLY SIZED TOP LOGO */}
                  <div style={{ padding: '40px 40px 0 40px', zIndex: 3 }}>
                    <div style={{
                      WebkitMaskImage: `url('${LOGO_URL}')`, WebkitMaskSize: 'contain', WebkitMaskPosition: 'top left', WebkitMaskRepeat: 'no-repeat',
                      maskImage: `url('${LOGO_URL}')`, maskSize: 'contain', maskPosition: 'top left', maskRepeat: 'no-repeat',
                      backgroundColor: '#f3e8df', width: '260px', height: '60px', opacity: 0.8
                    }} />
                  </div>

                  {/* Main Quote */}
                  <div style={{ zIndex: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px 48px' }}>
                    <span style={{ fontSize: 56, fontFamily: 'serif', lineHeight: 0.8, opacity: 0.9 }}>“</span>
                    <p className="collectible-title-serif" style={{ fontSize: 32, lineHeight: 1.5, margin: '16px 20px', fontStyle: 'normal', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                      {selectedLyric}
                    </p>
                    <span style={{ fontSize: 56, fontFamily: 'serif', lineHeight: 0.8, opacity: 0.9, alignSelf: 'flex-end' }}>”</span>
                  </div>

                  {/* Bottom Info Layout */}
                  <div style={{ zIndex: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 48px 40px 48px' }}>
                    
                    {/* Left: Track & From */}
                    <div style={{ flex: 1, paddingBottom: 8 }}>
                      <p className="collectible-title-serif" style={{ fontSize: 24, fontWeight: 400, margin: '0 0 8px 0', letterSpacing: '0.02em', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                        {selectedTrack.title}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <p className="collectible-title-serif" style={{ fontSize: 20, fontStyle: 'italic', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>from</p>
                        {/* Inline Colored SVG Logo */}
                        <div style={{
                          WebkitMaskImage: `url('${LOGO_URL}')`, WebkitMaskSize: 'contain', WebkitMaskPosition: 'left center', WebkitMaskRepeat: 'no-repeat',
                          maskImage: `url('${LOGO_URL}')`, maskSize: 'contain', maskPosition: 'left center', maskRepeat: 'no-repeat',
                          backgroundColor: '#f3e8df', width: '130px', height: '36px', opacity: 0.8
                        }} />
                      </div>
                    </div>

                    {/* Right: Customization & Nickname tightly spaced */}
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', position: 'relative' }}>
                      <p className="collectible-title-serif" style={{ fontSize: 16, margin: '0 0 -8px 0', paddingRight: 8, opacity: 0.9, zIndex: 5 }}>
                        customized for
                      </p>
                      {/* Name wrapped to prevent script font clipping */}
                      <div>
                        <span className="collectible-title-script" style={{ fontSize: '4.8em', color: '#f3e8df', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                          {(nickname.trim() || 'VEN').toLowerCase()}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* White Verification Footer */}
                <div style={{
                  backgroundColor: '#ffffff', padding: '24px 40px', color: '#111111',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 12, margin: 0, letterSpacing: '0.05em', color: '#000000', fontFamily: 'sans-serif' }}>
                      VERIFIED BY STUDIOSEVEN & TEAM7
                    </p>
                    <p style={{ margin: '4px 0 0 0', color: '#666666', fontSize: 12, fontFamily: 'sans-serif' }}>
                      Unique Non-Tangible Collection
                    </p>
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: '#333333' }}>
                    {refNumber}
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ── STAPLE FOOTER (Never Scrolls) ── */}
        <div className="collectible-solid-modal-footer" style={{ padding: '24px 40px', display: 'flex', justifyContent: 'center', gap: 16, zIndex: 10 }}>
          {step === 1 && (
            <>
              <button onClick={handleClose} style={{ padding: '14px 40px', borderRadius: 99, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: 16, cursor: 'pointer' }}>Exit</button>
              <button onClick={() => setStep(2)} style={{ padding: '14px 40px', borderRadius: 99, background: '#f3e8df', color: '#000', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Next</button>
            </>
          )}
          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} style={{ padding: '14px 40px', borderRadius: 99, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: 16, cursor: 'pointer' }}>Back</button>
              <button onClick={() => setStep(3)} style={{ padding: '14px 40px', borderRadius: 99, background: '#f3e8df', color: '#000', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Next</button>
            </>
          )}
          {step === 3 && (
            <>
              <button onClick={() => setStep(2)} style={{ padding: '14px 40px', borderRadius: 99, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: 16, cursor: 'pointer' }}>Back</button>
              <button onClick={handleNextToPreview} style={{ padding: '14px 40px', borderRadius: 99, background: '#f3e8df', color: '#000', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Generate</button>
            </>
          )}
          {step === 4 && (
            <button onClick={handleDownload} disabled={isSaving} style={{ padding: '14px 40px', borderRadius: 99, background: '#f3e8df', color: '#000', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
              {isSaving ? 'Generating PNG...' : 'Save as PNG'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}