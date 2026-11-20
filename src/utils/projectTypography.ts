import type React from 'react'
import type { Project, ProjectBannerConfig } from '@/data/projects'

export const PROJECT_FONT_STYLES: Record<string, React.CSSProperties> = {
  'what-do-you-know': {
    fontFamily: '"Creato Display", "Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    fontWeight: 800,
    letterSpacing: '-0.025em',
  },
  'what-do-we-know': {
    fontFamily: '"Creato Display", "Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    fontWeight: 800,
    letterSpacing: '-0.025em',
  },
  'saccharin': {
    fontFamily: '"Almendra", "Fondamento", "Cinzel Decorative", Georgia, serif',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    fontWeight: 700,
  },
  'cicatrix': {
    fontFamily: '"Space Grotesk", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    letterSpacing: '-0.02em',
    textTransform: 'uppercase' as const,
    fontWeight: 800,
  },
}

export function cleanFontUrl(raw?: string): string {
  if (!raw) return ''
  let cleaned = raw.trim()
  const linkMatch = cleaned.match(/href=["']([^"']+)["']/)
  if (linkMatch) return linkMatch[1]
  const importMatch = cleaned.match(/url\(['"]?([^'")]+)['"]?\)/)
  if (importMatch) return importMatch[1]
  return cleaned.replace(/^['"]|['"]$/g, '')
}

export function hexToRgba(color: string, alpha: number): string {
  if (!color) return `rgba(255, 255, 255, ${alpha})`
  const trimmed = color.trim()
  if (trimmed.startsWith('#')) {
    let hex = trimmed.slice(1)
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('')
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
      }
    }
  }
  return trimmed
}

export function formatDisplayTitle(title?: string): string {
  // Respect the artist's original, deliberate capitalization exactly as titled
  return title || ''
}

export function getProjectFontStyle(
  project?: Partial<Project> | null,
  options?: { isDetailHero?: boolean }
): React.CSSProperties {
  if (!project) return {}
  const cfg = project.bannerConfig || {}
  const chosenFont = cfg.font || ''
  const isDetailHero = options?.isDetailHero ?? false

  let baseStyle: React.CSSProperties = {
    fontFamily: '"Creato Display", "Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    fontWeight: 800,
    letterSpacing: '-0.025em',
  }

  if (chosenFont === 'cormorant' || chosenFont === 'cormorant-thin') {
    baseStyle = {
      fontFamily: '"Cormorant Garamond", Georgia, serif',
      fontWeight: 300,
      letterSpacing: '0.04em',
    }
  } else if (chosenFont === 'montserrat-thin') {
    baseStyle = {
      fontFamily: '"Montserrat", "Inter", -apple-system, sans-serif',
      fontWeight: 200,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    }
  } else if (chosenFont === 'raleway-thin') {
    baseStyle = {
      fontFamily: '"Raleway", "Inter", -apple-system, sans-serif',
      fontWeight: 200,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    }
  } else if (chosenFont === 'inter-light') {
    baseStyle = {
      fontFamily: '"Inter", -apple-system, sans-serif',
      fontWeight: 300,
      letterSpacing: '-0.02em',
    }
  } else if (chosenFont === 'syne') {
    baseStyle = {
      fontFamily: '"Syne", "Plus Jakarta Sans", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      textTransform: 'uppercase',
    }
  } else if (chosenFont === 'bodoni') {
    baseStyle = {
      fontFamily: '"Bodoni Moda", "Playfair Display", Georgia, serif',
      fontWeight: 700,
      fontStyle: 'italic',
      letterSpacing: '-0.01em',
    }
  } else if (chosenFont === 'bebas') {
    baseStyle = {
      fontFamily: '"Bebas Neue", "Space Grotesk", sans-serif',
      fontWeight: 400,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    }
  } else if (chosenFont === 'cinzel') {
    baseStyle = {
      fontFamily: '"Cinzel Decorative", "Cinzel", Georgia, serif',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    }
  } else if (chosenFont === 'creato') {
    baseStyle = {
      fontFamily: '"Creato Display", "Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      fontWeight: 800,
      letterSpacing: '-0.025em',
    }
  } else if (chosenFont === 'almendra') {
    baseStyle = {
      fontFamily: '"Almendra", "Fondamento", "Cinzel Decorative", Georgia, serif',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      fontWeight: 700,
    }
  } else if (chosenFont === 'space-grotesk') {
    baseStyle = {
      fontFamily: '"Space Grotesk", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      letterSpacing: '-0.02em',
      textTransform: 'uppercase',
      fontWeight: 800,
    }
  } else if (chosenFont === 'playfair') {
    baseStyle = {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontStyle: 'italic',
      letterSpacing: '-0.01em',
      fontWeight: 700,
    }
  } else if (chosenFont === 'sans') {
    baseStyle = {
      fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      letterSpacing: '-0.02em',
      fontWeight: 800,
    }
  } else if (chosenFont === 'oswald') {
    baseStyle = {
      fontFamily: '"Oswald", "Bebas Neue", sans-serif',
      fontWeight: 600,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
    }
  } else if (chosenFont === 'anton') {
    baseStyle = {
      fontFamily: '"Anton", "Bebas Neue", sans-serif',
      fontWeight: 400,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }
  } else if (chosenFont === 'barlow-condensed') {
    baseStyle = {
      fontFamily: '"Barlow Condensed", sans-serif',
      fontWeight: 700,
      letterSpacing: '0.02em',
    }
  } else if (chosenFont === 'big-shoulders') {
    baseStyle = {
      fontFamily: '"Big Shoulders Display", sans-serif',
      fontWeight: 800,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
    }
  } else if (chosenFont === 'antonio') {
    baseStyle = {
      fontFamily: '"Antonio", sans-serif',
      fontWeight: 700,
      letterSpacing: '0.03em',
      textTransform: 'uppercase',
    }
  } else if (chosenFont === 'fjalla') {
    baseStyle = {
      fontFamily: '"Fjalla One", sans-serif',
      fontWeight: 400,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }
  } else if (chosenFont === 'saira-condensed') {
    baseStyle = {
      fontFamily: '"Saira Condensed", sans-serif',
      fontWeight: 800,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
    }
  } else if (chosenFont === 'custom' || cfg.customFontFamily) {
    const familyName = cfg.customFontFamily ? `"${cfg.customFontFamily.trim()}", "Inter", sans-serif` : '"Inter", sans-serif'
    baseStyle = {
      fontFamily: familyName,
      fontWeight: 400,
      letterSpacing: 'normal',
    }
  } else if (project?.id && PROJECT_FONT_STYLES[project.id]) {
    baseStyle = { ...PROJECT_FONT_STYLES[project.id] }
  }

  // Fine-tuning overrides: Weight
  if (cfg.fontWeight) {
    baseStyle.fontWeight = parseInt(cfg.fontWeight) || (cfg.fontWeight as any)
  }

  // Fine-tuning overrides: Font Style & Posture & Stretch
  if (cfg.fontStyle) {
    const styleVal = cfg.fontStyle.toLowerCase()
    if (styleVal === 'italic') {
      baseStyle.fontStyle = 'italic'
    } else if (styleVal === 'oblique') {
      baseStyle.fontStyle = 'oblique 12deg'
      baseStyle.display = 'inline-block'
      baseStyle.transform = 'skewX(-8deg)'
      baseStyle.transformOrigin = 'left center'
    } else if (styleVal === 'condensed') {
      baseStyle.fontStretch = 'condensed'
      baseStyle.display = 'inline-block'
      baseStyle.transform = 'scaleX(0.80)'
      baseStyle.transformOrigin = 'left center'
      if (cfg.letterSpacing === undefined || cfg.letterSpacing === '') {
        baseStyle.letterSpacing = '-0.02em'
      }
    } else if (styleVal === 'condensed-italic') {
      baseStyle.fontStretch = 'condensed'
      baseStyle.fontStyle = 'italic'
      baseStyle.display = 'inline-block'
      baseStyle.transform = 'scaleX(0.80) skewX(-8deg)'
      baseStyle.transformOrigin = 'left center'
      if (cfg.letterSpacing === undefined || cfg.letterSpacing === '') {
        baseStyle.letterSpacing = '-0.02em'
      }
    } else if (styleVal === 'ultra-condensed') {
      baseStyle.fontStretch = 'ultra-condensed'
      baseStyle.display = 'inline-block'
      baseStyle.transform = 'scaleX(0.68)'
      baseStyle.transformOrigin = 'left center'
      if (cfg.letterSpacing === undefined || cfg.letterSpacing === '') {
        baseStyle.letterSpacing = '-0.035em'
      }
    } else if (styleVal === 'semi-condensed') {
      baseStyle.fontStretch = 'semi-condensed'
      baseStyle.display = 'inline-block'
      baseStyle.transform = 'scaleX(0.89)'
      baseStyle.transformOrigin = 'left center'
    } else if (styleVal === 'expanded') {
      baseStyle.fontStretch = 'expanded'
      baseStyle.display = 'inline-block'
      baseStyle.transform = 'scaleX(1.18)'
      baseStyle.transformOrigin = 'left center'
      if (cfg.letterSpacing === undefined || cfg.letterSpacing === '') {
        baseStyle.letterSpacing = '0.05em'
      }
    } else if (styleVal === 'expanded-italic') {
      baseStyle.fontStretch = 'expanded'
      baseStyle.fontStyle = 'italic'
      baseStyle.display = 'inline-block'
      baseStyle.transform = 'scaleX(1.18) skewX(-8deg)'
      baseStyle.transformOrigin = 'left center'
    } else if (styleVal === 'ultra-expanded') {
      baseStyle.fontStretch = 'ultra-expanded'
      baseStyle.display = 'inline-block'
      baseStyle.transform = 'scaleX(1.36)'
      baseStyle.transformOrigin = 'left center'
      if (cfg.letterSpacing === undefined || cfg.letterSpacing === '') {
        baseStyle.letterSpacing = '0.12em'
      }
    } else if (styleVal === 'small-caps') {
      baseStyle.fontVariant = 'small-caps'
      if (cfg.letterSpacing === undefined || cfg.letterSpacing === '') {
        baseStyle.letterSpacing = '0.05em'
      }
    } else if (styleVal === 'outline' || styleVal === 'outline-only') {
      baseStyle.WebkitTextStroke = '1.5px currentColor'
      baseStyle.color = 'transparent'
      baseStyle.textShadow = 'none'
    } else if (styleVal === 'outline-italic') {
      baseStyle.WebkitTextStroke = '1.5px currentColor'
      baseStyle.color = 'transparent'
      baseStyle.fontStyle = 'italic'
      baseStyle.textShadow = 'none'
    } else if (styleVal === 'underline') {
      baseStyle.textDecoration = 'underline'
      baseStyle.textUnderlineOffset = '6px'
      baseStyle.textDecorationThickness = '2px'
    } else if (styleVal === 'overline') {
      baseStyle.textDecoration = 'overline'
      baseStyle.textDecorationThickness = '2px'
    } else {
      baseStyle.fontStyle = 'normal'
    }
  }

  // Fine-tuning overrides: Granular Font Stretch / Width Override
  if (cfg.fontStretch && cfg.fontStretch !== 'normal') {
    baseStyle.fontStretch = cfg.fontStretch as any
    baseStyle.display = 'inline-block'
    baseStyle.transformOrigin = 'left center'
    if (cfg.fontStretch === 'ultra-condensed') baseStyle.transform = 'scaleX(0.68)'
    else if (cfg.fontStretch === 'extra-condensed') baseStyle.transform = 'scaleX(0.74)'
    else if (cfg.fontStretch === 'condensed') baseStyle.transform = 'scaleX(0.80)'
    else if (cfg.fontStretch === 'semi-condensed') baseStyle.transform = 'scaleX(0.90)'
    else if (cfg.fontStretch === 'semi-expanded') baseStyle.transform = 'scaleX(1.10)'
    else if (cfg.fontStretch === 'expanded') baseStyle.transform = 'scaleX(1.20)'
    else if (cfg.fontStretch === 'extra-expanded') baseStyle.transform = 'scaleX(1.30)'
    else if (cfg.fontStretch === 'ultra-expanded') baseStyle.transform = 'scaleX(1.42)'
  }

  // Fine-tuning overrides: Text Stroke / Outline
  if (cfg.textStroke) {
    if (cfg.textStroke === 'outline-only') {
      baseStyle.WebkitTextStroke = '1.5px currentColor'
      baseStyle.color = 'transparent'
      baseStyle.textShadow = 'none'
    } else if (cfg.textStroke === 'thin-stroke') {
      baseStyle.WebkitTextStroke = '1px rgba(255, 255, 255, 0.45)'
    } else if (cfg.textStroke === 'bold-stroke') {
      baseStyle.WebkitTextStroke = '2px rgba(255, 255, 255, 0.85)'
    }
  }
  if (cfg.letterSpacing !== undefined && cfg.letterSpacing !== '') {
    baseStyle.letterSpacing = cfg.letterSpacing
  }
  if (cfg.textTransform && cfg.textTransform !== 'none') {
    baseStyle.textTransform = cfg.textTransform
  }
  if (cfg.lineHeight) {
    baseStyle.lineHeight = cfg.lineHeight === 'tight' ? 0.95 : cfg.lineHeight === 'relaxed' ? 1.25 : 1.05
  }
  if (cfg.fontSize) {
    if (isDetailHero) {
      if (cfg.fontSize === 'compact') {
        baseStyle.fontSize = 'clamp(24px, 3.5vw, 36px)'
      } else if (cfg.fontSize === 'large') {
        baseStyle.fontSize = 'clamp(36px, 5.0vw, 56px)'
      } else if (cfg.fontSize === 'massive') {
        baseStyle.fontSize = 'clamp(42px, 5.8vw, 68px)'
      } else if (cfg.fontSize === 'standard') {
        baseStyle.fontSize = 'clamp(28px, 4.4vw, 46px)'
      }
    } else {
      if (cfg.fontSize === 'compact') {
        baseStyle.fontSize = 'clamp(26px, 3.5vw, 42px)'
      } else if (cfg.fontSize === 'large') {
        baseStyle.fontSize = 'clamp(38px, 5.2vw, 68px)'
      } else if (cfg.fontSize === 'massive') {
        baseStyle.fontSize = 'clamp(44px, 6.2vw, 82px)'
      } else if (cfg.fontSize === 'standard') {
        baseStyle.fontSize = 'clamp(34px, 4.4vw, 56px)'
      }
    }
  } else if (isDetailHero) {
    baseStyle.fontSize = 'clamp(28px, 4.4vw, 46px)'
  }

  if (cfg.titleColor) {
    baseStyle.color = cfg.titleColor
  }
  if (cfg.textShadow) {
    if (cfg.textShadow === 'none') {
      baseStyle.textShadow = 'none'
    } else if (cfg.textShadow === 'subtle') {
      baseStyle.textShadow = '0 2px 10px rgba(0, 0, 0, 0.7)'
    } else if (cfg.textShadow === 'dramatic') {
      baseStyle.textShadow = '0 4px 24px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0, 0, 0, 0.9)'
    } else if (cfg.textShadow === 'glow') {
      const glowColor = project.accentColor || '#ffffff'
      baseStyle.textShadow = `0 0 30px ${glowColor}66, 0 2px 12px rgba(0, 0, 0, 0.8)`
    }
  }

  return baseStyle
}

