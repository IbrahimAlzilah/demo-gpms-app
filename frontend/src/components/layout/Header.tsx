import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/pages/auth/login'
import { ROUTES } from '@/lib/constants'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { DropdownMenu, DropdownMenuItem } from './DropdownMenu'
import { NotificationsPopover } from './NotificationsPopover'
import { LAYOUT_CONSTANTS, responsivePadding, responsiveSpacing } from './constants'
// Import Components
import { ModeToggle } from './theme-toggle'
import { LanguageToggle } from './languagt-toggle'
import { Breadcrumbs } from '../common/Breadcrumbs'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  if (!user) return null

  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex items-center border-b border-border bg-card backdrop-blur-md transition-all',
        LAYOUT_CONSTANTS.headerHeight,
        className
      )}
    >
      <div className={cn('flex w-full items-center justify-between', responsivePadding.header)}>
        <div className={cn('flex items-center min-w-0 gap-2')}>
          <Breadcrumbs />
        </div>
        <div className={cn('flex items-center shrink-0', responsiveSpacing.gapSmall)}>
          <div className="hidden md:flex items-center px-3 py-2.5 bg-muted/50 rounded-md text-xs font-medium text-muted-foreground">
            {new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <LanguageToggle />
          <ModeToggle />
          <NotificationsPopover />
          {/* <Separator orientation='vertical' className='h-6' /> */}
          <div className="w-px h-8 bg-slate-200 mx-2 hidden sm:block"></div>
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-1!"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {/* <span className="text-xs font-semi-bold">{user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}</span> */}
                <User className="size-4" />
              </div>
              <div className="hidden flex-col items-start text-sm lg:flex">
                <span className="font-medium truncate max-w-[120px]">{user.name}</span>
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {t(`roles.${user.role}`) || user.role}
                </span>
              </div>
              <ChevronDown className={cn('h-4 w-4 transition-transform', showUserMenu && 'rotate-180')} />
            </Button>
            <DropdownMenu
              isOpen={showUserMenu}
              onClose={() => setShowUserMenu(false)}
              className="w-48"
            >
              <div className="ps-3 pe-3 py-2 border-b border-border">
                <p className="text-sm font-medium text-popover-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span>{t('auth.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
