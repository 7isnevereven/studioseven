'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import LoadingScreen from './LoadingScreen'

interface NavigationLoadingContextType {
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
}

const NavigationLoadingContext = createContext<NavigationLoadingContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
})

export function useNavigationLoading() {
  return useContext(NavigationLoadingContext)
}

function RouteWatcher({ onComplete }: { onComplete: () => void }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    onComplete()
  }, [pathname, searchParams, onComplete])

  return null
}

export default function NavigationLoadingProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(false)
  const currentPathnameRef = useRef<string>('')
  const currentSearchRef = useRef<string>('')

  const startLoading = useCallback(() => {
    setIsLoading(true)
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  // Keep track of current location synchronously on the client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      currentPathnameRef.current = window.location.pathname
      currentSearchRef.current = window.location.search
    }
  })

  // Whenever Next.js finishes navigating and updates pathname/search, dismiss loading
  const handleRouteComplete = useCallback(() => {
    setIsLoading(false)
    if (typeof window !== 'undefined') {
      currentPathnameRef.current = window.location.pathname
      currentSearchRef.current = window.location.search
    }
  }, [])

  // Safety fallback: auto-dismiss after 9 seconds if navigation gets stalled or cancelled
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 9000)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  // Global click listener to intercept page navigation links immediately
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Only react to normal primary left-clicks
      if (e.button !== 0) return
      // Ignore clicks with modifier keys (which open in new tabs or windows)
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return

      const target = e.target as HTMLElement | null
      const anchor = target?.closest('a')
      if (!anchor) return

      // Don't show loading if link opens in new tab or is a download
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) {
        return
      }

      const href = anchor.getAttribute('href')
      if (!href) return

      // Don't show loading for hash anchors or external protocols
      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:')
      ) {
        return
      }

      try {
        const destUrl = new URL(anchor.href, window.location.href)

        // Ignore external origin links (e.g. Spotify, YouTube, social links)
        if (destUrl.origin !== window.location.origin) {
          return
        }

        // If the user is clicking a link that leads to the EXACT same page path and search,
        // do not trigger a loading screen
        const isSamePage =
          destUrl.pathname === window.location.pathname &&
          destUrl.search === window.location.search

        if (isSamePage) {
          return
        }

        // An internal page navigation has started - show visible loading icon immediately!
        setIsLoading(true)
      } catch {
        // Invalid URL, do nothing
      }
    }

    const handlePopState = () => {
      // If browser back/forward navigates across different pathnames, show loading
      if (window.location.pathname !== currentPathnameRef.current) {
        setIsLoading(true)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow pressing Escape to dismiss the loading overlay if stuck
      if (e.key === 'Escape') {
        setIsLoading(false)
      }
    }

    document.addEventListener('click', handleGlobalClick, { capture: true })
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('click', handleGlobalClick, { capture: true })
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <NavigationLoadingContext.Provider
      value={{ isLoading, startLoading, stopLoading }}
    >
      <Suspense fallback={null}>
        <RouteWatcher onComplete={handleRouteComplete} />
      </Suspense>
      {isLoading && <LoadingScreen />}
      {children}
    </NavigationLoadingContext.Provider>
  )
}
