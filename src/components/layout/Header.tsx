import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useThemeStore } from '@/store/theme.store'
import { ROUTES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Bell,
  LogOut,
  Menu,
  User,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
  Languages,
} from 'lucide-react'

interface HeaderProps {
  onMenuClick?: () => void
  className?: string
}

export function Header({ onMenuClick, className }: HeaderProps) {
  const { user, logout } = useAuthStore()
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useThemeStore()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    setShowThemeMenu(false)
  }

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
    setShowLangMenu(false)
  }

  if (!user) return null

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex h-16 items-center border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60',
        className
      )}
    >
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        {/* Left side - Menu button for mobile */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden lg:flex items-center gap-3">
            {/* <img 
              src="/src/assets/logo.png" 
              alt="GPMS Logo" 
              className="h-8 w-8 object-contain"
            /> */}
            <h1 className="text-lg font-semibold">{t('app.name')}</h1>
          </div>
        </div>

        {/* Right side - User menu and notifications */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowLangMenu(!showLangMenu)
                setShowThemeMenu(false)
                setShowUserMenu(false)
              }}
              title={t('language.ar')}
            >
              <Languages className="h-5 w-5" />
            </Button>
            {showLangMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowLangMenu(false)}
                />
                <div className="absolute left-0 top-full z-50 mt-2 w-32 rounded-md border bg-popover p-1 shadow-md">
                  <Button
                    variant={i18n.language === 'ar' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-2"
                    onClick={() => handleLanguageChange('ar')}
                  >
                    <span>{t('language.ar')}</span>
                  </Button>
                  <Button
                    variant={i18n.language === 'en' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-2"
                    onClick={() => handleLanguageChange('en')}
                  >
                    <span>{t('language.en')}</span>
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowThemeMenu(!showThemeMenu)
                setShowLangMenu(false)
                setShowUserMenu(false)
              }}
              title={t(`theme.${theme}`)}
            >
              {getThemeIcon()}
            </Button>
            {showThemeMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowThemeMenu(false)}
                />
                <div className="absolute left-0 top-full z-50 mt-2 w-32 rounded-md border bg-popover p-1 shadow-md">
                  <Button
                    variant={theme === 'light' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-2"
                    onClick={() => handleThemeChange('light')}
                  >
                    <Sun className="h-4 w-4" />
                    <span>{t('theme.light')}</span>
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-2"
                    onClick={() => handleThemeChange('dark')}
                  >
                    <Moon className="h-4 w-4" />
                    <span>{t('theme.dark')}</span>
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-2"
                    onClick={() => handleThemeChange('system')}
                  >
                    <Monitor className="h-4 w-4" />
                    <span>{t('theme.system')}</span>
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          </Button>

          {/* User menu */}
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden flex-col items-start text-sm md:flex">
                <span className="font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {t(`roles.${user.role}`) || user.role}
                </span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-md border bg-popover p-1 shadow-md">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('auth.logout')}</span>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
