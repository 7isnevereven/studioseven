'use client'

import { useState } from 'react'
import { supabase } from '../utils/supabase'

interface VerifyCollectibleModalProps {
  onClose: () => void;
}

export default function VerifyCollectibleModal({ onClose }: VerifyCollectibleModalProps) {
  const [refInput, setRefInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => { setIsClosing(false); onClose(); }, 300)
  }

  const handleVerify = async () => {
    if (!refInput.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const { data, error } = await supabase
        .from('virtual_collectibles')
        .select('*')
        .eq('ref_number', 'SS7-DC-' + refInput.trim().toUpperCase())
        .single()

      if (error || !data) {
        setError('No valid collectible found with this reference number.')
      } else {
        setResult(data)
      }
    } catch (e) {
      setError('An error occurred during verification.')
    }
    setLoading(false)
  }

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      
      {/* ── SOLID MODAL CONTAINER ── */}
      <div 
        className={`collectible-solid-modal ${isClosing ? 'closing' : ''}`} 
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 580, maxHeight: '90vh', position: 'relative' }}
      >
        <button onClick={handleClose} style={{ position: 'absolute', top: 24, right: 32, zIndex: 60, background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}>✕</button>

        <div className="collectible-solid-modal-header" style={{ padding: '40px 40px 20px 40px', textAlign: 'center', zIndex: 10 }}>
          <h3 className="collectible-title-serif" style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: '0 0 12px 0' }}>
            Verify Collectible
          </h3>
          <p className="collectible-title-serif" style={{ fontSize: 16, color: '#d0c4c4', margin: 0, lineHeight: 1.5 }}>
            Enter the unique 6-character code printed on the bottom right of the collectible card to check its authenticity.
          </p>
        </div>

        <div className="solid-scrollbar" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '32px 40px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
            
            {/* Split Input for Verification */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '0 24px', overflow: 'hidden' }}>
              <span style={{ fontSize: 18, color: '#aaa', fontFamily: 'monospace', letterSpacing: '0.05em' }}>SS7-DC-</span>
              <input
                type="text"
                maxLength={6}
                placeholder="XXXXXX"
                value={refInput}
                onChange={e => setRefInput(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
                style={{ flex: 1, padding: '16px 0', fontSize: 18, fontFamily: 'monospace !important', textTransform: 'uppercase', background: 'transparent', border: 'none', color: '#fff', outline: 'none', letterSpacing: '0.1em' }}
              />
            </div>

            <button className="collectible-title-serif" onClick={handleVerify} disabled={loading} style={{ padding: '16px', color: '#000', backgroundColor: '#f3e8df', border: 'none', borderRadius: 12, fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Verifying...' : 'Verify Authenticity'}
            </button>
          </div>

          {error && (
            <div className="animate-in" style={{ padding: 20, backgroundColor: 'rgba(220, 38, 38, 0.2)', border: '1px solid rgba(220, 38, 38, 0.4)', color: '#fca5a5', fontSize: 16, textAlign: 'center', borderRadius: 12 }}>
              <span className="collectible-title-serif">{error}</span>
            </div>
          )}

          {result && (
            <div className="animate-in" style={{ padding: 32, backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: 16 }}>
              <p className="collectible-title-serif" style={{ fontWeight: 700, fontSize: 20, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#f3e8df' }}>
                ✓ Authenticity Confirmed
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, textAlign: 'center' }}>
                <div>
                  <p className="collectible-title-serif" style={{ fontSize: 14, color: '#aaa', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customized For</p>
                  <div>
                    <span className="collectible-title-script" style={{ fontSize: '4.5em', color: '#fff', display: 'block', padding: '0 8px' }}>
                      {(result.name).toLowerCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="collectible-title-serif" style={{ fontSize: 14, color: '#aaa', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Track</p>
                  <p className="collectible-title-serif" style={{ margin: 0, fontSize: 22, color: '#fff' }}>{result.track_title}</p>
                </div>

                <div>
                  <p className="collectible-title-serif" style={{ fontSize: 14, color: '#aaa', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lyric</p>
                  <p className="collectible-title-serif" style={{ margin: 0, fontSize: 20, color: '#fff', fontStyle: 'italic', lineHeight: 1.5 }}>
                    “{result.lyric}”
                  </p>
                </div>
                
                <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '16px 0' }} />
                
                <p className="collectible-title-serif" style={{ margin: 0, fontSize: 13, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Created on {new Date(result.created_at).toLocaleDateString()} <br/>
                  Verified by studioseven & team7
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}