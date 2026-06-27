import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'studioseven',
  description: 'A sub-brand under Ori · 2020–2026',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}