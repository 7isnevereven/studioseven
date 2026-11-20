'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import LoadingScreen from '@/components/LoadingScreen'
import { supabase } from '@/utils/supabase'
import {
  getLiveNews,
  getLiveProjects,
  getLiveArtists,
  saveNewsItem,
  deleteNewsItem,
  saveProject,
  deleteProject,
  saveArtist,
  deleteArtist,
  sortNewsByDateDesc,
  sortProjectsByDateDesc,
} from '@/utils/dataStore'
import {
  NewsItem,
  Project,
  ProjectBannerConfig,
  Track,
  TrackBadge,
  TrackCredits,
  ProjectCredits,
  HistorySection,
  Artist,
  getCoverUrl,
  getDefaultProjectCredits,
  getDefaultTrackCredits,
  isProjectScheduled,
  isNewsScheduled,
  getProjectDisplayRelease,
  formatScheduledDate,
  getDatePart,
  getTimePart,
  combineDateAndTime,
  parseTimestamp,
} from '@/data/projects'
import {
  cleanFontUrl,
  hexToRgba,
  getProjectFontStyle,
  formatDisplayTitle
} from '@/utils/projectTypography'
import type { User } from '@supabase/supabase-js'

const LOGO_URL = 'https://flrwvmfjjuyoyjeeosls.supabase.co/storage/v1/object/public/misc/ss7.png'

const TRACK_BADGES: TrackBadge[] = ['LEAD', 'SINGLE', 'DELUXE', 'BONUS', 'POEM']

// ─── ZERO TRUST SECURITY CONFIGURATION ───
const AUTHORIZED_ADMIN_EMAILS = ['vinluan.carlsteven24@gmail.com']
const LOCKOUT_KEY = 'ss7_admin_lockout_until'
const ATTEMPTS_KEY = 'ss7_admin_failed_attempts'
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes lockout
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes session expiry

// ─── PRESET STUDIO COLOR PALETTES ───
const PRESET_PALETTES = [
  { name: 'Sky Cyan', accent: '#38bdf8', soft: 'rgba(56, 189, 248, 0.40)' },
  { name: 'Emerald', accent: '#10b981', soft: 'rgba(16, 185, 129, 0.40)' },
  { name: 'Sunset Amber', accent: '#f59e0b', soft: 'rgba(245, 158, 11, 0.40)' },
  { name: 'Crimson Ember', accent: '#ef4444', soft: 'rgba(239, 68, 68, 0.40)' },
  { name: 'Electric Violet', accent: '#a855f7', soft: 'rgba(168, 85, 247, 0.40)' },
  { name: 'Deep Indigo', accent: '#6366f1', soft: 'rgba(99, 102, 241, 0.40)' },
  { name: 'Rose Petal', accent: '#f43f5e', soft: 'rgba(244, 63, 94, 0.40)' },
  { name: 'Slate Smoke', accent: '#64748b', soft: 'rgba(100, 116, 139, 0.40)' },
]

// ─── TYPOGRAPHY & CUSTOM FONT UTILITIES ───
function getAdminBannerFontStyle(project: Partial<Project> | null): React.CSSProperties {
  return getProjectFontStyle(project)
}

function BannerTypographyEditor({
  config = {},
  onChange,
  accentColor = '#38bdf8',
}: {
  config?: ProjectBannerConfig
  onChange: (updated: ProjectBannerConfig) => void
  accentColor?: string
}) {
  const [logoPreviewTheme, setLogoPreviewTheme] = useState<'dark' | 'light'>('dark')
  const titleMode = config.titleMode || 'text'
  const chosenFont = config.font || 'creato'
  const isCustom = chosenFont === 'custom'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 1. Header Mode Selector (Stylized Font Text vs Project Logo Image) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '4px',
        borderRadius: 999,
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid var(--border-subtle)',
        gap: 6
      }}>
        <button
          type="button"
          onClick={() => onChange({ ...config, titleMode: 'text' })}
          className="material-btn material-pill-sm"
          style={{
            flex: 1,
            fontSize: 12,
            fontWeight: 700,
            background: titleMode === 'text' ? 'var(--text-main)' : 'transparent',
            color: titleMode === 'text' ? 'var(--bg-base)' : 'var(--text-muted)',
            borderColor: titleMode === 'text' ? 'var(--text-main)' : 'transparent',
            padding: '7px 14px'
          }}
        >
          Stylized Font Text
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...config, titleMode: 'logo' })}
          className="material-btn material-pill-sm"
          style={{
            flex: 1,
            fontSize: 12,
            fontWeight: 700,
            background: titleMode === 'logo' ? 'var(--text-main)' : 'transparent',
            color: titleMode === 'logo' ? 'var(--bg-base)' : 'var(--text-muted)',
            borderColor: titleMode === 'logo' ? 'var(--text-main)' : 'transparent',
            padding: '7px 14px'
          }}
        >
          Project Logo Image
        </button>
      </div>

      {/* 2A. LOGO IMAGE MODE */}
      {titleMode === 'logo' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          padding: '16px 18px',
          borderRadius: 20,
          background: 'var(--bg-surface-variant)',
          border: '1px solid var(--border-default)',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>
                Project Title Logo URL
              </label>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Direct image, transparent PNG, SVG, or Google Drive link
              </span>
            </div>
            <input
              type="url"
              value={config.titleLogoUrl || ''}
              onChange={e => onChange({ ...config, titleLogoUrl: e.target.value })}
              className="material-input"
              style={{ width: '100%', padding: '10px 16px', borderRadius: 999, fontSize: 12.5 }}
              placeholder="e.g. https://.../logo.png or Google Drive share link"
            />
            <span style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginTop: 5 }}>
              Instead of rendering text, this image will be prominently displayed as the project's hero title banner.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Logo Display Height ({config.logoHeight || 80}px)
              </label>
              <select
                value={String(config.logoHeight || 80)}
                onChange={e => onChange({ ...config, logoHeight: parseInt(e.target.value) || 80 })}
                className="material-input"
                style={{ width: '100%', padding: '7px 12px', borderRadius: 999, fontSize: 12 }}
              >
                <option value="48">Small (48px)</option>
                <option value="64">Medium-Small (64px)</option>
                <option value="80">Standard (80px - Recommended)</option>
                <option value="96">Large (96px)</option>
                <option value="112">Extra Large (112px)</option>
                <option value="130">Hero Impact (130px)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Fallback Text if Logo Fails
              </label>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '7px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 999, border: '1px solid var(--border-subtle)' }}>
                Original project title
              </div>
            </div>
          </div>

          {/* Light Mode Invert Option */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: 14,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            gap: 12
          }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>
                Auto-Invert in Light Mode
              </label>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>
                Automatically inverts white logos to solid black on light/white backgrounds for maximum contrast
              </span>
            </div>
            <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.invertInLightMode !== false}
                onChange={e => onChange({ ...config, invertInLightMode: e.target.checked })}
                style={{ width: 18, height: 18, accentColor: '#38bdf8', cursor: 'pointer' }}
              />
            </label>
          </div>

          {/* Live Logo Preview Box */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Logo Preview
              </span>
              <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 999, padding: 2 }}>
                <button
                  type="button"
                  onClick={() => setLogoPreviewTheme('dark')}
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    border: 'none',
                    background: logoPreviewTheme === 'dark' ? 'var(--text-main)' : 'transparent',
                    color: logoPreviewTheme === 'dark' ? 'var(--bg-base)' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  Dark BG
                </button>
                <button
                  type="button"
                  onClick={() => setLogoPreviewTheme('light')}
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    border: 'none',
                    background: logoPreviewTheme === 'light' ? '#000000' : 'transparent',
                    color: logoPreviewTheme === 'light' ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  White BG (Light Mode)
                </button>
              </div>
            </div>
            <div style={{
              minHeight: 110,
              padding: '20px 24px',
              borderRadius: 14,
              background: logoPreviewTheme === 'dark' ? '#09090b' : '#ffffff',
              border: logoPreviewTheme === 'dark' ? '1px solid var(--border-subtle)' : '1px solid rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              transition: 'background 0.25s ease'
            }}>
              {config.titleLogoUrl ? (
                <img
                  src={getCoverUrl(config.titleLogoUrl)}
                  alt="Project Logo Preview"
                  style={{
                    maxHeight: `${config.logoHeight || 80}px`,
                    maxWidth: '100%',
                    objectFit: 'contain',
                    filter: (logoPreviewTheme === 'light' && config.invertInLightMode !== false)
                      ? 'invert(1) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.08))'
                      : 'drop-shadow(0 4px 16px rgba(0, 0, 0, 0.85))',
                    transition: 'filter 0.25s ease'
                  }}
                  onError={(e) => {
                    const target = e.currentTarget
                    target.style.display = 'none'
                  }}
                />
              ) : (
                <span style={{ fontSize: 12, color: logoPreviewTheme === 'dark' ? 'var(--text-faint)' : 'rgba(0,0,0,0.45)' }}>
                  Paste a logo URL above to view real-time rendering
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2B. STYLIZED FONT TEXT MODE */}
      {titleMode === 'text' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Banner Font Family
            </label>
            <select
              value={chosenFont}
              onChange={e => onChange({ ...config, font: e.target.value })}
              className="material-input"
              style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
            >
              <optgroup label="Condensed & Tall Poster Headlines">
                <option value="bebas">Bebas Neue (Condensed Poster Headline)</option>
                <option value="oswald">Oswald (Classic Condensed Gothic · 600/700)</option>
                <option value="anton">Anton (Ultra-Condensed Impact Sans · Heavy)</option>
                <option value="barlow-condensed">Barlow Condensed (Modern Clean Condensed)</option>
                <option value="big-shoulders">Big Shoulders Display (High-Contrast Tech Condensed)</option>
                <option value="antonio">Antonio (Delicate Tall Condensed Display)</option>
                <option value="fjalla">Fjalla One (Nordic Editorial Condensed)</option>
                <option value="saira-condensed">Saira Condensed (Heavy Industrial Condensed)</option>
              </optgroup>
              <optgroup label="Thin & Delicate Fonts">
                <option value="cormorant">Cormorant Garamond (Ultra-Thin Haute Couture Serif · 300)</option>
                <option value="montserrat-thin">Montserrat (Hairline Thin Geometric · 100/200)</option>
                <option value="raleway-thin">Raleway (Minimalist Delicate Sans · 100/200)</option>
                <option value="inter-light">Inter Light (Refined Swiss Minimalist · 200/300)</option>
              </optgroup>
              <optgroup label="Modern Grotesque & Tech">
                <option value="creato">Creato Display (Modern Bold Grotesque · What Do You Know)</option>
                <option value="sans">Plus Jakarta Sans (Clean Modern Sans)</option>
                <option value="space-grotesk">Space Grotesk (Tech Monospace Grotesque · CICATRIX)</option>
                <option value="syne">Syne (Avant-Garde Architectural Display)</option>
              </optgroup>
              <optgroup label="Cinematic & Heritage">
                <option value="playfair">Playfair Display (High-Contrast Editorial Serif)</option>
                <option value="almendra">Almendra (Gothic & Ornamental · SACCHARIN)</option>
                <option value="cinzel">Cinzel Decorative (Grand Roman Monumental)</option>
                <option value="bodoni">Bodoni Moda (Italian High-Fashion Serif)</option>
              </optgroup>
              <optgroup label="Custom Web Font">
                <option value="custom">Custom Font (Import any Google Font, CDN or Webfont)</option>
              </optgroup>
            </select>
          </div>

          {/* Custom Font Importer Box */}
          {isCustom && (
            <div style={{
              background: 'var(--bg-surface-variant)',
              border: '1px solid var(--border-default)',
              borderRadius: 18,
              padding: '14px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Custom Font Importer
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Loads live in real time
                </span>
              </div>

              <div className="admin-form-grid-2">
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Font Family Name (as used in CSS)
                  </label>
                  <input
                    type="text"
                    value={config.customFontFamily || ''}
                    onChange={e => onChange({ ...config, customFontFamily: e.target.value })}
                    className="material-input"
                    style={{ width: '100%', padding: '8px 14px', borderRadius: 999, fontSize: 13 }}
                    placeholder='e.g. "Cormorant Infant" or "Cinzel" or "Futura"'
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Font Import URL or Google Fonts Code
                  </label>
                  <input
                    type="text"
                    value={config.customFontUrl || ''}
                    onChange={e => onChange({ ...config, customFontUrl: e.target.value })}
                    className="material-input"
                    style={{ width: '100%', padding: '8px 14px', borderRadius: 999, fontSize: 13 }}
                    placeholder='e.g. https://fonts.googleapis.com/css2?family=... or paste <link>'
                  />
                </div>
              </div>

              {/* Quick preset suggestions */}
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 8 }}>Quick Google Font Presets:</span>
                <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {[
                    { name: 'Cormorant Thin', family: 'Cormorant Garamond', url: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;700&display=swap' },
                    { name: 'Montserrat Hairline', family: 'Montserrat', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;400;800&display=swap' },
                    { name: 'Cinzel Roman', family: 'Cinzel', url: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&display=swap' },
                    { name: 'Syne Avant-Garde', family: 'Syne', url: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&display=swap' },
                  ].map(preset => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => onChange({ ...config, customFontFamily: preset.family, customFontUrl: preset.url })}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '3px 10px',
                        borderRadius: 999,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(255,255,255,0.06)',
                        color: 'var(--text-main)',
                        cursor: 'pointer'
                      }}
                    >
                      + {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Typography Fine-Tuning Grid (Style, Weight, Tracking, Casing, Size, Line Height, Color, Shadow) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 10,
            padding: '12px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 16,
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Font Style
              </label>
              <select
                value={config.fontStyle || 'normal'}
                onChange={e => onChange({ ...config, fontStyle: e.target.value as any })}
                className="material-input"
                style={{ width: '100%', padding: '6px 10px', borderRadius: 999, fontSize: 12 }}
              >
                <optgroup label="Standard Posture">
                  <option value="normal">Upright (Normal / Regular)</option>
                  <option value="italic">Italic (Slanted)</option>
                  <option value="oblique">Oblique (Dynamic Forward Slant)</option>
                </optgroup>
                <optgroup label="Condensed & Narrow Cuts">
                  <option value="condensed">Condensed (Narrow 80%)</option>
                  <option value="condensed-italic">Condensed Italic (Speed & Kinetic)</option>
                  <option value="ultra-condensed">Ultra-Condensed (Extra Tight 68%)</option>
                  <option value="semi-condensed">Semi-Condensed (Subtle Compact 89%)</option>
                </optgroup>
                <optgroup label="Expanded & Wide Cuts">
                  <option value="expanded">Expanded (Wide Editorial 118%)</option>
                  <option value="expanded-italic">Expanded Italic (Sweeping Kinetic)</option>
                  <option value="ultra-expanded">Ultra-Expanded (Monumental Spread 136%)</option>
                </optgroup>
                <optgroup label="Special Typographic Cuts & Treatments">
                  <option value="small-caps">Small Caps (Classical Proportions)</option>
                  <option value="outline">Hollow Outline (Stencil / Ghost)</option>
                  <option value="outline-italic">Hollow Outline Italic</option>
                  <option value="underline">Underlined Title</option>
                  <option value="overline">Overline Modernist</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Width / Stretch
              </label>
              <select
                value={config.fontStretch || 'normal'}
                onChange={e => onChange({ ...config, fontStretch: e.target.value as any })}
                className="material-input"
                style={{ width: '100%', padding: '6px 10px', borderRadius: 999, fontSize: 12 }}
              >
                <option value="normal">Default Width (100%)</option>
                <option value="ultra-condensed">Ultra-Condensed (68% Tight)</option>
                <option value="extra-condensed">Extra-Condensed (74% Narrow)</option>
                <option value="condensed">Condensed (80% Compact)</option>
                <option value="semi-condensed">Semi-Condensed (90% Subtle)</option>
                <option value="semi-expanded">Semi-Expanded (110% Wide)</option>
                <option value="expanded">Expanded (120% Spread)</option>
                <option value="extra-expanded">Extra-Expanded (130% Dramatic)</option>
                <option value="ultra-expanded">Ultra-Expanded (142% Monumental)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Stroke / Outline
              </label>
              <select
                value={config.textStroke || 'none'}
                onChange={e => onChange({ ...config, textStroke: e.target.value as any })}
                className="material-input"
                style={{ width: '100%', padding: '6px 10px', borderRadius: 999, fontSize: 12 }}
              >
                <option value="none">Solid Fill (Standard)</option>
                <option value="outline-only">Hollow Outline (Ghost Text)</option>
                <option value="thin-stroke">Thin Outline (1px Border)</option>
                <option value="bold-stroke">Bold Outline (2px Border)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Font Weight
              </label>
              <select
                value={config.fontWeight || ''}
                onChange={e => onChange({ ...config, fontWeight: e.target.value })}
                className="material-input"
                style={{ width: '100%', padding: '6px 10px', borderRadius: 999, fontSize: 12 }}
              >
                <option value="">Default for Font</option>
                <option value="100">100 · Hairline / Ultra Thin</option>
                <option value="200">200 · Extra Light / Thin</option>
                <option value="300">300 · Light</option>
                <option value="400">400 · Regular / Normal</option>
                <option value="500">500 · Medium</option>
                <option value="600">600 · Semi-Bold</option>
                <option value="700">700 · Bold</option>
                <option value="800">800 · Extra Bold</option>
                <option value="900">900 · Black / Heavy</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Text Casing
              </label>
              <select
                value={config.textTransform || 'none'}
                onChange={e => onChange({ ...config, textTransform: e.target.value as any })}
                className="material-input"
                style={{ width: '100%', padding: '6px 10px', borderRadius: 999, fontSize: 12 }}
              >
                <option value="none">As Typed (Original)</option>
                <option value="uppercase">ALL UPPERCASE</option>
                <option value="lowercase">all lowercase</option>
                <option value="capitalize">Title Case</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Letter Spacing
              </label>
              <select
                value={config.letterSpacing ?? ''}
                onChange={e => onChange({ ...config, letterSpacing: e.target.value })}
                className="material-input"
                style={{ width: '100%', padding: '6px 10px', borderRadius: 999, fontSize: 12 }}
              >
                <option value="">Default for Font</option>
                <option value="-0.04em">Tight (-0.04em)</option>
                <option value="-0.02em">Subtle Tight (-0.02em)</option>
                <option value="0em">Normal (0)</option>
                <option value="0.06em">Wide (+0.06em)</option>
                <option value="0.12em">Spaced (+0.12em)</option>
                <option value="0.22em">Ultra Expanded (+0.22em)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Font Size Scale
              </label>
              <select
                value={config.fontSize || 'standard'}
                onChange={e => onChange({ ...config, fontSize: e.target.value as any })}
                className="material-input"
                style={{ width: '100%', padding: '6px 10px', borderRadius: 999, fontSize: 12 }}
              >
                <option value="compact">Compact (Subtle)</option>
                <option value="standard">Standard (Balanced)</option>
                <option value="large">Large (Impact)</option>
                <option value="massive">Hero Massive (Cinematic)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Line Height
              </label>
              <select
                value={config.lineHeight || 'normal'}
                onChange={e => onChange({ ...config, lineHeight: e.target.value as any })}
                className="material-input"
                style={{ width: '100%', padding: '6px 10px', borderRadius: 999, fontSize: 12 }}
              >
                <option value="tight">Tight (0.95)</option>
                <option value="normal">Normal (1.05)</option>
                <option value="relaxed">Relaxed (1.25)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Title Color
              </label>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  type="color"
                  value={config.titleColor || '#ffffff'}
                  onChange={e => onChange({ ...config, titleColor: e.target.value })}
                  style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer' }}
                  title="Pick Title Color"
                />
                <button
                  type="button"
                  onClick={() => onChange({ ...config, titleColor: undefined })}
                  style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Reset
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Shadow & Glow
              </label>
              <select
                value={config.textShadow || 'none'}
                onChange={e => onChange({ ...config, textShadow: e.target.value as any })}
                className="material-input"
                style={{ width: '100%', padding: '6px 10px', borderRadius: 999, fontSize: 12 }}
              >
                <option value="none">Clean (None)</option>
                <option value="subtle">Subtle Dark Drop</option>
                <option value="dramatic">Dramatic Contrast</option>
                <option value="glow">Project Color Aura Glow</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CALENDAR & DATE PICKER UTILITIES ───
function toDateInputValue(dateStr?: string): string {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  const parsed = new Date(dateStr)
  if (isNaN(parsed.getTime())) return ''
  const y = parsed.getFullYear()
  const m = String(parsed.getMonth() + 1).padStart(2, '0')
  const d = String(parsed.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDateFromInput(dateVal: string): string {
  if (!dateVal) return ''
  const [y, m, d] = dateVal.split('-').map(Number)
  if (!y || !m || !d) return dateVal
  const dateObj = new Date(y, m - 1, d)
  return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function toDatetimeLocalValue(isoOrDateStr?: string): string {
  if (!isoOrDateStr) return ''
  const parsed = new Date(isoOrDateStr)
  if (isNaN(parsed.getTime())) return ''
  const y = parsed.getFullYear()
  const m = String(parsed.getMonth() + 1).padStart(2, '0')
  const d = String(parsed.getDate()).padStart(2, '0')
  const h = String(parsed.getHours()).padStart(2, '0')
  const min = String(parsed.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d}T${h}:${min}`
}

export default function AdminPortalClient() {
  const [user, setUser] = useState<User | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Login form state & Brute-force protection
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [lockoutSecondsRemaining, setLockoutSecondsRemaining] = useState<number>(0)

  // Navigation & Search State
  const [activeTab, setActiveTab] = useState<'news' | 'projects' | 'showcase' | 'artists'>('news')
  const [newsSearch, setNewsSearch] = useState('')
  const [projectSearch, setProjectSearch] = useState('')
  const [artistSearch, setArtistSearch] = useState('')

  // Data
  const [newsList, setNewsList] = useState<NewsItem[]>([])
  const [projectsList, setProjectsList] = useState<Project[]>([])
  const [artistsList, setArtistsList] = useState<Artist[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // News Editor Modal
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null)
  const [originalNewsId, setOriginalNewsId] = useState<string | null>(null)
  const [savingNews, setSavingNews] = useState(false)

  // Project Editor Modal (with sub-tabs)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [originalProjectId, setOriginalProjectId] = useState<string | null>(null)
  const [projectEditorTab, setProjectEditorTab] = useState<'details' | 'typography' | 'links' | 'tracks' | 'credits' | 'history' | 'showcase'>('details')
  const [savingProject, setSavingProject] = useState(false)
  const [isCustomArtist, setIsCustomArtist] = useState(false)
  const [customArtistName, setCustomArtistName] = useState('')

  // Artist Editor Modal
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null)
  const [originalArtistId, setOriginalArtistId] = useState<string | null>(null)
  const [savingArtist, setSavingArtist] = useState(false)

  // Quick Showcase Banner Editor Modal
  const [editingShowcaseProject, setEditingShowcaseProject] = useState<Project | null>(null)
  const [savingShowcase, setSavingShowcase] = useState(false)

  // Track Editor within Project Editor
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number | null>(null)

  // Deletion Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'project' | 'news' | 'artist' | 'track' | 'history';
    id: string;
    title: string;
    details?: string;
    extraIdx?: number;
  }>({
    isOpen: false,
    type: 'project',
    id: '',
    title: ''
  })
  const [deleting, setDeleting] = useState(false)

  // Toast notifier
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type })
    setTimeout(() => setToast(null), 4000)
  }

  // ─── BRUTE FORCE LOCKOUT CHECKER ───
  useEffect(() => {
    const checkLockout = () => {
      if (typeof window === 'undefined') return
      const lockoutUntil = parseInt(localStorage.getItem(LOCKOUT_KEY) || '0', 10)
      const now = Date.now()
      if (lockoutUntil > now) {
        setLockoutSecondsRemaining(Math.ceil((lockoutUntil - now) / 1000))
      } else {
        setLockoutSecondsRemaining(0)
        localStorage.removeItem(LOCKOUT_KEY)
      }
    }

    checkLockout()
    const timer = setInterval(checkLockout, 1000)
    return () => clearInterval(timer)
  }, [])

  // ─── ZERO-TRUST IDENTITY VALIDATION ───
  const validateZeroTrustUser = useCallback((candidateUser: User | null): boolean => {
    if (!candidateUser) return false
    const candidateEmail = candidateUser.email?.toLowerCase().trim() || ''
    const isAuthorized = AUTHORIZED_ADMIN_EMAILS.some(e => e.toLowerCase() === candidateEmail)
    if (!isAuthorized) {
      supabase.auth.signOut()
      setUser(null)
      setLoginError('Access Denied: Zero-Trust verification failed. Account is not an authorized administrator.')
      return false
    }
    return true
  }, [])

  // ─── AUTH SESSION VERIFICATION ───
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user && validateZeroTrustUser(session.user)) {
        setUser(session.user)
      } else {
        setUser(null)
      }
      setCheckingAuth(false)
    }

    checkSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && validateZeroTrustUser(session.user)) {
        setUser(session.user)
      } else {
        setUser(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [validateZeroTrustUser])

  // ─── SESSION INACTIVITY AUTO-LOGOUT WATCHDOG ───
  const lastActivityRef = useRef<number>(Date.now())
  useEffect(() => {
    if (!user) return

    const updateActivity = () => {
      lastActivityRef.current = Date.now()
    }

    const activityEvents = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click']
    activityEvents.forEach(ev => window.addEventListener(ev, updateActivity, { passive: true }))

    const inactivityCheck = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current
      if (idleTime >= INACTIVITY_TIMEOUT_MS) {
        supabase.auth.signOut()
        setUser(null)
        showToast('Session expired due to inactivity (Zero-Trust Security Policy).', 'error')
      }
    }, 15000)

    return () => {
      activityEvents.forEach(ev => window.removeEventListener(ev, updateActivity))
      clearInterval(inactivityCheck)
    }
  }, [user])

  // ─── LINK & SCHEDULING UTILITIES ───
  const copyPublicLink = (path: string) => {
    if (typeof window === 'undefined') return
    const fullUrl = `${window.location.origin}${path}`
    navigator.clipboard.writeText(fullUrl).then(() => {
      showToast(`Copied link to clipboard: ${fullUrl}`)
    }).catch(() => {
      showToast(`Public Link: ${fullUrl}`)
    })
  }

  const isFutureScheduled = (dateStr?: string) => {
    if (!dateStr) return false
    const time = parseTimestamp(dateStr)
    return Boolean(time && time > Date.now())
  }

  const getTimeUntilOrAgo = (dateStr?: string) => {
    if (!dateStr) return ''
    const t = parseTimestamp(dateStr)
    if (!t) return ''
    const diff = t - Date.now()
    const isFuture = diff > 0
    const absDiff = Math.abs(diff)
    const minutes = Math.floor(absDiff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (isFuture) {
      if (days > 0) return `in ${days}d ${hours % 24}h`
      if (hours > 0) return `in ${hours}h ${minutes % 60}m`
      return `in ${Math.max(1, minutes)}m`
    } else {
      if (days > 0) return `${days}d ago`
      if (hours > 0) return `${hours}h ago`
      return `${Math.max(1, minutes)}m ago`
    }
  }

  const getTimezoneString = () => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local'
      const offset = -new Date().getTimezoneOffset() / 60
      const sign = offset >= 0 ? '+' : '-'
      const absOffset = Math.abs(offset)
      return `${tz} (GMT${sign}${absOffset})`
    } catch {
      return 'Local Time'
    }
  }

  // ─── LOAD DATA (ALWAYS ORDERED LATEST TO OLDEST, INCLUDING SCHEDULED FOR ADMIN) ───
  const loadContent = useCallback(async () => {
    setLoadingData(true)
    const [newsRes, projRes, artistsRes] = await Promise.all([
      getLiveNews(true), // Admin can view and manage scheduled news
      getLiveProjects(true), // Admin can view and manage scheduled releases
      getLiveArtists(),
    ])

    if (newsRes.error || projRes.error || artistsRes.error) {
      showToast(`Database error: ${newsRes.error || projRes.error || artistsRes.error}`, 'error')
    }

    // Always enforce latest-to-oldest ordering
    setNewsList(sortNewsByDateDesc(newsRes.data))
    setProjectsList(sortProjectsByDateDesc(projRes.data))
    setArtistsList(artistsRes.data)
    setLoadingData(false)
  }, [])

  useEffect(() => {
    if (user) {
      loadContent()
    }
  }, [user, loadContent])

  // ─── LOGIN HANDLER WITH BRUTE-FORCE DEFENSE ───
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (lockoutSecondsRemaining > 0) return

    setLoginError('')
    setLoggingIn(true)

    const cleanEmail = email.trim().toLowerCase()
    if (!AUTHORIZED_ADMIN_EMAILS.some(a => a.toLowerCase() === cleanEmail)) {
      setLoginError('Access Denied: Unrecognized administrator credentials.')
      setLoggingIn(false)
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    if (error) {
      // Increment failed attempts
      const currentAttempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10) + 1
      localStorage.setItem(ATTEMPTS_KEY, currentAttempts.toString())

      if (currentAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS
        localStorage.setItem(LOCKOUT_KEY, lockoutUntil.toString())
        localStorage.removeItem(ATTEMPTS_KEY)
        setLockoutSecondsRemaining(Math.ceil(LOCKOUT_DURATION_MS / 1000))
        setLoginError(`Security Lockout: Too many failed login attempts. Locked for 15 minutes.`)
      } else {
        const remaining = MAX_FAILED_ATTEMPTS - currentAttempts
        setLoginError(`${error.message} (${remaining} attempt${remaining === 1 ? '' : 's'} remaining before lockout)`)
      }
    } else {
      localStorage.removeItem(ATTEMPTS_KEY)
      localStorage.removeItem(LOCKOUT_KEY)
      if (validateZeroTrustUser(data.user)) {
        setUser(data.user)
      }
    }
    setLoggingIn(false)
  }

  // ─── LOGOUT HANDLER ───
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // ─── SAVE NEWS ITEM (SUPPORTS EDITABLE ID) ───
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingNews) return

    setSavingNews(true)

    // Clean any old self-referencing links
    const cleanedNews: NewsItem = {
      ...editingNews,
      url: editingNews.url === 'https://ss7-ofc.vercel.app' ? undefined : (editingNews.url || undefined)
    }

    // If ID was modified, delete the old ID record first
    if (originalNewsId && originalNewsId !== cleanedNews.id) {
      await deleteNewsItem(originalNewsId)
    }

    const { error } = await saveNewsItem(cleanedNews)
    if (error) {
      showToast(`Failed to save: ${error.message}`, 'error')
    } else {
      showToast('Article published to Supabase!')
      setEditingNews(null)
      setOriginalNewsId(null)
      loadContent()
    }
    setSavingNews(false)
  }

  // ─── DELETE PROMPTS & EXECUTION WITH PROPER CONFIRMATION MODAL ───
  const handleDeleteNews = (id: string, headline: string) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'news',
      id,
      title: headline,
      details: 'This article will be permanently removed from Supabase.'
    })
  }

  const handleDeleteProject = (id: string, title: string) => {
    const proj = projectsList.find(p => p.id === id)
    setDeleteConfirm({
      isOpen: true,
      type: 'project',
      id,
      title,
      details: proj ? `${proj.tracks.length} tracks, credits, and lore history sections` : 'Release Master'
    })
  }

  const handleDeleteArtist = (id: string, name: string) => {
    const count = projectsList.filter(p => p.artistId === id).length
    setDeleteConfirm({
      isOpen: true,
      type: 'artist',
      id,
      title: name,
      details: count > 0 ? `Associated with ${count} releases.` : 'Creator profile will be removed.'
    })
  }

  const handleExecuteDelete = async () => {
    if (!deleteConfirm.isOpen) return
    setDeleting(true)

    try {
      if (deleteConfirm.type === 'project') {
        const { error } = await deleteProject(deleteConfirm.id)
        if (error) {
          showToast(`Failed to delete release: ${error.message}`, 'error')
        } else {
          showToast(`Release "${deleteConfirm.title}" permanently deleted.`)
          if (editingProject && editingProject.id === deleteConfirm.id) {
            setEditingProject(null)
          }
          await loadContent()
        }
      } else if (deleteConfirm.type === 'news') {
        const { error } = await deleteNewsItem(deleteConfirm.id)
        if (error) {
          showToast(`Failed to delete news: ${error.message}`, 'error')
        } else {
          showToast(`Article "${deleteConfirm.title}" permanently deleted.`)
          if (editingNews && editingNews.id === deleteConfirm.id) {
            setEditingNews(null)
          }
          await loadContent()
        }
      } else if (deleteConfirm.type === 'artist') {
        const { error } = await deleteArtist(deleteConfirm.id)
        if (error) {
          showToast(`Failed to delete artist: ${error.message}`, 'error')
        } else {
          showToast(`Creator "${deleteConfirm.title}" deleted.`)
          if (editingArtist && editingArtist.id === deleteConfirm.id) {
            setEditingArtist(null)
          }
          await loadContent()
        }
      } else if (deleteConfirm.type === 'track' && editingProject && deleteConfirm.extraIdx !== undefined) {
        const updated = [...editingProject.tracks]
        updated.splice(deleteConfirm.extraIdx, 1)
        setEditingProject({ ...editingProject, tracks: updated })
        if (selectedTrackIndex === deleteConfirm.extraIdx) setSelectedTrackIndex(null)
        showToast(`Track "${deleteConfirm.title}" removed.`)
      } else if (deleteConfirm.type === 'history' && editingProject && deleteConfirm.extraIdx !== undefined) {
        const updated = [...editingProject.history]
        updated.splice(deleteConfirm.extraIdx, 1)
        setEditingProject({ ...editingProject, history: updated })
        showToast(`Lore section removed.`)
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Delete operation failed'}`, 'error')
    } finally {
      setDeleting(false)
      setDeleteConfirm({ isOpen: false, type: 'project', id: '', title: '' })
    }
  }

  // ─── SAVE PROJECT (SUPPORTS EDITABLE ID & BANNER CONTENT) ───
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProject) return

    setSavingProject(true)

    let projectToSave = { ...editingProject }

    // If a new custom artist was entered, ensure they are registered and saved to Supabase
    if (isCustomArtist && customArtistName.trim()) {
      const trimmedName = customArtistName.trim()
      const existing = artistsList.find(a => 
        a.name.toLowerCase() === trimmedName.toLowerCase() || 
        a.id.toLowerCase() === trimmedName.toLowerCase()
      )

      if (existing) {
        projectToSave.artistId = existing.id
      } else {
        const newArtistSlug = trimmedName.toLowerCase().replace(/[^a-z0-9_-]/g, '-') || `artist-${Date.now()}`
        const newArtistObj: Artist = {
          id: newArtistSlug,
          name: trimmedName,
          image: 'ss7.png',
          bio: '',
        }
        await saveArtist(newArtistObj)
        projectToSave.artistId = newArtistObj.id
        setArtistsList(prev => {
          if (prev.some(a => a.id === newArtistObj.id)) return prev
          return [...prev, newArtistObj].sort((a, b) => a.name.localeCompare(b.name))
        })
      }
    }

    // If ID was modified, delete the old ID record first
    if (originalProjectId && originalProjectId !== projectToSave.id) {
      await deleteProject(originalProjectId)
    }

    const { error } = await saveProject(projectToSave)
    if (error) {
      showToast(`Failed to save project: ${error.message}`, 'error')
    } else {
      showToast(`"${projectToSave.title}" saved to Supabase!`)
      setEditingProject(null)
      setOriginalProjectId(null)
      setIsCustomArtist(false)
      setCustomArtistName('')
      loadContent()
    }
    setSavingProject(false)
  }

  // ─── SAVE ARTIST (SUPPORTS EDITABLE ID) ───
  const handleSaveArtist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingArtist) return

    setSavingArtist(true)

    // If ID was modified, delete old record
    if (originalArtistId && originalArtistId !== editingArtist.id) {
      await deleteArtist(originalArtistId)
    }

    const cleanedArtist: Artist = {
      ...editingArtist,
      name: editingArtist.name.trim() || 'Unnamed Artist',
      id: editingArtist.id.trim() || `artist-${Date.now()}`,
      image: editingArtist.image?.trim() || 'ss7.png'
    }

    const { error } = await saveArtist(cleanedArtist)
    if (error) {
      showToast(`Failed to save artist: ${error.message}`, 'error')
    } else {
      showToast(`Artist "${cleanedArtist.name}" saved to Supabase!`)
      setEditingArtist(null)
      setOriginalArtistId(null)
      loadContent()
    }
    setSavingArtist(false)
  }


  // ─── SHOWCASE 2-SLOT ORDERING & REORDERING ───
  // Active showcase projects sorted strictly by showcaseOrder ascending
  const activeShowcase = projectsList
    .filter(p => p.featured)
    .sort((a, b) => (a.showcaseOrder ?? 999) - (b.showcaseOrder ?? 999))

  const slot1Project = activeShowcase[0] || null
  const slot2Project = activeShowcase[1] || null

  const handleSwapSlots = async () => {
    if (!slot1Project || !slot2Project) return
    await Promise.all([
      saveProject({ ...slot1Project, showcaseOrder: 2, featured: true }),
      saveProject({ ...slot2Project, showcaseOrder: 1, featured: true }),
    ])
    showToast(`Swapped hero slots: "${slot2Project.title}" is now Slot #1, "${slot1Project.title}" is now Slot #2`)
    loadContent()
  }

  const handleAssignSlot = async (project: Project, slot: 1 | 2) => {
    const currentInSlot = slot === 1 ? slot1Project : slot2Project
    const otherInSlot = slot === 1 ? slot2Project : slot1Project

    if (currentInSlot?.id === project.id) return

    if (otherInSlot?.id === project.id) {
      await handleSwapSlots()
      return
    }

    const updates: Promise<any>[] = [
      saveProject({ ...project, featured: true, showcaseOrder: slot }),
    ]

    if (currentInSlot) {
      if (!otherInSlot) {
        updates.push(saveProject({ ...currentInSlot, featured: true, showcaseOrder: slot === 1 ? 2 : 1 }))
      } else {
        updates.push(saveProject({ ...currentInSlot, featured: false, showcaseOrder: 999 }))
      }
    }

    await Promise.all(updates)
    showToast(`Assigned "${project.title}" to Hero Slot #${slot} (${slot === 1 ? 'Primary Lead' : 'Secondary Feature'})`)
    loadContent()
  }

  const handleRemoveFromSlot = async (project: Project) => {
    await saveProject({ ...project, featured: false, showcaseOrder: 999 })
    showToast(`Removed "${project.title}" from hero showcase`)
    loadContent()
  }

  const handleMoveShowcase = async (project: Project, direction: 'up' | 'down') => {
    const currentIndex = activeShowcase.findIndex(p => p.id === project.id)
    if (currentIndex === -1) return
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= activeShowcase.length) return

    const targetProject = activeShowcase[targetIndex]
    const currentSlot = currentIndex + 1
    const targetSlot = targetIndex + 1

    await Promise.all([
      saveProject({ ...project, showcaseOrder: targetSlot, featured: true }),
      saveProject({ ...targetProject, showcaseOrder: currentSlot, featured: true }),
    ])

    showToast(`Reordered banner: "${project.title}" is now Slide #${targetSlot}`)
    loadContent()
  }

  const handleToggleShowcase = async (project: Project) => {
    const isNowFeatured = !project.featured
    const nextOrder = isNowFeatured ? (slot1Project ? 2 : 1) : 999
    const updated = { ...project, featured: isNowFeatured, showcaseOrder: nextOrder }
    const { error } = await saveProject(updated)
    if (error) {
      showToast(`Failed to update showcase: ${error.message}`, 'error')
    } else {
      showToast(`${project.title} ${isNowFeatured ? 'assigned to Homescreen Hero' : 'removed from Homescreen Hero'}!`)
      loadContent()
    }
  }

  const handleSaveShowcaseBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingShowcaseProject) return
    setSavingShowcase(true)
    const { error } = await saveProject(editingShowcaseProject)
    if (error) {
      showToast(`Failed to save banner: ${error.message}`, 'error')
    } else {
      showToast(`Banner content for "${editingShowcaseProject.title}" updated!`)
      setEditingShowcaseProject(null)
      loadContent()
    }
    setSavingShowcase(false)
  }

  // ─── TRACK REORDERING HELPERS ───
  const moveTrackUp = (index: number) => {
    if (index <= 0 || !editingProject) return
    const newTracks = [...editingProject.tracks]
    const temp = newTracks[index - 1]
    newTracks[index - 1] = newTracks[index]
    newTracks[index] = temp
    setEditingProject({ ...editingProject, tracks: newTracks })
    setSelectedTrackIndex(index - 1)
  }

  const moveTrackDown = (index: number) => {
    if (!editingProject || index >= editingProject.tracks.length - 1) return
    const newTracks = [...editingProject.tracks]
    const temp = newTracks[index + 1]
    newTracks[index + 1] = newTracks[index]
    newTracks[index] = temp
    setEditingProject({ ...editingProject, tracks: newTracks })
    setSelectedTrackIndex(index + 1)
  }

  const handleAddTrack = () => {
    if (!editingProject) return
    const newTrack: Track = {
      title: `New Track ${editingProject.tracks.length + 1}`,
      badges: [],
      content: ''
    }
    setEditingProject({
      ...editingProject,
      tracks: [...editingProject.tracks, newTrack]
    })
    setSelectedTrackIndex(editingProject.tracks.length)
  }

  const handleDeleteTrack = (idx: number) => {
    if (!editingProject) return
    const track = editingProject.tracks[idx]
    if (track) {
      setDeleteConfirm({
        isOpen: true,
        type: 'track',
        id: editingProject.id,
        title: track.title || `Track ${idx + 1}`,
        details: track.content ? `Contains song lyrics/notes (${track.content.length} characters)` : 'Empty track slot',
        extraIdx: idx
      })
    }
  }

  // ─── COLOR PALETTE GENERATOR ───
  const handleAutoColor = () => {
    if (!editingProject) return
    const chosen = PRESET_PALETTES[Math.floor(Math.random() * PRESET_PALETTES.length)]
    setEditingProject({
      ...editingProject,
      accentColor: chosen.accent,
      accentSoft: chosen.soft,
    })
    showToast(`Applied ${chosen.name} studio palette!`)
  }

  // ─── ADD CHAPTER HELPER ───
  const handleAddHistorySection = () => {
    if (!editingProject) return
    const newSection: HistorySection = {
      heading: 'Chapter Title',
      body: 'Write the lore or production history for this release...'
    }
    setEditingProject({
      ...editingProject,
      history: [...editingProject.history, newSection]
    })
  }

  // ─── APPLY PROJECT CREDITS TO ALL TRACKS HELPER ───
  const handleApplyCreditsToTracks = () => {
    if (!editingProject) return
    const pc = editingProject.credits || getDefaultProjectCredits(editingProject)
    const updatedTracks = editingProject.tracks.map(t => {
      const defaultForTrack = getDefaultTrackCredits(t.title, pc)
      return {
        ...t,
        credits: {
          writtenBy: pc.writtenBy || 'VEN',
          producedBy: pc.producedBy || 'VEN',
          featuredArtists: t.credits?.featuredArtists || defaultForTrack.featuredArtists,
          additionalCredits: t.credits?.additionalCredits || defaultForTrack.additionalCredits,
        }
      }
    })
    setEditingProject({ ...editingProject, tracks: updatedTracks })
    showToast(`Applied studio credits across all ${updatedTracks.length} tracks!`)
  }

  // ─── FILTERED LISTS (ALL ORDERED LATEST TO OLDEST) ───
  const filteredNews = newsList.filter(n =>
    n.headline.toLowerCase().includes(newsSearch.toLowerCase()) ||
    (n.projectId && n.projectId.toLowerCase().includes(newsSearch.toLowerCase()))
  )

  const filteredProjects = projectsList.filter(p =>
    p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.releaseLabel.toLowerCase().includes(projectSearch.toLowerCase())
  )

  const filteredArtists = artistsList.filter(a =>
    a.name.toLowerCase().includes(artistSearch.toLowerCase()) ||
    a.id.toLowerCase().includes(artistSearch.toLowerCase())
  )

  // ─── LOADING SCREEN (VERIFYING CREDENTIALS) ───
  if (checkingAuth) {
    return <LoadingScreen />
  }

  // ─── LOGIN SCREEN (ZERO-TRUST HARDENED) ───
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 20 }}>
        {loggingIn && <LoadingScreen />}
        <div
          className="material-card"
          style={{
            width: '100%',
            maxWidth: 420,
            padding: '42px 34px',
            borderRadius: 34,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            boxShadow: 'var(--elevation-3)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--bg-surface-variant)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: 'var(--text-main)'
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              System Access
            </h1>
          </div>

          {lockoutSecondsRemaining > 0 ? (
            <div style={{
              padding: '16px 20px',
              borderRadius: 20,
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              textAlign: 'center',
              color: '#ef4444',
              fontSize: 13,
              lineHeight: 1.5
            }}>
              <strong>Brute-Force Lockout Active</strong><br />
              Too many consecutive failed attempts. Please wait {Math.floor(lockoutSecondsRemaining / 60)}m {lockoutSecondsRemaining % 60}s before retrying.
            </div>
          ) : (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {loginError && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 16,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontSize: 12.5,
                  lineHeight: 1.45
                }}>
                  {loginError}
                </div>
              )}

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Administrator Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@studioseven.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="material-input"
                  style={{ width: '100%', padding: '12px 18px', borderRadius: 999 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Master Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="material-input"
                  style={{ width: '100%', padding: '12px 18px', borderRadius: 999 }}
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn || lockoutSecondsRemaining > 0}
                className="material-btn material-pill"
                style={{
                  background: 'var(--text-main)',
                  color: 'var(--bg-base)',
                  borderColor: 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: 13.5,
                  padding: '12px 24px',
                  marginTop: 6,
                  width: '100%'
                }}
              >
                {loggingIn ? 'Authenticating...' : 'Sign In to Portal'}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-faint)', lineHeight: 1.5 }}>
            Restricted access. Unauthorized connection attempts are logged with IP & timestamp.
          </div>
        </div>
      </div>
    )
  }

  // ─── INITIAL ADMIN DATA FETCH ───
  if (loadingData && newsList.length === 0 && projectsList.length === 0 && artistsList.length === 0) {
    return <LoadingScreen />
  }

  // ─── AUTHENTICATED ADMIN PORTAL ───
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>

      {/* Floating Status Toast */}
      {toast && (
        <div
          className="material-card"
          style={{
            position: 'fixed',
            top: 24,
            right: 28,
            zIndex: 9999,
            padding: '12px 22px',
            borderRadius: 999,
            background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 600,
            boxShadow: 'var(--elevation-3)'
          }}
        >
          {toast.text}
        </div>
      )}

      {/* Fixed Admin Header */}
      <header className="navbar-wrapper">
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <img src={LOGO_URL} alt="Logo" style={{ height: 26, width: 'auto' }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(34, 197, 94, 0.12)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            padding: '3px 9px',
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 700,
            color: '#4ade80',
            letterSpacing: '0.04em'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
            <span>ADMIN CONSOLE</span>
          </div>
        </div>

        {/* Central Segmented Pill Dock */}
        <div className="nav-dock desktop-only" style={{ borderRadius: 999 }}>
          <button
            onClick={() => setActiveTab('news')}
            className={`material-btn material-pill-sm ${activeTab === 'news' ? 'active' : ''}`}
          >
            Newsroom ({newsList.length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`material-btn material-pill-sm ${activeTab === 'projects' ? 'active' : ''}`}
          >
            Releases ({projectsList.length})
          </button>
          <button
            onClick={() => setActiveTab('showcase')}
            className={`material-btn material-pill-sm ${activeTab === 'showcase' ? 'active' : ''}`}
          >
            Showcase ({activeShowcase.length})
          </button>
          <button
            onClick={() => setActiveTab('artists')}
            className={`material-btn material-pill-sm ${activeTab === 'artists' ? 'active' : ''}`}
          >
            Artists ({artistsList.length})
          </button>
        </div>

        {/* User Badge & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span className="desktop-only" style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
            {user.email}
          </span>
          <Link
            href="/"
            target="_blank"
            className="material-btn material-pill-sm desktop-only"
            style={{ fontSize: 12, textDecoration: 'none' }}
          >
            View Site ↗
          </Link>
          <button
            onClick={handleLogout}
            className="material-btn material-pill-sm"
            style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.35)', fontSize: 12 }}
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Spacer below fixed navbar */}
      <div className="navbar-spacer" />

      {/* Mobile Tab Switcher */}
      <div className="mobile-only admin-mobile-nav-bar">
        <div className="admin-scroll-tabs" style={{ width: '100%', justifyContent: 'flex-start' }}>
          <button onClick={() => setActiveTab('news')} className={`material-btn material-pill-sm ${activeTab === 'news' ? 'active' : ''}`}>News ({newsList.length})</button>
          <button onClick={() => setActiveTab('projects')} className={`material-btn material-pill-sm ${activeTab === 'projects' ? 'active' : ''}`}>Releases ({projectsList.length})</button>
          <button onClick={() => setActiveTab('showcase')} className={`material-btn material-pill-sm ${activeTab === 'showcase' ? 'active' : ''}`}>Showcase ({activeShowcase.length})</button>
          <button onClick={() => setActiveTab('artists')} className={`material-btn material-pill-sm ${activeTab === 'artists' ? 'active' : ''}`}>Artists ({artistsList.length})</button>
        </div>
      </div>

      {/* Main Container */}
      <main className="admin-main-container">

        {/* ═══════════════ TAB 1: NEWSROOM ═══════════════ */}
        {activeTab === 'news' && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 className="section-title">Newsroom Articles</h1>
              </div>

              <button
                onClick={() => {
                  const newId = `news-${Date.now()}`
                  setOriginalNewsId(null)
                  setEditingNews({
                    id: newId,
                    headline: '',
                    preview: '',
                    body: '',
                    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                    projectId: projectsList[0]?.id || '',
                    url: ''
                  })
                }}
                className="material-btn material-pill"
                style={{
                  background: 'var(--text-main)',
                  color: 'var(--bg-base)',
                  borderColor: 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: 13.5,
                  padding: '9px 20px',
                  gap: 8
                }}
              >
                <span>+ Write New Article</span>
              </button>
            </div>

            {/* Search Filter Bar */}
            <div style={{ width: '100%', position: 'relative' }}>
              <input
                type="text"
                placeholder="Search articles by headline or project..."
                value={newsSearch}
                onChange={e => setNewsSearch(e.target.value)}
                className="material-input"
                style={{ width: '100%', height: 46, borderRadius: 999, padding: '0 24px', fontSize: 13.5 }}
              />
            </div>

            {/* Grid of News Cards */}
            {loadingData ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading articles...</div>
            ) : filteredNews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-faint)' }}>No articles match your search.</div>
            ) : (
              <div className="grid-3">
                {filteredNews.map(item => {
                  const project = projectsList.find(p => p.id === item.projectId)
                  const imgUrl = item.image ? getCoverUrl(item.image) : (project ? getCoverUrl(project.coverFile) : '')

                  return (
                    <div
                      key={item.id}
                      className="material-card"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: 20,
                        height: '100%',
                        borderRadius: 30,
                        position: 'relative'
                      }}
                    >
                      {/* Image Preview */}
                      <div style={{
                        width: '100%',
                        aspectRatio: '16/9',
                        borderRadius: 22,
                        overflow: 'hidden',
                        backgroundColor: 'var(--bg-surface-solid)',
                        marginBottom: 16,
                        border: '1px solid var(--border-subtle)',
                        position: 'relative'
                      }}>
                        {imgUrl ? (
                          <img src={imgUrl} alt={item.headline} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: 12 }}>
                            No Cover Media
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {item.date} {item.projectId ? `• ${item.projectId}` : ''}
                          </span>
                          {isFutureScheduled(item.scheduledAt) && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '2px 8px',
                              borderRadius: 99,
                              background: 'rgba(56, 189, 248, 0.15)',
                              border: '1px solid rgba(56, 189, 248, 0.4)',
                              color: '#38bdf8',
                              fontSize: 10.5,
                              fontWeight: 700
                            }}>
                              <span>Scheduled</span>
                            </span>
                          )}
                        </div>

                        {isFutureScheduled(item.scheduledAt) && (
                          <div style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600 }}>
                            Goes live: {formatScheduledDate(item.scheduledAt)}
                          </div>
                        )}

                        <h3 style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.35, letterSpacing: '-0.02em' }}>
                          {item.headline}
                        </h3>

                        <p style={{
                          fontSize: 12.5,
                          color: 'var(--text-muted)',
                          lineHeight: 1.5,
                          marginTop: 4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {item.body}
                        </p>

                        {/* Admin Action Buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto', paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 6 }}>
                            <button
                              onClick={() => {
                                setOriginalNewsId(item.id)
                                setEditingNews({ ...item })
                              }}
                              className="material-btn material-pill-sm"
                              style={{ fontWeight: 700, fontSize: 12, padding: '7px 14px', width: '100%', whiteSpace: 'nowrap' }}
                            >
                              Edit Article
                            </button>
                            <button
                              onClick={() => handleDeleteNews(item.id, item.headline)}
                              className="material-btn material-pill-sm"
                              style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', fontSize: 11.5, padding: '7px 12px', whiteSpace: 'nowrap' }}
                            >
                              Delete
                            </button>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => copyPublicLink(`/news/${item.id}`)}
                              className="material-btn material-pill-sm"
                              style={{ fontSize: 11.5, padding: '6px 10px', width: '100%', whiteSpace: 'nowrap' }}
                              title="Copy Public Link"
                            >
                              Link
                            </button>
                            <Link
                              href={`/news/${item.id}`}
                              target="_blank"
                              className="material-btn material-pill-sm"
                              style={{ textDecoration: 'none', fontSize: 11.5, padding: '6px 10px', width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}
                              title="Preview Public Page"
                            >
                              View ↗
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ TAB 2: RELEASES & SONGS ═══════════════ */}
        {activeTab === 'projects' && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 className="section-title">Releases & Songs</h1>
              </div>

              <button
                onClick={() => {
                  const newId = `project-${Date.now()}`
                  const defaultCreds = getDefaultProjectCredits({ id: newId, artistId: artistsList[0]?.id || 'ven' })
                  setOriginalProjectId(null)
                  setIsCustomArtist(false)
                  setCustomArtistName('')
                  setEditingProject({
                    id: newId,
                    title: '',
                    subtitle: '',
                    description: '',
                    releasedAt: new Date().toISOString().split('T')[0],
                    releaseLabel: `Released ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
                    artistId: artistsList[0]?.id || 'ven',
                    coverFile: '',
                    accentColor: '#38bdf8',
                    accentSoft: 'rgba(56, 189, 248, 0.40)',
                    tracks: [],
                    history: [],
                    featured: false,
                    type: 'project',
                    credits: defaultCreds
                  })
                  setProjectEditorTab('details')
                  setSelectedTrackIndex(null)
                }}
                className="material-btn material-pill"
                style={{
                  background: 'var(--text-main)',
                  color: 'var(--bg-base)',
                  borderColor: 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: 13.5,
                  padding: '9px 20px',
                  gap: 8
                }}
              >
                <span>+ Add New Release</span>
              </button>
            </div>

            {/* Search Filter Bar */}
            <div style={{ width: '100%', position: 'relative' }}>
              <input
                type="text"
                placeholder="Search releases by title or label..."
                value={projectSearch}
                onChange={e => setProjectSearch(e.target.value)}
                className="material-input"
                style={{ width: '100%', height: 46, borderRadius: 999, padding: '0 24px', fontSize: 13.5 }}
              />
            </div>

            {/* Grid of Project Cards */}
            <div className="grid-4">
              {filteredProjects.map(project => {
                const coverUrl = getCoverUrl(project.coverFile)
                const accent = project.accentColor || '#38bdf8'

                return (
                  <div
                    key={project.id}
                    className="material-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: 18,
                      borderRadius: 30,
                      background: `linear-gradient(165deg, ${accent}25 0%, var(--bg-surface) 60%)`,
                      border: `1px solid ${accent}45`,
                      position: 'relative'
                    }}
                  >
                    {/* Cover Art */}
                    <div style={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: 22,
                      overflow: 'hidden',
                      backgroundColor: 'var(--bg-surface-solid)',
                      marginBottom: 14,
                      border: `1px solid ${accent}35`,
                      position: 'relative'
                    }}>
                      {coverUrl && <img src={coverUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}

                      {project.featured && (
                        <div style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          background: 'rgba(0, 0, 0, 0.75)',
                          border: '1px solid #facc15',
                          borderRadius: 999,
                          padding: '3px 8px',
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: '#facc15',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          <span>⭐</span> <span>Slide #{project.showcaseOrder ?? 1}</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                          {project.releaseLabel}
                        </span>
                        {isProjectScheduled(project) && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '2px 8px',
                            borderRadius: 99,
                            background: project.allowPreview ? 'rgba(56, 189, 248, 0.2)' : 'rgba(234, 179, 8, 0.15)',
                            border: project.allowPreview ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid rgba(234, 179, 8, 0.4)',
                            color: project.allowPreview ? '#38bdf8' : '#facc15',
                            fontSize: 10.5,
                            fontWeight: 700
                          }}>
                            <span>Scheduled {project.allowPreview ? '· Preview Allowed' : '· Hidden'}</span>
                          </span>
                        )}
                      </div>

                      {isProjectScheduled(project) && (
                        <div style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600 }}>
                          Goes live: {formatScheduledDate(project.scheduledAt || project.releasedAt, true)} ({getTimeUntilOrAgo(project.scheduledAt || project.releasedAt)})
                        </div>
                      )}

                      <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                        {project.title}
                      </h3>
                      <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                        {project.tracks.length} Tracks · {project.artistId.toUpperCase()}
                      </span>

                      {/* Action Pills */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto', paddingTop: 14 }}>
                        <button
                          type="button"
                          onClick={() => {
                            setOriginalProjectId(project.id)
                            const found = artistsList.some(a => a.id.toLowerCase() === project.artistId?.toLowerCase())
                            if (!found && project.artistId) {
                              setIsCustomArtist(true)
                              setCustomArtistName(project.artistId)
                            } else {
                              setIsCustomArtist(false)
                              setCustomArtistName('')
                            }
                            setEditingProject({
                              ...project,
                              credits: project.credits || getDefaultProjectCredits(project)
                            })
                            setProjectEditorTab('details')
                            setSelectedTrackIndex(null)
                          }}
                          className="material-btn material-pill-sm"
                          style={{
                            width: '100%',
                            fontWeight: 700,
                            fontSize: 12,
                            padding: '7px 12px',
                            background: 'var(--text-main)',
                            color: 'var(--bg-base)',
                            borderColor: 'var(--text-main)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Edit Details & Songs
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => copyPublicLink(`/projects/${project.id}`)}
                            className="material-btn material-pill-sm"
                            style={{ fontSize: 11.5, padding: '5px 8px', width: '100%', whiteSpace: 'nowrap' }}
                            title="Copy Public Link (redirects to 404 if scheduled for future)"
                          >
                            Link
                          </button>
                          <Link
                            href={`/projects/${project.id}`}
                            target="_blank"
                            className="material-btn material-pill-sm"
                            style={{ textDecoration: 'none', fontSize: 11.5, padding: '5px 8px', width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}
                            title="Preview Public Page"
                          >
                            View ↗
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(project.id, project.title)}
                            className="material-btn material-pill-sm"
                            style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', padding: '5px 10px', fontSize: 11.5, whiteSpace: 'nowrap' }}
                            title="Permanently Delete Release"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ═══════════════ TAB 3: HOMESCREEN HERO SHOWCASE (STRICTLY 2 SLOTS) ═══════════════ */}
        {activeTab === 'showcase' && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 980 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 className="section-title">Homescreen Hero Showcase</h1>
                <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4, maxWidth: 640, lineHeight: 1.5 }}>
                  The homepage displays strictly <strong>2 featured project banners</strong> edge-to-edge with no gaps or seams. Manage which release occupies each slot, swap their order, and customize typography, accent colors, backdrops, and card highlights.
                </p>
              </div>

              {slot1Project && slot2Project && (
                <button
                  type="button"
                  onClick={handleSwapSlots}
                  className="material-btn material-pill"
                  style={{
                    background: 'var(--text-main)',
                    color: 'var(--bg-base)',
                    fontWeight: 700,
                    fontSize: 13,
                    padding: '9px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <span>⇄ Swap Slots (1 & 2)</span>
                </button>
              )}
            </div>

            {/* Active 2-Slot Display Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              {/* SLOT #1: Primary Lead Banner */}
              <div className="material-card" style={{ padding: 24, borderRadius: 28, display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 99,
                      background: '#38bdf8',
                      color: '#090d16',
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '0.04em'
                    }}>
                      SLOT #1 · PRIMARY LEAD
                    </span>
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>First on Homepage</span>
                  </div>
                </div>

                {slot1Project ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ width: 68, height: 68, borderRadius: 16, overflow: 'hidden', backgroundColor: 'var(--bg-surface-solid)', flexShrink: 0, border: '1px solid var(--border-subtle)' }}>
                        <img src={getCoverUrl(slot1Project.coverFile)} alt={slot1Project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginBottom: 2 }}>{slot1Project.title}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11.5, color: slot1Project.accentColor || '#38bdf8', fontWeight: 700 }}>
                            {slot1Project.subtitle || 'Featured Release'}
                          </span>
                          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>• {slot1Project.showcaseLabel || getProjectDisplayRelease(slot1Project)}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
                          <span style={{
                            fontSize: 10.5,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: 'var(--bg-surface-variant)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            fontWeight: 600
                          }}>
                            Font: {slot1Project.bannerConfig?.font || 'Creato Display'}
                          </span>
                          <span style={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            background: slot1Project.accentColor || '#38bdf8',
                            display: 'inline-block',
                            border: '1px solid rgba(0,0,0,0.2)'
                          }} title={`Accent: ${slot1Project.accentColor || '#38bdf8'}`} />
                        </div>
                      </div>
                    </div>

                    <p style={{
                      fontSize: 12.5,
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {slot1Project.description || 'No custom banner excerpt set.'}
                    </p>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                      <button
                        type="button"
                        onClick={() => setEditingShowcaseProject({ ...slot1Project, showcaseOrder: 1, featured: true })}
                        className="material-btn material-pill-sm"
                        style={{ fontWeight: 700, fontSize: 12.5, background: 'var(--text-main)', color: 'var(--bg-base)' }}
                      >
                        Customize Banner ↗
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromSlot(slot1Project)}
                        className="material-btn material-pill-sm"
                        style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', fontSize: 12 }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '28px 16px', textAlign: 'center', background: 'var(--bg-surface-variant)', borderRadius: 20, border: '1px dashed var(--border-default)' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Slot #1 is currently empty</p>
                    <select
                      onChange={e => {
                        const proj = projectsList.find(p => p.id === e.target.value)
                        if (proj) handleAssignSlot(proj, 1)
                      }}
                      defaultValue=""
                      className="material-input"
                      style={{ padding: '8px 14px', borderRadius: 999, fontSize: 12.5, width: '100%', maxWidth: 260 }}
                    >
                      <option value="" disabled>Select release for Slot 1...</option>
                      {projectsList.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* SLOT #2: Secondary Feature Banner */}
              <div className="material-card" style={{ padding: 24, borderRadius: 28, display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 99,
                      background: '#a855f7',
                      color: '#ffffff',
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '0.04em'
                    }}>
                      SLOT #2 · SECONDARY FEATURE
                    </span>
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Second on Homepage</span>
                  </div>
                </div>

                {slot2Project ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ width: 68, height: 68, borderRadius: 16, overflow: 'hidden', backgroundColor: 'var(--bg-surface-solid)', flexShrink: 0, border: '1px solid var(--border-subtle)' }}>
                        <img src={getCoverUrl(slot2Project.coverFile)} alt={slot2Project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginBottom: 2 }}>{slot2Project.title}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11.5, color: slot2Project.accentColor || '#a855f7', fontWeight: 700 }}>
                            {slot2Project.subtitle || 'Featured Release'}
                          </span>
                          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>• {slot2Project.showcaseLabel || getProjectDisplayRelease(slot2Project)}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
                          <span style={{
                            fontSize: 10.5,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: 'var(--bg-surface-variant)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            fontWeight: 600
                          }}>
                            Font: {slot2Project.bannerConfig?.font || 'Creato Display'}
                          </span>
                          <span style={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            background: slot2Project.accentColor || '#a855f7',
                            display: 'inline-block',
                            border: '1px solid rgba(0,0,0,0.2)'
                          }} title={`Accent: ${slot2Project.accentColor || '#a855f7'}`} />
                        </div>
                      </div>
                    </div>

                    <p style={{
                      fontSize: 12.5,
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {slot2Project.description || 'No custom banner excerpt set.'}
                    </p>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                      <button
                        type="button"
                        onClick={() => setEditingShowcaseProject({ ...slot2Project, showcaseOrder: 2, featured: true })}
                        className="material-btn material-pill-sm"
                        style={{ fontWeight: 700, fontSize: 12.5, background: 'var(--text-main)', color: 'var(--bg-base)' }}
                      >
                        Customize Banner ↗
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromSlot(slot2Project)}
                        className="material-btn material-pill-sm"
                        style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', fontSize: 12 }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '28px 16px', textAlign: 'center', background: 'var(--bg-surface-variant)', borderRadius: 20, border: '1px dashed var(--border-default)' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Slot #2 is currently empty</p>
                    <select
                      onChange={e => {
                        const proj = projectsList.find(p => p.id === e.target.value)
                        if (proj) handleAssignSlot(proj, 2)
                      }}
                      defaultValue=""
                      className="material-input"
                      style={{ padding: '8px 14px', borderRadius: 999, fontSize: 12.5, width: '100%', maxWidth: 260 }}
                    >
                      <option value="" disabled>Select release for Slot 2...</option>
                      {projectsList.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Catalog Releases Banner Studio Pool */}
            <div className="material-card" style={{ padding: 28, borderRadius: 32, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700 }}>All Releases Banner Pool</h3>
                  <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                    Assign any release to Slot 1 or Slot 2, or customize its typography and presentation.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {projectsList.map(project => {
                  const cover = getCoverUrl(project.coverFile)
                  const inSlot1 = slot1Project?.id === project.id
                  const inSlot2 = slot2Project?.id === project.id

                  return (
                    <div
                      key={project.id}
                      style={{
                        padding: '12px 18px',
                        borderRadius: 18,
                        background: (inSlot1 || inSlot2) ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-surface-variant)',
                        border: (inSlot1 || inSlot2) ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                        flexWrap: 'wrap'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 220 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, overflow: 'hidden', backgroundColor: 'var(--bg-surface-solid)', flexShrink: 0 }}>
                          {cover && <img src={cover} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>{project.title}</h4>
                            {inSlot1 && (
                              <span style={{ fontSize: 10.5, fontWeight: 800, background: '#38bdf8', color: '#000', padding: '1px 8px', borderRadius: 99 }}>
                                Slot #1 Lead
                              </span>
                            )}
                            {inSlot2 && (
                              <span style={{ fontSize: 10.5, fontWeight: 800, background: '#a855f7', color: '#fff', padding: '1px 8px', borderRadius: 99 }}>
                                Slot #2 Feature
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{project.releaseLabel}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => handleAssignSlot(project, 1)}
                          disabled={inSlot1}
                          className="material-btn material-pill-sm"
                          style={{
                            fontSize: 11.5,
                            fontWeight: 700,
                            padding: '6px 12px',
                            background: inSlot1 ? 'var(--text-main)' : 'transparent',
                            color: inSlot1 ? 'var(--bg-base)' : 'var(--text-main)',
                            borderColor: inSlot1 ? 'var(--text-main)' : 'var(--border-default)'
                          }}
                        >
                          {inSlot1 ? 'Active in Slot 1' : 'Set as Slot 1'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAssignSlot(project, 2)}
                          disabled={inSlot2}
                          className="material-btn material-pill-sm"
                          style={{
                            fontSize: 11.5,
                            fontWeight: 700,
                            padding: '6px 12px',
                            background: inSlot2 ? 'var(--text-main)' : 'transparent',
                            color: inSlot2 ? 'var(--bg-base)' : 'var(--text-main)',
                            borderColor: inSlot2 ? 'var(--text-main)' : 'var(--border-default)'
                          }}
                        >
                          {inSlot2 ? 'Active in Slot 2' : 'Set as Slot 2'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingShowcaseProject({ ...project })}
                          className="material-btn material-pill-sm"
                          style={{ fontSize: 11.5, fontWeight: 700, padding: '6px 12px' }}
                        >
                          Customize Banner ↗
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ TAB 4: ARTISTS & COLLECTIVE ═══════════════ */}
        {activeTab === 'artists' && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 className="section-title">Artists & Collective</h1>
              </div>

              <button
                onClick={() => {
                  const newId = `artist-${Date.now()}`
                  setOriginalArtistId(null)
                  setEditingArtist({
                    id: newId,
                    name: '',
                    image: '',
                    bio: '',
                    spotifyUrl: '',
                    youtubeUrl: ''
                  })
                }}
                className="material-btn material-pill"
                style={{
                  background: 'var(--text-main)',
                  color: 'var(--bg-base)',
                  borderColor: 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: 13.5,
                  padding: '9px 20px',
                  gap: 8
                }}
              >
                <span>+ Add New Artist</span>
              </button>
            </div>

            {/* Search Filter Bar */}
            <div style={{ width: '100%', position: 'relative' }}>
              <input
                type="text"
                placeholder="Search artists by name or ID..."
                value={artistSearch}
                onChange={e => setArtistSearch(e.target.value)}
                className="material-input"
                style={{ width: '100%', height: 46, borderRadius: 999, padding: '0 24px', fontSize: 13.5 }}
              />
            </div>

            {/* Grid of Artist Cards */}
            <div className="grid-3">
              {filteredArtists.map(artist => {
                const imgUrl = getCoverUrl(artist.image)
                const artistProjects = projectsList.filter(p => p.artistId === artist.id)

                return (
                  <div
                    key={artist.id}
                    className="material-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      padding: '32px 24px',
                      borderRadius: 30,
                      gap: 16
                    }}
                  >
                    <div style={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '2px solid var(--border-default)',
                      backgroundColor: 'var(--bg-surface-solid)'
                    }}>
                      {imgUrl ? (
                        <img src={imgUrl} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)' }}>
                          No Avatar
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>{artist.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        ID: <code style={{ color: '#38bdf8' }}>{artist.id}</code> · {artistProjects.length} Releases
                      </span>
                    </div>

                    {artist.bio && (
                      <p style={{
                        fontSize: 12.5,
                        color: 'var(--text-muted)',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {artist.bio}
                      </p>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 6, marginTop: 'auto', paddingTop: 14, width: '100%' }}>
                      <button
                        onClick={() => {
                          setOriginalArtistId(artist.id)
                          setEditingArtist({ ...artist })
                        }}
                        className="material-btn material-pill-sm"
                        style={{ fontWeight: 700, fontSize: 12, padding: '7px 12px', whiteSpace: 'nowrap' }}
                      >
                        Edit Artist
                      </button>
                      <Link
                        href={`/artists/${artist.id}`}
                        target="_blank"
                        className="material-btn material-pill-sm"
                        style={{ textDecoration: 'none', fontSize: 11.5, padding: '6px 12px', whiteSpace: 'nowrap' }}
                        title="View Public Profile"
                      >
                        View ↗
                      </Link>
                      <button
                        onClick={() => handleDeleteArtist(artist.id, artist.name)}
                        className="material-btn material-pill-sm"
                        style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', fontSize: 11.5, padding: '6px 12px', whiteSpace: 'nowrap' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}


      </main>

      {/* ═══════════════ MODAL: NEWS ARTICLE EDITOR ═══════════════ */}
      {editingNews && (
        <div className="modal-overlay" onClick={() => setEditingNews(null)}>
          <div
            className="modal-container admin-modal-card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 720, backgroundColor: 'var(--bg-surface-solid)' }}
          >
            <div className="modal-header-fixed">
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800 }}>
                  {originalNewsId ? 'Edit Article' : 'Write New Article'}
                </h3>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  ID: {editingNews.id}
                </span>
              </div>
              <button
                onClick={() => setEditingNews(null)}
                className="material-btn"
                style={{ width: 34, height: 34, borderRadius: '50%', fontSize: 14 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNews} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div className="modal-body-scrollable">
              {/* Editable Slug / ID */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Article Slug / ID *
                </label>
                <input
                  type="text"
                  required
                  value={editingNews.id}
                  onChange={e => setEditingNews({ ...editingNews, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                  className="material-input"
                  style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                  placeholder="e.g. saccharin-premiere"
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Headline *</label>
                <input
                  type="text"
                  required
                  value={editingNews.headline}
                  onChange={e => setEditingNews({ ...editingNews, headline: e.target.value })}
                  className="material-input"
                  style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                  placeholder="Catchy headline..."
                />
              </div>

              <div className="admin-form-grid-preview">
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    Publication Date (Interactive Calendar) *
                  </label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="date"
                      value={toDateInputValue(editingNews.date)}
                      onChange={e => {
                        const val = e.target.value
                        if (val) {
                          setEditingNews({ ...editingNews, date: formatDateFromInput(val) })
                        }
                      }}
                      className="material-input"
                      style={{ width: 140, padding: '10px 12px', borderRadius: 999, colorScheme: 'dark', cursor: 'pointer' }}
                      title="Open Calendar to select date"
                    />
                    <input
                      type="text"
                      required
                      value={editingNews.date}
                      onChange={e => setEditingNews({ ...editingNews, date: e.target.value })}
                      className="material-input"
                      style={{ flex: 1, padding: '10px 16px', borderRadius: 999 }}
                      placeholder="e.g. October 8, 2026"
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Associated Project</label>
                  <select
                    value={editingNews.projectId || ''}
                    onChange={e => setEditingNews({ ...editingNews, projectId: e.target.value || undefined })}
                    className="material-input"
                    style={{ width: '100%', height: 42, padding: '0 16px', borderRadius: 999 }}
                  >
                    <option value="" style={{ background: 'var(--bg-surface)' }}>None / General Studio News</option>
                    {projectsList.map(p => (
                      <option key={p.id} value={p.id} style={{ background: 'var(--bg-surface)' }}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Schedule Article for Future Release */}
              <div style={{
                padding: '16px 20px',
                borderRadius: 22,
                background: editingNews.scheduledAt ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-surface-variant)',
                border: editingNews.scheduledAt ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h4 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-main)' }}>
                      Schedule Publication for Future Date & Time (Optional)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (editingNews.scheduledAt) {
                        setEditingNews({ ...editingNews, scheduledAt: undefined })
                      } else {
                        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
                        setEditingNews({ ...editingNews, scheduledAt: tomorrow.toISOString() })
                      }
                    }}
                    className={`material-btn material-pill-sm ${editingNews.scheduledAt ? 'active' : ''}`}
                    style={{ fontSize: 12, fontWeight: 700 }}
                  >
                    {editingNews.scheduledAt ? 'Remove Schedule (Publish Now)' : 'Schedule Future Date (Optional)'}
                  </button>
                </div>

                {editingNews.scheduledAt && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>
                        Pick Calendar Date & Time (Your Local Timezone)
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={toDatetimeLocalValue(editingNews.scheduledAt)}
                        onChange={e => {
                          const val = e.target.value
                          if (val) {
                            setEditingNews({ ...editingNews, scheduledAt: new Date(val).toISOString() })
                          }
                        }}
                        className="material-input"
                        style={{ width: '100%', padding: '10px 18px', borderRadius: 999, colorScheme: 'dark', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--bg-surface)',
                      padding: '12px 16px',
                      borderRadius: 18,
                      fontSize: 12.5,
                      gap: 12,
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                        Future Public Link: <strong style={{ color: '#38bdf8' }}>/news/{editingNews.id}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyPublicLink(`/news/${editingNews.id}`)}
                        className="material-btn material-pill-sm"
                        style={{ fontSize: 12, fontWeight: 700, padding: '5px 14px', flexShrink: 0 }}
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Cover Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={editingNews.image || ''}
                  onChange={e => setEditingNews({ ...editingNews, image: e.target.value })}
                  className="material-input"
                  style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                  placeholder="https://drive.google.com/... or leave blank to inherit project cover"
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  External Media / Source URL (Optional)
                </label>
                <input
                  type="text"
                  value={editingNews.url || ''}
                  onChange={e => setEditingNews({ ...editingNews, url: e.target.value })}
                  className="material-input"
                  style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                  placeholder="e.g. YouTube video, Spotify link, Billboard article. Leave blank for studio news."
                />
                <span style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4, display: 'block' }}>
                  Leave blank for internal studio news which already has its own dedicated page at <code>/news/[id]</code>.
                </span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Article Body Text *</label>
                <textarea
                  required
                  rows={8}
                  value={editingNews.body}
                  onChange={e => setEditingNews({ ...editingNews, body: e.target.value })}
                  className="material-input"
                  style={{ width: '100%', borderRadius: 20, padding: '14px 18px', lineHeight: 1.6 }}
                  placeholder="Write the full news story..."
                />
              </div>

              </div>

              <div className="modal-footer-fixed" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {originalNewsId && (
                  <button
                    type="button"
                    onClick={() => handleDeleteNews(editingNews.id, editingNews.headline)}
                    className="material-btn material-pill"
                    style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.45)', background: 'rgba(239, 68, 68, 0.08)', fontWeight: 700, fontSize: 12.5 }}
                  >
                    Delete Article
                  </button>
                )}
                <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
                  <button
                    type="button"
                    onClick={() => setEditingNews(null)}
                    className="material-btn material-pill"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingNews}
                    className="material-btn material-pill"
                    style={{ background: 'var(--text-main)', color: 'var(--bg-base)', fontWeight: 700 }}
                  >
                    {savingNews ? 'Publishing...' : 'Save & Publish to Supabase'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ MODAL: RELEASE & SONGS MASTER EDITOR ═══════════════ */}
      {editingProject && (
        <div className="modal-overlay" onClick={() => setEditingProject(null)}>
          <div
            className="modal-container admin-modal-card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 860, backgroundColor: 'var(--bg-surface-solid)' }}
          >
            {/* Modal Header */}
            <div className="modal-header-fixed">
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800 }}>
                  Release Master: {editingProject.title || 'New Release'}
                </h3>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  ID: {editingProject.id}
                </span>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="material-btn"
                style={{ width: 34, height: 34, borderRadius: '50%', fontSize: 14 }}
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="admin-scroll-tabs">
              <button
                type="button"
                onClick={() => setProjectEditorTab('details')}
                className={`material-btn material-pill-sm ${projectEditorTab === 'details' ? 'active' : ''}`}
              >
                Details
              </button>
              <button
                type="button"
                onClick={() => setProjectEditorTab('typography')}
                className={`material-btn material-pill-sm ${projectEditorTab === 'typography' ? 'active' : ''}`}
              >
                Title & Logo
              </button>
              <button
                type="button"
                onClick={() => setProjectEditorTab('links')}
                className={`material-btn material-pill-sm ${projectEditorTab === 'links' ? 'active' : ''}`}
              >
                Media & Colors
              </button>
              <button
                type="button"
                onClick={() => setProjectEditorTab('tracks')}
                className={`material-btn material-pill-sm ${projectEditorTab === 'tracks' ? 'active' : ''}`}
              >
                Tracks & Songs ({editingProject.tracks.length})
              </button>
              <button
                type="button"
                onClick={() => setProjectEditorTab('credits')}
                className={`material-btn material-pill-sm ${projectEditorTab === 'credits' ? 'active' : ''}`}
              >
                Credits & Personnel
              </button>
              <button
                type="button"
                onClick={() => setProjectEditorTab('history')}
                className={`material-btn material-pill-sm ${projectEditorTab === 'history' ? 'active' : ''}`}
              >
                Lore & History ({editingProject.history.length})
              </button>
              <button
                type="button"
                onClick={() => setProjectEditorTab('showcase')}
                className={`material-btn material-pill-sm ${projectEditorTab === 'showcase' ? 'active' : ''}`}
              >
                Homescreen
              </button>
            </div>

            <form onSubmit={handleSaveProject} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div className="modal-body-scrollable">

              {/* SUB-TAB: DETAILS */}
              {projectEditorTab === 'details' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Editable Project Slug */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      Project Slug / ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject.id}
                      onChange={e => setEditingProject({ ...editingProject, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                      className="material-input"
                      style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                      placeholder="e.g. saccharin"
                    />
                  </div>

                  <div className="admin-form-grid-2">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Title *</label>
                        <button
                          type="button"
                          onClick={() => setProjectEditorTab('typography')}
                          style={{
                            fontSize: 11,
                            padding: '2px 10px',
                            borderRadius: 999,
                            background: 'rgba(56, 189, 248, 0.12)',
                            color: '#38bdf8',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            cursor: 'pointer'
                          }}
                        >
                          {editingProject.bannerConfig?.titleMode === 'logo' ? 'Logo Active ↗' : 'Customize Font / Logo ↗'}
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={editingProject.title}
                        onChange={e => setEditingProject({ ...editingProject, title: e.target.value })}
                        className="material-input"
                        style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Subtitle</label>
                      <input
                        type="text"
                        value={editingProject.subtitle}
                        onChange={e => setEditingProject({ ...editingProject, subtitle: e.target.value })}
                        className="material-input"
                        style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                      />
                    </div>
                  </div>

                  {/* ─── UNIFIED RELEASE DATE & TIME SCHEDULING ─── */}
                  {(() => {
                    const curDatePart = getDatePart(editingProject.releasedAt || editingProject.scheduledAt) || new Date().toISOString().split('T')[0]
                    const curTimePart = getTimePart(editingProject.releasedAt || editingProject.scheduledAt, '12:00')
                    const projectIsScheduled = isProjectScheduled(editingProject)
                    const timeRemainingInfo = getTimeUntilOrAgo(editingProject.releasedAt || editingProject.scheduledAt)

                    const handleProjectDateChange = (newDate: string) => {
                      if (!newDate) return
                      const newIso = combineDateAndTime(newDate, curTimePart)
                      const isFuture = new Date(newIso).getTime() > Date.now()
                      const formatted = formatDateFromInput(newDate)
                      const autoLabel = isFuture ? `To Be Released ${formatted}` : `Released ${formatted}`
                      const shouldUpdate = !editingProject.releaseLabel ||
                        editingProject.releaseLabel.startsWith('Released') ||
                        editingProject.releaseLabel.startsWith('Will be released') ||
                        editingProject.releaseLabel.startsWith('To Be Released') ||
                        editingProject.releaseLabel.startsWith('To be released')

                      setEditingProject({
                        ...editingProject,
                        releasedAt: newIso,
                        scheduledAt: isFuture ? newIso : undefined,
                        releaseLabel: shouldUpdate ? autoLabel : editingProject.releaseLabel
                      })
                    }

                    const handleProjectTimeChange = (newTime: string) => {
                      if (!newTime) return
                      const newIso = combineDateAndTime(curDatePart, newTime)
                      const isFuture = new Date(newIso).getTime() > Date.now()
                      setEditingProject({
                        ...editingProject,
                        releasedAt: newIso,
                        scheduledAt: isFuture ? newIso : undefined
                      })
                    }

                    const handleProjectSetNow = () => {
                      const now = new Date()
                      const newIso = now.toISOString()
                      const formatted = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      setEditingProject({
                        ...editingProject,
                        releasedAt: newIso,
                        scheduledAt: undefined,
                        releaseLabel: `Released ${formatted}`
                      })
                    }

                    return (
                      <div style={{
                        padding: '20px 22px',
                        borderRadius: 24,
                        background: projectIsScheduled ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-surface-variant)',
                        border: projectIsScheduled ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16
                      }}>
                        {/* Section Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                          <div>
                            <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                              Release Date & Time (Unified Scheduler)
                            </h4>
                            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                              Setting a date and time in the future automatically schedules this release.
                            </p>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '4px 12px',
                              borderRadius: 99,
                              fontSize: 11,
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              background: projectIsScheduled ? 'rgba(56, 189, 248, 0.2)' : 'rgba(34, 197, 94, 0.15)',
                              border: projectIsScheduled ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(34, 197, 94, 0.4)',
                              color: projectIsScheduled ? '#38bdf8' : '#22c55e',
                            }}>
                              <span>{projectIsScheduled ? 'Scheduled Release' : 'Live / Released'}</span>
                            </span>

                            <button
                              type="button"
                              onClick={handleProjectSetNow}
                              className="material-btn material-pill-sm"
                              style={{ fontSize: 11, padding: '4px 12px', fontWeight: 700 }}
                              title="Set release date & time to right now"
                            >
                              Set to Now
                            </button>
                          </div>
                        </div>

                        {/* Interactive Date & Time Pickers */}
                        <div className="admin-form-grid-2">
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 6 }}>
                              Release Date *
                            </label>
                            <input
                              type="date"
                              required
                              value={curDatePart}
                              onChange={e => handleProjectDateChange(e.target.value)}
                              className="material-input"
                              style={{ width: '100%', padding: '10px 18px', borderRadius: 999, colorScheme: 'dark', cursor: 'pointer' }}
                              title="Pick release calendar date"
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 6 }}>
                              Release Time (Local Time) *
                            </label>
                            <input
                              type="time"
                              required
                              value={curTimePart}
                              onChange={e => handleProjectTimeChange(e.target.value)}
                              className="material-input"
                              style={{ width: '100%', padding: '10px 18px', borderRadius: 999, colorScheme: 'dark', cursor: 'pointer' }}
                              title="Pick release time"
                            />
                          </div>
                        </div>

                        {/* Time Indicator & Timezone details */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 8,
                          padding: '10px 16px',
                          borderRadius: 14,
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: 12
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                            <span>Timezone: <strong>{getTimezoneString()}</strong></span>
                          </div>

                          <div style={{ fontWeight: 600, color: projectIsScheduled ? '#38bdf8' : 'var(--text-main)' }}>
                            {projectIsScheduled ? (
                              <span>Goes live: <strong>{formatScheduledDate(editingProject.releasedAt || editingProject.scheduledAt, true)}</strong> ({timeRemainingInfo})</span>
                            ) : (
                              <span>Released: <strong>{formatScheduledDate(editingProject.releasedAt, true)}</strong> ({timeRemainingInfo})</span>
                            )}
                          </div>
                        </div>

                        {/* ─── PUBLIC PREVIEW OPTION FOR SCHEDULED RELEASES ─── */}
                        {projectIsScheduled && (
                          <div style={{
                            padding: '14px 18px',
                            borderRadius: 18,
                            background: editingProject.allowPreview ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-surface)',
                            border: editingProject.allowPreview ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid var(--border-subtle)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', flex: 1 }}>
                                <input
                                  type="checkbox"
                                  checked={Boolean(editingProject.allowPreview)}
                                  onChange={e => setEditingProject({ ...editingProject, allowPreview: e.target.checked })}
                                  style={{ width: 18, height: 18, marginTop: 2, accentColor: '#38bdf8', cursor: 'pointer' }}
                                />
                                <div>
                                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-main)', display: 'block' }}>
                                    Allow Public Preview for this Scheduled Project
                                  </span>
                                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.45, display: 'block', marginTop: 2 }}>
                                    When checked, viewers can view this project and its tracks before release. The label will show &quot;<strong>Will be released on [Date]</strong>&quot;.
                                    It will also be visible on the hero banner and homescreen showcase if marked as featured.
                                    When unchecked, visitors navigating to this project will see a 404 page until it is released.
                                  </span>
                                </div>
                              </label>

                              <span style={{
                                fontSize: 11,
                                padding: '3px 10px',
                                borderRadius: 99,
                                fontWeight: 800,
                                flexShrink: 0,
                                background: editingProject.allowPreview ? 'rgba(56, 189, 248, 0.25)' : 'var(--bg-surface-variant)',
                                color: editingProject.allowPreview ? '#38bdf8' : 'var(--text-faint)',
                                border: `1px solid ${editingProject.allowPreview ? 'rgba(56, 189, 248, 0.5)' : 'var(--border-subtle)'}`
                              }}>
                                {editingProject.allowPreview ? 'Preview Allowed' : 'Hidden (404)'}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Release Display Label */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                              Release Display Label *
                            </label>
                            <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                              {projectIsScheduled ? 'Auto-suggested: "To Be Released ..."' : 'Auto-suggested: "Released ..."'}
                            </span>
                          </div>
                          <input
                            type="text"
                            required
                            value={editingProject.releaseLabel}
                            onChange={e => setEditingProject({ ...editingProject, releaseLabel: e.target.value })}
                            className="material-input"
                            style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                            placeholder={projectIsScheduled ? "e.g. To Be Released October 30, 2026" : "e.g. Released October 8, 2026"}
                          />
                        </div>

                        {/* Public Link Box */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'var(--bg-surface)',
                          padding: '10px 16px',
                          borderRadius: 16,
                          fontSize: 12.5,
                          gap: 12,
                          border: '1px solid var(--border-subtle)'
                        }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                            Project Page Link: <strong style={{ color: '#38bdf8' }}>/projects/{editingProject.id}</strong>
                            {projectIsScheduled && (
                              <span style={{ marginLeft: 8, fontSize: 11, color: editingProject.allowPreview ? '#38bdf8' : '#eab308' }}>
                                ({editingProject.allowPreview ? 'Preview active' : 'Hidden until release'})
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={() => copyPublicLink(`/projects/${editingProject.id}`)}
                              className="material-btn material-pill-sm"
                              style={{ fontSize: 11.5, fontWeight: 700, padding: '5px 12px' }}
                            >
                              Copy Link
                            </button>
                            <a
                              href={`/projects/${editingProject.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="material-btn material-pill-sm"
                              style={{ textDecoration: 'none', fontSize: 11.5, fontWeight: 700, padding: '5px 12px' }}
                            >
                              View ↗
                            </a>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  <div className="admin-form-grid-2">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Artist</label>
                        <button
                          type="button"
                          onClick={() => {
                            const next = !isCustomArtist
                            setIsCustomArtist(next)
                            if (next) {
                              setCustomArtistName('')
                            } else {
                              setEditingProject({ ...editingProject, artistId: artistsList[0]?.id || 'ven' })
                            }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#38bdf8',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          {isCustomArtist ? '← Choose Existing' : '+ Enter New Artist'}
                        </button>
                      </div>

                      {isCustomArtist ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="text"
                            autoFocus
                            value={customArtistName}
                            onChange={e => {
                              const val = e.target.value
                              setCustomArtistName(val)
                              setEditingProject({
                                ...editingProject,
                                artistId: val.toLowerCase().replace(/[^a-z0-9_-]/g, '-') || 'ven'
                              })
                            }}
                            className="material-input"
                            style={{ width: '100%', height: 42, padding: '0 16px', borderRadius: 999 }}
                            placeholder="Enter new artist name..."
                          />
                        </div>
                      ) : (
                        <select
                          value={editingProject.artistId}
                          onChange={e => {
                            if (e.target.value === '__custom__') {
                              setIsCustomArtist(true)
                              setCustomArtistName('')
                            } else {
                              setEditingProject({ ...editingProject, artistId: e.target.value })
                            }
                          }}
                          className="material-input"
                          style={{ width: '100%', height: 42, padding: '0 16px', borderRadius: 999 }}
                        >
                          {artistsList.map(a => (
                            <option key={a.id} value={a.id} style={{ background: 'var(--bg-surface)' }}>{a.name}</option>
                          ))}
                          <option value="__custom__" style={{ background: 'var(--bg-surface)', color: '#38bdf8', fontWeight: 700 }}>
                            + Enter New Artist...
                          </option>
                        </select>
                      )}
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Project Category Type</label>
                      <select
                        value={editingProject.type || 'project'}
                        onChange={e => setEditingProject({ ...editingProject, type: e.target.value as any })}
                        className="material-input"
                        style={{ width: '100%', height: 42, padding: '0 16px', borderRadius: 999 }}
                      >
                        <option value="project" style={{ background: 'var(--bg-surface)' }}>Project</option>
                        <option value="soundtrack" style={{ background: 'var(--bg-surface)' }}>Soundtrack</option>
                        <option value="special" style={{ background: 'var(--bg-surface)' }}>Special</option>
                        <option value="final" style={{ background: 'var(--bg-surface)' }}>Final</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB: TITLE TYPOGRAPHY & LOGO */}
              {projectEditorTab === 'typography' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{
                    padding: '16px 20px',
                    borderRadius: 20,
                    background: 'var(--bg-surface-variant)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12
                  }}>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Project Title Styling & Identity</h4>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                        Customize typography or provide a direct logo image link. This custom font or logo will appear on the individual project page and homescreen banners.
                      </p>
                    </div>
                  </div>

                  {/* Live Hero Preview on Project Detail View */}
                  <div style={{
                    padding: '24px 28px',
                    borderRadius: 22,
                    background: 'var(--bg-surface-solid)',
                    border: `1px solid ${editingProject.accentColor || '#38bdf8'}35`,
                    boxShadow: `0 12px 32px rgba(0,0,0,0.4), 0 0 20px ${editingProject.accentColor || '#38bdf8'}15`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                      Project Page Live Preview (/projects/{editingProject.id})
                    </span>
                    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                      {editingProject.coverFile && (
                        <img
                          src={getCoverUrl(editingProject.coverFile)}
                          alt=""
                          style={{
                            width: 88,
                            height: 88,
                            borderRadius: 18,
                            objectFit: 'cover',
                            border: `1px solid ${editingProject.accentColor || '#38bdf8'}40`,
                            flexShrink: 0
                          }}
                        />
                      )}
                      <div style={{ flex: 1, minWidth: 220 }}>
                        {editingProject.bannerConfig?.titleMode === 'logo' && editingProject.bannerConfig.titleLogoUrl ? (
                          <div style={{ marginBottom: 4 }}>
                            <img
                              src={getCoverUrl(editingProject.bannerConfig.titleLogoUrl)}
                              alt="Logo Preview"
                              className={`project-title-logo-img ${editingProject.bannerConfig.invertInLightMode === false ? 'no-invert' : ''}`}
                              style={{
                                maxHeight: `${(editingProject.bannerConfig.logoHeight || 80) * 1.1}px`,
                                maxWidth: 'min(420px, 100%)',
                                objectFit: 'contain',
                                display: 'block',
                              }}
                            />
                          </div>
                        ) : (
                          <h2 style={{
                            ...getAdminBannerFontStyle(editingProject),
                            fontSize: 'clamp(24px, 3.8vw, 40px)',
                            margin: 0
                          }}>
                            {formatDisplayTitle(editingProject.title || 'Project Title')}
                          </h2>
                        )}
                        <span style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
                          {editingProject.subtitle || 'Release'} · {getProjectDisplayRelease(editingProject)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <BannerTypographyEditor
                    config={editingProject.bannerConfig}
                    onChange={updatedConfig => setEditingProject({
                      ...editingProject,
                      bannerConfig: updatedConfig
                    })}
                    accentColor={editingProject.accentColor}
                  />
                </div>
              )}

              {/* SUB-TAB: MEDIA & COLORS */}
              {projectEditorTab === 'links' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      Cover Art URL / Google Drive link
                    </label>
                    <input
                      type="text"
                      value={editingProject.coverFile}
                      onChange={e => setEditingProject({ ...editingProject, coverFile: e.target.value })}
                      className="material-input"
                      style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                      placeholder="https://drive.google.com/... or saccharin.png"
                    />
                  </div>

                  {/* Accent Color with Auto-Palette Generator */}
                  <div style={{ padding: 18, borderRadius: 24, background: 'var(--bg-surface-variant)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700 }}>Accent Theme Color & Cover Palette</span>
                      <button
                        type="button"
                        onClick={handleAutoColor}
                        className="material-btn material-pill-sm"
                        style={{ background: 'var(--text-main)', color: 'var(--bg-base)', fontWeight: 700, fontSize: 12 }}
                      >
                        Auto-Suggest Studio Palette
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Hex Accent Color</label>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <input
                            type="color"
                            value={editingProject.accentColor}
                            onChange={e => {
                              const hex = e.target.value
                              setEditingProject({
                                ...editingProject,
                                accentColor: hex,
                                accentSoft: `${hex}66`
                              })
                            }}
                            style={{ width: 40, height: 40, border: 'none', background: 'transparent', cursor: 'pointer' }}
                          />
                          <input
                            type="text"
                            value={editingProject.accentColor}
                            onChange={e => setEditingProject({ ...editingProject, accentColor: e.target.value })}
                            className="material-input"
                            style={{ width: '100%', padding: '8px 14px', borderRadius: 999 }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Preset Studio Palettes</label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {PRESET_PALETTES.map(p => (
                            <button
                              key={p.name}
                              type="button"
                              onClick={() => setEditingProject({ ...editingProject, accentColor: p.accent, accentSoft: p.soft })}
                              title={p.name}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                background: p.accent,
                                border: editingProject.accentColor === p.accent ? '2px solid #ffffff' : '1px solid rgba(0,0,0,0.4)',
                                cursor: 'pointer',
                                transition: 'transform 0.15s ease'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="admin-form-grid-2">
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                        Lead Single Track
                      </label>
                      <input
                        type="text"
                        value={editingProject.leadTrack || ''}
                        onChange={e => setEditingProject({ ...editingProject, leadTrack: e.target.value })}
                        className="material-input"
                        style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                        placeholder="e.g. The Video"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                        Spotify URL (Optional)
                      </label>
                      <input
                        type="text"
                        value={editingProject.spotifyUrl || ''}
                        onChange={e => setEditingProject({ ...editingProject, spotifyUrl: e.target.value })}
                        className="material-input"
                        style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                        placeholder="https://open.spotify.com/..."
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      YouTube URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={editingProject.youtubeUrl || ''}
                      onChange={e => setEditingProject({ ...editingProject, youtubeUrl: e.target.value })}
                      className="material-input"
                      style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>
              )}

              {/* SUB-TAB: TRACKS & SONGS MANAGER (WITH REORDERING) */}
              {projectEditorTab === 'tracks' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      Manage track titles, order (▲ / ▼), badges, lyrics, and poems
                    </span>
                    <button
                      type="button"
                      onClick={handleAddTrack}
                      className="material-btn material-pill-sm"
                      style={{ background: 'var(--bg-surface-variant)', fontWeight: 700 }}
                    >
                      + Add Track
                    </button>
                  </div>

                  {/* Track List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 380, overflowY: 'auto' }}>
                    {editingProject.tracks.map((track, idx) => {
                      const isExpanded = selectedTrackIndex === idx
                      return (
                        <div
                          key={idx}
                          style={{
                            padding: '14px 18px',
                            borderRadius: 20,
                            background: isExpanded ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-variant)',
                            border: isExpanded ? '1px solid var(--accent-color)' : '1px solid var(--border-subtle)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                            <div
                              onClick={() => setSelectedTrackIndex(isExpanded ? null : idx)}
                              style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flex: 1 }}
                            >
                              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-faint)' }}>{idx + 1}</span>
                              <span style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-main)' }}>{track.title}</span>
                              {track.badges?.map(b => (
                                <span key={b} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 99, background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)' }}>
                                  {b}
                                </span>
                              ))}
                              {track.credits?.featuredArtists && (
                                <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>
                                  • feat. {track.credits.featuredArtists}
                                </span>
                              )}
                              {track.credits?.writtenBy && (
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                  • {track.credits.writtenBy}
                                </span>
                              )}
                              {track.content && (
                                <span style={{ fontSize: 11, color: '#38bdf8' }}>• Lyrics/Poem</span>
                              )}
                            </div>

                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              {/* Reorder Buttons */}
                              <button
                                type="button"
                                onClick={() => moveTrackUp(idx)}
                                disabled={idx === 0}
                                className="material-btn material-pill-sm"
                                style={{ fontSize: 12, padding: '4px 8px', opacity: idx === 0 ? 0.3 : 1 }}
                                title="Move Track Up"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                onClick={() => moveTrackDown(idx)}
                                disabled={idx === editingProject.tracks.length - 1}
                                className="material-btn material-pill-sm"
                                style={{ fontSize: 12, padding: '4px 8px', opacity: idx === editingProject.tracks.length - 1 ? 0.3 : 1 }}
                                title="Move Track Down"
                              >
                                ▼
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedTrackIndex(isExpanded ? null : idx)}
                                className="material-btn material-pill-sm"
                                style={{ fontSize: 12, padding: '4px 10px' }}
                              >
                                {isExpanded ? 'Done' : 'Edit'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTrack(idx)}
                                className="material-btn material-pill-sm"
                                style={{ color: '#ef4444', fontSize: 12, padding: '4px 10px' }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          {/* Expanded Track Editor */}
                          {isExpanded && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                              <div>
                                <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Track Title</label>
                                <input
                                  type="text"
                                  value={track.title}
                                  onChange={e => {
                                    const updated = [...editingProject.tracks]
                                    updated[idx].title = e.target.value
                                    setEditingProject({ ...editingProject, tracks: updated })
                                  }}
                                  className="material-input"
                                  style={{ width: '100%', padding: '8px 16px', borderRadius: 999 }}
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Badges / Tags</label>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                  {TRACK_BADGES.map(badge => {
                                    const hasBadge = track.badges?.includes(badge)
                                    return (
                                      <button
                                        key={badge}
                                        type="button"
                                        onClick={() => {
                                          const updated = [...editingProject.tracks]
                                          const currentBadges = updated[idx].badges || []
                                          updated[idx].badges = hasBadge
                                            ? currentBadges.filter(b => b !== badge)
                                            : [...currentBadges, badge]
                                          setEditingProject({ ...editingProject, tracks: updated })
                                        }}
                                        className={`material-btn material-pill-sm ${hasBadge ? 'active' : ''}`}
                                        style={{ fontSize: 11 }}
                                      >
                                        {badge}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>

                              <div>
                                <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                                  Lyrics or Poem Text (Optional)
                                </label>
                                <textarea
                                  rows={5}
                                  value={track.content || ''}
                                  onChange={e => {
                                    const updated = [...editingProject.tracks]
                                    updated[idx].content = e.target.value
                                    setEditingProject({ ...editingProject, tracks: updated })
                                  }}
                                  className="material-input"
                                  style={{ width: '100%', borderRadius: 16, padding: '10px 14px', lineHeight: 1.5 }}
                                  placeholder="Paste lyrics or written poem..."
                                />
                              </div>

                              {/* Track-level Individual Credits */}
                              <div style={{
                                padding: 14,
                                borderRadius: 18,
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid var(--border-subtle)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 10,
                                marginTop: 4
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-main)' }}>
                                    Track Credits & Personnel
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...editingProject.tracks]
                                      const pc = editingProject.credits || getDefaultProjectCredits(editingProject)
                                      const defaultCreds = getDefaultTrackCredits(track.title, pc)
                                      updated[idx].credits = defaultCreds
                                      setEditingProject({ ...editingProject, tracks: updated })
                                    }}
                                    className="material-btn material-pill-sm"
                                    style={{ fontSize: 10.5, padding: '2px 8px' }}
                                  >
                                    Use Project Defaults
                                  </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                  <div>
                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>
                                      Written By
                                    </label>
                                    <input
                                      type="text"
                                      value={track.credits?.writtenBy ?? ''}
                                      onChange={e => {
                                        const updated = [...editingProject.tracks]
                                        updated[idx].credits = {
                                          ...updated[idx].credits,
                                          writtenBy: e.target.value
                                        }
                                        setEditingProject({ ...editingProject, tracks: updated })
                                      }}
                                      className="material-input"
                                      style={{ width: '100%', padding: '6px 12px', borderRadius: 999, fontSize: 12 }}
                                      placeholder={editingProject.credits?.writtenBy || 'VEN'}
                                    />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>
                                      Produced By
                                    </label>
                                    <input
                                      type="text"
                                      value={track.credits?.producedBy ?? ''}
                                      onChange={e => {
                                        const updated = [...editingProject.tracks]
                                        updated[idx].credits = {
                                          ...updated[idx].credits,
                                          producedBy: e.target.value
                                        }
                                        setEditingProject({ ...editingProject, tracks: updated })
                                      }}
                                      className="material-input"
                                      style={{ width: '100%', padding: '6px 12px', borderRadius: 999, fontSize: 12 }}
                                      placeholder={editingProject.credits?.producedBy || 'VEN'}
                                    />
                                  </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                  <div>
                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>
                                      Featured Artist(s)
                                    </label>
                                    <input
                                      type="text"
                                      value={track.credits?.featuredArtists ?? ''}
                                      onChange={e => {
                                        const updated = [...editingProject.tracks]
                                        updated[idx].credits = {
                                          ...updated[idx].credits,
                                          featuredArtists: e.target.value
                                        }
                                        setEditingProject({ ...editingProject, tracks: updated })
                                      }}
                                      className="material-input"
                                      style={{ width: '100%', padding: '6px 12px', borderRadius: 999, fontSize: 12 }}
                                      placeholder="e.g. 13 or JHUZZ"
                                    />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>
                                      Additional Credits / Notes
                                    </label>
                                    <input
                                      type="text"
                                      value={track.credits?.additionalCredits ?? ''}
                                      onChange={e => {
                                        const updated = [...editingProject.tracks]
                                        updated[idx].credits = {
                                          ...updated[idx].credits,
                                          additionalCredits: e.target.value
                                        }
                                        setEditingProject({ ...editingProject, tracks: updated })
                                      }}
                                      className="material-input"
                                      style={{ width: '100%', padding: '6px 12px', borderRadius: 999, fontSize: 12 }}
                                      placeholder="e.g. Mixing, Mastering, Guitar solo"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* SUB-TAB: CREDITS & PERSONNEL */}
              {projectEditorTab === 'credits' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{
                    padding: '16px 20px',
                    borderRadius: 22,
                    background: 'var(--bg-surface-variant)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12
                  }}>
                    <div>
                      <h4 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-main)' }}>
                        Executive & Project Credits
                      </h4>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const def = getDefaultProjectCredits(editingProject)
                          setEditingProject({
                            ...editingProject,
                            credits: { ...def }
                          })
                          showToast('Reset project credits to canonical studio defaults!')
                        }}
                        className="material-btn material-pill-sm"
                        style={{ fontSize: 12 }}
                      >
                        Reset Defaults
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyCreditsToTracks}
                        className="material-btn material-pill-sm"
                        style={{
                          background: 'var(--text-main)',
                          color: 'var(--bg-base)',
                          fontWeight: 700,
                          fontSize: 12
                        }}
                      >
                        Apply to All {editingProject.tracks.length} Tracks
                      </button>
                    </div>
                  </div>

                  <div className="admin-form-grid-2">
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                        Written By (Songwriting / Composition)
                      </label>
                      <input
                        type="text"
                        value={editingProject.credits?.writtenBy ?? 'VEN'}
                        onChange={e => setEditingProject({
                          ...editingProject,
                          credits: {
                            ...(editingProject.credits || getDefaultProjectCredits(editingProject)),
                            writtenBy: e.target.value
                          }
                        })}
                        className="material-input"
                        style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                        placeholder="e.g. VEN"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                        Produced By (Beat Production / Sound Engineering)
                      </label>
                      <input
                        type="text"
                        value={editingProject.credits?.producedBy ?? 'VEN'}
                        onChange={e => setEditingProject({
                          ...editingProject,
                          credits: {
                            ...(editingProject.credits || getDefaultProjectCredits(editingProject)),
                            producedBy: e.target.value
                          }
                        })}
                        className="material-input"
                        style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                        placeholder="e.g. VEN"
                      />
                    </div>
                  </div>

                  <div className="admin-form-grid-2">
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                        Released Under (Label / Imprint)
                      </label>
                      <input
                        type="text"
                        value={editingProject.credits?.releasedUnder ?? 'studioseven'}
                        onChange={e => setEditingProject({
                          ...editingProject,
                          credits: {
                            ...(editingProject.credits || getDefaultProjectCredits(editingProject)),
                            releasedUnder: e.target.value
                          }
                        })}
                        className="material-input"
                        style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                        placeholder="e.g. studioseven"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                        Collaboration for Release (Studio / Partner)
                      </label>
                      <input
                        type="text"
                        value={editingProject.credits?.collaboration ?? ''}
                        onChange={e => setEditingProject({
                          ...editingProject,
                          credits: {
                            ...(editingProject.credits || getDefaultProjectCredits(editingProject)),
                            collaboration: e.target.value
                          }
                        })}
                        className="material-input"
                        style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                        placeholder="e.g. NAMUJANE Studios"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      Featured Artist(s) on Project
                    </label>
                    <input
                      type="text"
                      value={editingProject.credits?.featuredArtists ?? ''}
                      onChange={e => setEditingProject({
                        ...editingProject,
                        credits: {
                          ...(editingProject.credits || getDefaultProjectCredits(editingProject)),
                          featuredArtists: e.target.value
                        }
                      })}
                      className="material-input"
                      style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                      placeholder="e.g. 13, JHUZZ"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      Additional Executive Production Notes / Memoriam
                    </label>
                    <textarea
                      rows={3}
                      value={editingProject.credits?.additionalNotes ?? ''}
                      onChange={e => setEditingProject({
                        ...editingProject,
                        credits: {
                          ...(editingProject.credits || getDefaultProjectCredits(editingProject)),
                          additionalNotes: e.target.value
                        }
                      })}
                      className="material-input"
                      style={{ width: '100%', borderRadius: 16, padding: '10px 14px', lineHeight: 1.5 }}
                      placeholder="e.g. Official Motion Picture Soundtrack developed alongside NAMUJANE Studios."
                    />
                  </div>
                </div>
              )}

              {/* SUB-TAB: LORE & HISTORY */}
              {projectEditorTab === 'history' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={handleAddHistorySection}
                      className="material-btn material-pill-sm"
                      style={{ fontWeight: 700 }}
                    >
                      + Add Chapter
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 380, overflowY: 'auto' }}>
                    {editingProject.history.map((sec, idx) => (
                      <div key={idx} style={{ padding: '16px 20px', borderRadius: 20, background: 'var(--bg-surface-variant)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={sec.heading}
                            onChange={e => {
                              const updated = [...editingProject.history]
                              updated[idx].heading = e.target.value
                              setEditingProject({ ...editingProject, history: updated })
                            }}
                            className="material-input"
                            style={{ flex: 1, padding: '8px 14px', borderRadius: 999, fontWeight: 700, fontSize: 14 }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteConfirm({
                                isOpen: true,
                                type: 'history',
                                id: editingProject.id,
                                title: sec.heading || `Lore Section ${idx + 1}`,
                                details: sec.body ? `Contains narrative text (${sec.body.length} characters)` : undefined,
                                extraIdx: idx
                              })
                            }}
                            className="material-btn material-pill-sm"
                            style={{ color: '#ef4444', marginLeft: 10 }}
                            title="Remove Lore Section"
                          >
                            ✕
                          </button>
                        </div>
                        <textarea
                          value={sec.body}
                          onChange={e => {
                            const updated = [...editingProject.history]
                            updated[idx].body = e.target.value
                            setEditingProject({ ...editingProject, history: updated })
                          }}
                          className="material-input"
                          style={{ width: '100%', minHeight: 90, borderRadius: 16, padding: '12px 14px', lineHeight: 1.6 }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-TAB: SHOWCASE SETTINGS */}
              {projectEditorTab === 'showcase' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderRadius: 20, background: 'var(--bg-surface-variant)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 700 }}>Homepage Hero Banner Slot</h4>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Assign this release to one of the 2 homescreen hero banner positions
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => setEditingProject({ ...editingProject, featured: true, showcaseOrder: 1 })}
                        className="material-btn material-pill-sm"
                        style={{
                          fontWeight: 700,
                          fontSize: 12,
                          background: (editingProject.featured && editingProject.showcaseOrder === 1) ? '#38bdf8' : 'var(--bg-surface)',
                          color: (editingProject.featured && editingProject.showcaseOrder === 1) ? '#000' : 'var(--text-main)'
                        }}
                      >
                        Slot #1 (Lead)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProject({ ...editingProject, featured: true, showcaseOrder: 2 })}
                        className="material-btn material-pill-sm"
                        style={{
                          fontWeight: 700,
                          fontSize: 12,
                          background: (editingProject.featured && editingProject.showcaseOrder === 2) ? '#a855f7' : 'var(--bg-surface)',
                          color: (editingProject.featured && editingProject.showcaseOrder === 2) ? '#fff' : 'var(--text-main)'
                        }}
                      >
                        Slot #2 (Feature)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProject({ ...editingProject, featured: false, showcaseOrder: 999 })}
                        className="material-btn material-pill-sm"
                        style={{
                          fontWeight: 600,
                          fontSize: 12,
                          background: !editingProject.featured ? 'var(--text-main)' : 'var(--bg-surface)',
                          color: !editingProject.featured ? 'var(--bg-base)' : 'var(--text-muted)'
                        }}
                      >
                        Not in Hero
                      </button>
                    </div>
                  </div>

                  <div>
                    <BannerTypographyEditor
                      config={editingProject.bannerConfig}
                      onChange={updatedConfig => setEditingProject({
                        ...editingProject,
                        bannerConfig: updatedConfig
                      })}
                      accentColor={editingProject.accentColor}
                    />
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      Showcase Banner Subtitle / Tagline
                    </label>
                    <input
                      type="text"
                      value={editingProject.showcaseLabel || ''}
                      onChange={e => setEditingProject({ ...editingProject, showcaseLabel: e.target.value })}
                      className="material-input"
                      style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                      placeholder="e.g. RELEASED JAN 21, 2026 or OFFICIAL MOVIE SOUNDTRACK"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      Showcase Hero Banner Description
                    </label>
                    <textarea
                      value={editingProject.description || ''}
                      onChange={e => setEditingProject({ ...editingProject, description: e.target.value })}
                      className="material-input"
                      style={{ width: '100%', minHeight: 80, borderRadius: 18, padding: '12px 16px', lineHeight: 1.5 }}
                      placeholder="Concise 1-2 sentence description shown in the homescreen hero banner..."
                    />
                  </div>

                  <div className="admin-form-grid-2">
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                        Right Stage Card Label (e.g. SELECTIONS)
                      </label>
                      <input
                        type="text"
                        value={editingProject.bannerConfig?.cardLabel || ''}
                        onChange={e => setEditingProject({
                          ...editingProject,
                          bannerConfig: { ...editingProject.bannerConfig, cardLabel: e.target.value }
                        })}
                        className="material-input"
                        style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                        placeholder="SELECTIONS or ORIGINAL SCORE"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                        Right Stage Card Tag (e.g. Lead · The Video)
                      </label>
                      <input
                        type="text"
                        value={editingProject.bannerConfig?.cardTag || ''}
                        onChange={e => setEditingProject({
                          ...editingProject,
                          bannerConfig: { ...editingProject.bannerConfig, cardTag: e.target.value }
                        })}
                        className="material-input"
                        style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                        placeholder="Lead · The Video or Track Highlights"
                      />
                    </div>
                  </div>
                </div>
              )}

              </div>

              {/* Footer Actions */}
              <div className="modal-footer-fixed" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {originalProjectId && (
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(editingProject.id, editingProject.title)}
                    className="material-btn material-pill"
                    style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.45)', background: 'rgba(239, 68, 68, 0.08)', fontWeight: 700, fontSize: 12.5 }}
                  >
                    Delete Release
                  </button>
                )}
                <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="material-btn material-pill"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProject}
                    className="material-btn material-pill"
                    style={{ background: 'var(--text-main)', color: 'var(--bg-base)', fontWeight: 700 }}
                  >
                    {savingProject ? 'Saving...' : 'Save Release to Supabase'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ MODAL: HERO BANNER STUDIO ═══════════════ */}
      {editingShowcaseProject && (
        <div className="modal-overlay" onClick={() => setEditingShowcaseProject(null)}>
          <div
            className="modal-container admin-modal-card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 840, backgroundColor: 'var(--bg-surface-solid)' }}
          >
            <div className="modal-header-fixed">
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800 }}>
                  Hero Banner Studio: {editingShowcaseProject.title}
                </h3>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Customize all visual elements, fonts, colors, links, and stage cards for this banner
                </span>
              </div>
              <button
                onClick={() => setEditingShowcaseProject(null)}
                className="material-btn"
                style={{ width: 34, height: 34, borderRadius: '50%', fontSize: 14 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveShowcaseBanner} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div className="modal-body-scrollable" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

                {/* 1. Interactive Live Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                    Live Banner Interactive Preview
                  </span>
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    borderRadius: 20,
                    overflow: 'hidden',
                    backgroundColor: '#000000',
                    minHeight: 200,
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 16px 36px rgba(0,0,0,0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '24px 28px',
                    boxSizing: 'border-box'
                  }}>
                    {/* Backdrop Cover Art */}
                    {editingShowcaseProject.coverFile && (
                      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                        <img
                          src={getCoverUrl(editingShowcaseProject.coverFile)}
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center 30%',
                            filter: 'brightness(0.92) contrast(1.05) saturate(1.1)'
                          }}
                        />
                      </div>
                    )}
                    {/* Dark theatrical horizontal wash */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(90deg, rgba(9, 9, 11, 0.92) 0%, rgba(9, 9, 11, 0.68) 42%, rgba(9, 9, 11, 0.2) 75%, rgba(9, 9, 11, 0.04) 100%)',
                      pointerEvents: 'none'
                    }} />

                    {/* Aesthetic Project-Specific Color Gradient: From bottom to transparent at the top */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      pointerEvents: 'none',
                      background: `
                        linear-gradient(to top, 
                          ${hexToRgba(editingShowcaseProject.accentColor || '#38bdf8', 0.62)} 0%, 
                          ${hexToRgba(editingShowcaseProject.accentColor || '#38bdf8', 0.38)} 14%, 
                          ${hexToRgba(editingShowcaseProject.accentColor || '#38bdf8', 0.16)} 32%, 
                          ${hexToRgba(editingShowcaseProject.accentColor || '#38bdf8', 0.04)} 52%, 
                          rgba(0, 0, 0, 0) 70%
                        ),
                        radial-gradient(ellipse 120% 50% at 50% 100%, ${hexToRgba(editingShowcaseProject.accentColor || '#38bdf8', 0.38)} 0%, ${hexToRgba(editingShowcaseProject.accentColor || '#38bdf8', 0.12)} 42%, rgba(0, 0, 0, 0) 72%)
                      `
                    }} />

                    {/* Preview Content Grid */}
                    <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', width: '100%', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ maxWidth: 420, minWidth: 260, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, marginBottom: 6 }}>
                          <span style={{ color: editingShowcaseProject.accentColor || '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {editingShowcaseProject.subtitle || 'Featured Release'}
                          </span>
                          <span style={{ color: 'rgba(255,255,255,0.4)' }}>·</span>
                          <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                            {editingShowcaseProject.showcaseLabel || editingShowcaseProject.releaseLabel || 'Released'}
                          </span>
                        </div>

                        {/* Dynamic Custom Font Stylesheet in Preview */}
                        {editingShowcaseProject.bannerConfig?.customFontUrl && (
                          <link rel="stylesheet" href={cleanFontUrl(editingShowcaseProject.bannerConfig.customFontUrl)} />
                        )}

                        {editingShowcaseProject.bannerConfig?.titleMode === 'logo' && editingShowcaseProject.bannerConfig.titleLogoUrl ? (
                          <div style={{ marginBottom: 8 }}>
                            <img
                              src={getCoverUrl(editingShowcaseProject.bannerConfig.titleLogoUrl)}
                              alt={editingShowcaseProject.title}
                              style={{
                                maxHeight: `${Math.min(editingShowcaseProject.bannerConfig.logoHeight || 60, 75)}px`,
                                maxWidth: '100%',
                                objectFit: 'contain',
                                display: 'block',
                                filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.8))'
                              }}
                            />
                          </div>
                        ) : (
                          <h3 style={{
                            color: '#ffffff',
                            fontSize: 22,
                            margin: '0 0 6px 0',
                            lineHeight: 1.25,
                            ...getAdminBannerFontStyle(editingShowcaseProject)
                          }}>
                            {editingShowcaseProject.title}
                          </h3>
                        )}

                        <p style={{
                          color: 'rgba(255,255,255,0.78)',
                          fontSize: 12,
                          lineHeight: 1.45,
                          margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {editingShowcaseProject.description || 'Compelling project description...'}
                        </p>

                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          <span style={{
                            background: editingShowcaseProject.accentColor || '#38bdf8',
                            color: '#090d16',
                            fontSize: 11,
                            fontWeight: 800,
                            padding: '4px 14px',
                            borderRadius: 99
                          }}>
                            Explore Release ↗
                          </span>
                          {editingShowcaseProject.spotifyUrl && (
                            <span style={{
                              background: 'rgba(255,255,255,0.12)',
                              color: '#fff',
                              fontSize: 11,
                              fontWeight: 600,
                              padding: '4px 12px',
                              borderRadius: 99,
                              border: '1px solid rgba(255,255,255,0.2)'
                            }}>
                              Spotify
                            </span>
                          )}
                          {editingShowcaseProject.youtubeUrl && (
                            <span style={{
                              background: 'rgba(255,255,255,0.12)',
                              color: '#fff',
                              fontSize: 11,
                              fontWeight: 600,
                              padding: '4px 12px',
                              borderRadius: 99,
                              border: '1px solid rgba(255,255,255,0.2)'
                            }}>
                              Listen
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Stage Preview Card */}
                      <div style={{
                        background: 'rgba(10, 10, 12, 0.72)',
                        border: `1px solid ${editingShowcaseProject.accentColor ? `${editingShowcaseProject.accentColor}33` : 'rgba(255, 255, 255, 0.12)'}`,
                        borderRadius: 14,
                        padding: '12px 16px',
                        width: 180,
                        boxShadow: `0 10px 24px rgba(0,0,0,0.5), 0 0 20px ${editingShowcaseProject.accentColor ? `${editingShowcaseProject.accentColor}18` : 'transparent'}`,
                        flexShrink: 0
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, fontWeight: 700, marginBottom: 6 }}>
                          <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                            {editingShowcaseProject.bannerConfig?.cardLabel || 'SELECTIONS'}
                          </span>
                          <span style={{ color: editingShowcaseProject.accentColor || '#38bdf8' }}>
                            {editingShowcaseProject.bannerConfig?.cardTag || (editingShowcaseProject.leadTrack ? `Lead · ${editingShowcaseProject.leadTrack}` : 'Highlights')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: '#fff' }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            01 {editingShowcaseProject.tracks?.[0]?.title || 'Track 1'}
                          </div>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            02 {editingShowcaseProject.tracks?.[1]?.title || 'Track 2'}
                          </div>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            03 {editingShowcaseProject.tracks?.[2]?.title || 'Track 3'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Slot Assignment Controls */}
                <div style={{
                  padding: '14px 18px',
                  borderRadius: 18,
                  background: 'var(--bg-surface-variant)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap'
                }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>
                      Homepage Hero Slot
                    </label>
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      Choose which of the 2 homescreen hero banner slots this project occupies.
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setEditingShowcaseProject({ ...editingShowcaseProject, featured: true, showcaseOrder: 1 })}
                      className="material-btn material-pill-sm"
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        padding: '6px 14px',
                        background: (editingShowcaseProject.featured && editingShowcaseProject.showcaseOrder === 1) ? '#38bdf8' : 'var(--bg-surface)',
                        color: (editingShowcaseProject.featured && editingShowcaseProject.showcaseOrder === 1) ? '#000' : 'var(--text-main)'
                      }}
                    >
                      Slot #1 (Lead)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingShowcaseProject({ ...editingShowcaseProject, featured: true, showcaseOrder: 2 })}
                      className="material-btn material-pill-sm"
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        padding: '6px 14px',
                        background: (editingShowcaseProject.featured && editingShowcaseProject.showcaseOrder === 2) ? '#a855f7' : 'var(--bg-surface)',
                        color: (editingShowcaseProject.featured && editingShowcaseProject.showcaseOrder === 2) ? '#fff' : 'var(--text-main)'
                      }}
                    >
                      Slot #2 (Feature)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingShowcaseProject({ ...editingShowcaseProject, featured: false, showcaseOrder: 999 })}
                      className="material-btn material-pill-sm"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '6px 14px',
                        background: !editingShowcaseProject.featured ? 'var(--text-main)' : 'var(--bg-surface)',
                        color: !editingShowcaseProject.featured ? 'var(--bg-base)' : 'var(--text-muted)'
                      }}
                    >
                      Off (Not in Hero)
                    </button>
                  </div>
                </div>

                {/* 3. Core Typography & Copy Fields */}
                <div className="admin-form-grid-2">
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      Banner Headline Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingShowcaseProject.title}
                      onChange={e => setEditingShowcaseProject({ ...editingShowcaseProject, title: e.target.value })}
                      className="material-input"
                      style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                      placeholder="e.g. What Do You Know?"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      Release Subtitle / Classification
                    </label>
                    <input
                      type="text"
                      value={editingShowcaseProject.subtitle || ''}
                      onChange={e => setEditingShowcaseProject({ ...editingShowcaseProject, subtitle: e.target.value })}
                      className="material-input"
                      style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                      placeholder="e.g. THE 7TH PROJECT or OFFICIAL SOUNDTRACK"
                    />
                  </div>
                </div>

                {/* 4. Banner Typography Studio & Tagline */}
                <div>
                  <BannerTypographyEditor
                    config={editingShowcaseProject.bannerConfig}
                    onChange={updatedConfig => setEditingShowcaseProject({
                      ...editingShowcaseProject,
                      bannerConfig: updatedConfig
                    })}
                    accentColor={editingShowcaseProject.accentColor}
                  />
                </div>

                <div style={{ marginTop: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    Release Tagline / Date Label
                  </label>
                  <input
                    type="text"
                    value={editingShowcaseProject.showcaseLabel || ''}
                    onChange={e => setEditingShowcaseProject({ ...editingShowcaseProject, showcaseLabel: e.target.value })}
                    className="material-input"
                    style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                    placeholder="e.g. Released Apr 8, 2026 or TO BE RELEASED..."
                  />
                </div>

                {/* 5. Accent Color & Preset Swatches */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    Banner Accent Color (Buttons, Badges, Highlights)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="color"
                        value={editingShowcaseProject.accentColor || '#38bdf8'}
                        onChange={e => setEditingShowcaseProject({ ...editingShowcaseProject, accentColor: e.target.value, accentSoft: `${e.target.value}44` })}
                        style={{ width: 42, height: 42, borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={editingShowcaseProject.accentColor || '#38bdf8'}
                        onChange={e => setEditingShowcaseProject({ ...editingShowcaseProject, accentColor: e.target.value, accentSoft: `${e.target.value}44` })}
                        className="material-input"
                        style={{ width: 110, padding: '8px 14px', borderRadius: 999, fontSize: 13 }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                      {[
                        { label: 'Sky', hex: '#38bdf8' },
                        { label: 'Rose', hex: '#f43f5e' },
                        { label: 'Violet', hex: '#a855f7' },
                        { label: 'Emerald', hex: '#34d399' },
                        { label: 'Amber', hex: '#f59e0b' },
                        { label: 'White', hex: '#ffffff' },
                      ].map(swatch => (
                        <button
                          key={swatch.hex}
                          type="button"
                          onClick={() => setEditingShowcaseProject({ ...editingShowcaseProject, accentColor: swatch.hex, accentSoft: `${swatch.hex}44` })}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '4px 10px',
                            borderRadius: 99,
                            background: 'var(--bg-surface-variant)',
                            border: editingShowcaseProject.accentColor === swatch.hex ? `2px solid ${swatch.hex}` : '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            fontSize: 11.5
                          }}
                        >
                          <span style={{ width: 12, height: 12, borderRadius: '50%', background: swatch.hex, display: 'inline-block', border: '1px solid rgba(0,0,0,0.2)' }} />
                          <span>{swatch.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 6. Cover Art File / URL */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    Cover Art Image (Backdrop)
                  </label>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input
                      type="text"
                      required
                      value={editingShowcaseProject.coverFile}
                      onChange={e => setEditingShowcaseProject({ ...editingShowcaseProject, coverFile: e.target.value })}
                      className="material-input"
                      style={{ flex: 1, padding: '10px 18px', borderRadius: 999 }}
                      placeholder="Filename or full image URL..."
                    />
                    <div style={{ width: 44, height: 44, borderRadius: 12, overflow: 'hidden', backgroundColor: 'var(--bg-surface-solid)', flexShrink: 0, border: '1px solid var(--border-subtle)' }}>
                      <img src={getCoverUrl(editingShowcaseProject.coverFile)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </div>
                </div>

                {/* 7. Banner Description */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    Hero Banner Description (shown on homepage)
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={editingShowcaseProject.description || ''}
                    onChange={e => setEditingShowcaseProject({ ...editingShowcaseProject, description: e.target.value })}
                    className="material-input"
                    style={{ width: '100%', borderRadius: 18, padding: '12px 16px', lineHeight: 1.55 }}
                    placeholder="Write the atmospheric, compelling banner description..."
                  />
                </div>

                {/* 8. Right Stage Card Settings */}
                <div style={{
                  padding: '16px 20px',
                  borderRadius: 20,
                  background: 'var(--bg-surface-variant)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14
                }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-main)' }}>
                    Right Stage Card Configuration
                  </span>

                  <div className="admin-form-grid-3">
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                        Card Header Label
                      </label>
                      <input
                        type="text"
                        value={editingShowcaseProject.bannerConfig?.cardLabel || ''}
                        onChange={e => setEditingShowcaseProject({
                          ...editingShowcaseProject,
                          bannerConfig: { ...editingShowcaseProject.bannerConfig, cardLabel: e.target.value }
                        })}
                        className="material-input"
                        style={{ width: '100%', padding: '8px 14px', borderRadius: 999, fontSize: 12.5 }}
                        placeholder="e.g. SELECTIONS, ORIGINAL SCORE"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                        Stage Card Tag
                      </label>
                      <input
                        type="text"
                        value={editingShowcaseProject.bannerConfig?.cardTag || ''}
                        onChange={e => setEditingShowcaseProject({
                          ...editingShowcaseProject,
                          bannerConfig: { ...editingShowcaseProject.bannerConfig, cardTag: e.target.value }
                        })}
                        className="material-input"
                        style={{ width: '100%', padding: '8px 14px', borderRadius: 999, fontSize: 12.5 }}
                        placeholder="e.g. Lead · The Video"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                        Lead Track Name
                      </label>
                      <input
                        type="text"
                        value={editingShowcaseProject.leadTrack || ''}
                        onChange={e => setEditingShowcaseProject({ ...editingShowcaseProject, leadTrack: e.target.value })}
                        className="material-input"
                        style={{ width: '100%', padding: '8px 14px', borderRadius: 999, fontSize: 12.5 }}
                        placeholder="e.g. The Video"
                      />
                    </div>
                  </div>
                </div>

                {/* 9. Streaming Links */}
                <div className="admin-form-grid-2">
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      Spotify Streaming URL
                    </label>
                    <input
                      type="url"
                      value={editingShowcaseProject.spotifyUrl || ''}
                      onChange={e => setEditingShowcaseProject({ ...editingShowcaseProject, spotifyUrl: e.target.value })}
                      className="material-input"
                      style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                      placeholder="https://open.spotify.com/..."
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      YouTube / Listen URL
                    </label>
                    <input
                      type="url"
                      value={editingShowcaseProject.youtubeUrl || ''}
                      onChange={e => setEditingShowcaseProject({ ...editingShowcaseProject, youtubeUrl: e.target.value })}
                      className="material-input"
                      style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                      placeholder="https://www.youtube.com/..."
                    />
                  </div>
                </div>

              </div>

              <div className="modal-footer-fixed" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setEditingShowcaseProject(null)}
                  className="material-btn material-pill"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingShowcase}
                  className="material-btn material-pill"
                  style={{ background: 'var(--text-main)', color: 'var(--bg-base)', fontWeight: 700 }}
                >
                  {savingShowcase ? 'Saving...' : 'Save Banner to Supabase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ MODAL: ARTIST EDITOR ═══════════════ */}
      {editingArtist && (
        <div className="modal-overlay" onClick={() => setEditingArtist(null)}>
          <div
            className="modal-container admin-modal-card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 640, backgroundColor: 'var(--bg-surface-solid)' }}
          >
            <div className="modal-header-fixed">
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800 }}>
                  {originalArtistId ? 'Edit Creator Profile' : 'Add New Artist'}
                </h3>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  ID: {editingArtist.id}
                </span>
              </div>
              <button
                onClick={() => setEditingArtist(null)}
                className="material-btn"
                style={{ width: 34, height: 34, borderRadius: '50%', fontSize: 14 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveArtist} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div className="modal-body-scrollable">
              {/* Editable Slug / ID */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Artist Slug / ID *
                </label>
                <input
                  type="text"
                  required
                  value={editingArtist.id}
                  onChange={e => setEditingArtist({ ...editingArtist, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                  className="material-input"
                  style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                  placeholder="e.g. ven, jhuzz, 13"
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingArtist.name}
                  onChange={e => setEditingArtist({ ...editingArtist, name: e.target.value })}
                  className="material-input"
                  style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                  placeholder="e.g. VEN"
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Avatar Image File or URL (Optional)
                </label>
                <input
                  type="text"
                  value={editingArtist.image}
                  onChange={e => setEditingArtist({ ...editingArtist, image: e.target.value })}
                  className="material-input"
                  style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                  placeholder="e.g. ven.png, or URL (defaults to ss7.png)"
                />
              </div>

              <div className="admin-form-grid-2">
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    Spotify URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingArtist.spotifyUrl || ''}
                    onChange={e => setEditingArtist({ ...editingArtist, spotifyUrl: e.target.value })}
                    className="material-input"
                    style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                    placeholder="https://open.spotify.com/artist/..."
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    YouTube URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingArtist.youtubeUrl || ''}
                    onChange={e => setEditingArtist({ ...editingArtist, youtubeUrl: e.target.value })}
                    className="material-input"
                    style={{ width: '100%', padding: '10px 18px', borderRadius: 999 }}
                    placeholder="https://youtube.com/@..."
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Artist Biography
                </label>
                <textarea
                  rows={6}
                  value={editingArtist.bio || ''}
                  onChange={e => setEditingArtist({ ...editingArtist, bio: e.target.value })}
                  className="material-input"
                  style={{ width: '100%', borderRadius: 20, padding: '14px 18px', lineHeight: 1.6 }}
                  placeholder="Write the artist background, contributions, and lore..."
                />
              </div>

              </div>

              <div className="modal-footer-fixed" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {originalArtistId && (
                  <button
                    type="button"
                    onClick={() => handleDeleteArtist(editingArtist.id, editingArtist.name)}
                    className="material-btn material-pill"
                    style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.45)', background: 'rgba(239, 68, 68, 0.08)', fontWeight: 700, fontSize: 12.5 }}
                  >
                    Delete Creator
                  </button>
                )}
                <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
                  <button
                    type="button"
                    onClick={() => setEditingArtist(null)}
                    className="material-btn material-pill"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingArtist}
                    className="material-btn material-pill"
                    style={{ background: 'var(--text-main)', color: 'var(--bg-base)', fontWeight: 700 }}
                  >
                    {savingArtist ? 'Saving...' : 'Save Artist to Supabase'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ MODAL: PERMANENT DELETION CONFIRMATION ═══════════════ */}
      {deleteConfirm.isOpen && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteConfirm({ ...deleteConfirm, isOpen: false })}>
          <div
            className="modal-container admin-modal-card"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 480,
              backgroundColor: 'var(--bg-surface-solid)',
              border: '1px solid rgba(239, 68, 68, 0.45)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(239, 68, 68, 0.15)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '24px 26px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0
                }}>
                  <span style={{ fontWeight: 800, fontSize: 18, color: '#ef4444' }}>!</span>
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                    {deleteConfirm.type === 'project' && 'Delete Release Master?'}
                    {deleteConfirm.type === 'news' && 'Delete News Article?'}
                    {deleteConfirm.type === 'artist' && 'Delete Creator Profile?'}
                    {deleteConfirm.type === 'track' && 'Remove Track from Project?'}
                    {deleteConfirm.type === 'history' && 'Remove Lore Section?'}
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Admin Confirmation Required
                  </span>
                </div>
              </div>

              <div style={{
                padding: '14px 16px',
                borderRadius: 18,
                background: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.22)',
                display: 'flex',
                flexDirection: 'column',
                gap: 5
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', wordBreak: 'break-word' }}>
                  {deleteConfirm.title}
                </div>
                {deleteConfirm.id && (
                  <div style={{ fontSize: 11.5, color: '#ef4444', fontFamily: 'monospace' }}>
                    ID: {deleteConfirm.id}
                  </div>
                )}
                {deleteConfirm.details && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.45, marginTop: 2 }}>
                    {deleteConfirm.details}
                  </div>
                )}
              </div>

              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
                {deleteConfirm.type === 'track' || deleteConfirm.type === 'history'
                  ? 'This item will be removed from your current project editor draft.'
                  : 'This item will be permanently purged from the live Supabase database. This action cannot be reversed.'}
              </p>
            </div>

            <div style={{
              padding: '16px 26px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
              background: 'var(--bg-surface-variant)'
            }}>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
                className="material-btn material-pill"
                style={{ fontSize: 13, padding: '8px 20px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleExecuteDelete}
                className="material-btn material-pill"
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  borderColor: '#ef4444',
                  fontWeight: 700,
                  fontSize: 13,
                  padding: '8px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 16px rgba(239, 68, 68, 0.35)',
                  cursor: deleting ? 'not-allowed' : 'pointer'
                }}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
