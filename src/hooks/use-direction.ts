import { useState, useEffect } from 'react'
import { isRTL } from '@/lib/utils/rtl'

/**
 * Hook to reactively track document direction changes
 * Returns true for RTL, false for LTR
 */
export function useDirection(): boolean {
  const [isRtl, setIsRtl] = useState(() => isRTL())

  useEffect(() => {
    const updateDirection = () => {
      setIsRtl(isRTL())
    }

    // Initial check
    updateDirection()

    // Watch for direction changes via MutationObserver
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'dir'
        ) {
          updateDirection()
        }
      })
    })

    // Observe document.documentElement for dir attribute changes
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir'],
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return isRtl
}

