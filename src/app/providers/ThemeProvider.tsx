import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useThemeStore } from '@/store/theme.store'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, getEffectiveTheme } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement
    const effectiveTheme = getEffectiveTheme()

    // Remove existing theme classes
    root.classList.remove('light', 'dark')

    // Apply the effective theme
    root.classList.add(effectiveTheme)

    // Handle system theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.remove('light', 'dark')
        root.classList.add(e.matches ? 'dark' : 'light')
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme, getEffectiveTheme])

  return <>{children}</>
}

