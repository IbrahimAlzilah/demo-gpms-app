import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface DirectionProviderProps {
  children: ReactNode
}

export function DirectionProvider({ children }: DirectionProviderProps) {
  const { i18n } = useTranslation()

  useEffect(() => {
    const updateDirection = () => {
      const root = document.documentElement
      const currentLang = i18n.language || 'ar'
      const direction = currentLang === 'ar' ? 'rtl' : 'ltr'

      root.setAttribute('dir', direction)
      root.setAttribute('lang', currentLang)
    }

    // Initial setup
    updateDirection()

    // Listen for language changes
    i18n.on('languageChanged', updateDirection)

    return () => {
      i18n.off('languageChanged', updateDirection)
    }
  }, [i18n])

  return <>{children}</>
}

