import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { ROUTES } from '@/lib/constants'
import { SidebarTrigger, Button, Separator } from '@/components/ui'
import { cn } from '@/lib/utils'
import { Bell, LogOut, User, ChevronDown } from 'lucide-react'
import { DropdownMenu, DropdownMenuItem } from './DropdownMenu'
import { LAYOUT_CONSTANTS, responsivePadding, responsiveSpacing } from './constants'
// Import Components
import { ModeToggle } from './theme-toggle'
import { LanguageToggle } from './languagt-toggle'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { t } = useTranslation()
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
        'sticky top-0 z-50 flex items-center border-b border-border bg-background',
        LAYOUT_CONSTANTS.headerHeight,
        className
      )}
    >
      <div className={cn('flex w-full items-center justify-between', responsivePadding.header)}>
        <div className={cn('flex items-center min-w-0', responsiveSpacing.gap)}>
          <SidebarTrigger className="shrink-0 -ml-1" />
          <Separator orientation='vertical' className='ms-2 h-6' />
        </div>
        <div className={cn('flex items-center shrink-0', responsiveSpacing.gapSmall)}>
          <LanguageToggle />
          <ModeToggle />
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 end-1 h-2 w-2 rounded-full bg-destructive" />
          </Button>
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
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
