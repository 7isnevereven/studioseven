'use client'

import { useState } from 'react'
import RightPanel from '@/components/RightPanel'

type View = 'home' | 'projects' | 'artists' | 'newsroom' | 'about'

export default function Page() {
  const [currentView, setCurrentView] = useState<View>('home')

  return (
    <RightPanel
      currentView={currentView}
      setCurrentView={setCurrentView}
    />
  )
}