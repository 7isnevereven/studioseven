import type { Metadata, Viewport } from 'next'
import './globals.css'
import NavigationLoadingProvider from '@/components/NavigationLoadingProvider'

export const metadata: Metadata = {
  title: 'studioseven',
  description: 'The creative division of team7 · 2020–2026. Explore the discography, newsroom, and artists of studioseven.',
  keywords: ['studioseven', 'team7', 'VEN', 'music', 'indie', 'discography'],
  openGraph: {
    title: 'studioseven',
    description: 'The creative division of team7 · 2020–2026',
    siteName: 'studioseven',
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Base UI font */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet" />
        {/* Project-specific banner fonts including Creato Display */}
        <link href="https://fonts.cdnfonts.com/css/creato-display" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Almendra:ital,wght@0,400;0,700;1,400;1,700&family=Anton&family=Antonio:wght@400;600;700&family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;1,400&family=Bebas+Neue&family=Big+Shoulders+Display:wght@400;700;900&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400&family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Fjalla+One&family=Fondamento:ital@0;1&family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,700;0,900;1,100;1,200;1,300&family=Oswald:wght@400;600;700&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Raleway:ital,wght@0,100;0,200;0,300;0,400;0,700;1,100;1,200;1,300&family=Saira+Condensed:wght@400;700;900&family=Space+Grotesk:wght@300..700&family=Syne:wght@400;500;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <NavigationLoadingProvider>
          {children}
        </NavigationLoadingProvider>
      </body>
    </html>
  )
}