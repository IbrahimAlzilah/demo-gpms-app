import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { NAV_MENU } from '@/lib/constants'
import { useDirection } from '@/hooks/use-direction'
import { cn } from '@/lib/utils'
import * as Icons from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from '@/components/ui/sidebar'
import type { ComponentType } from 'react'
import type { SVGProps } from 'react'
import logo from '@/assets/logo2.png'

const getIcon = (iconName: string): ComponentType<SVGProps<SVGSVGElement>> => {
  return (Icons[iconName as keyof typeof Icons] as ComponentType<SVGProps<SVGSVGElement>>) || Icons.Circle
}

export function AppSidebar() {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const location = useLocation()
  const isRtl = useDirection()

  if (!user) return null

  const menuItems = NAV_MENU[user.role] || []

  const isActiveRoute = (path: string) => {
    return location.pathname === path ||
      (path !== '/' && location.pathname.startsWith(path + '/'))
  }

  return (
    <Sidebar side={isRtl ? 'right' : 'left'} collapsible="icon">
      <SidebarHeader className={cn(
        'flex flex-row items-center gap-3 border-b border-sidebar-border h-16 px-4')}>
        <img
          src={logo}
          alt="GPMS Logo"
          className="h-8 w-8 rounded-full shrink-0 object-contain"
        />
        <h2 className="text-lg font-semibold tracking-tight text-sidebar-foreground truncate">
          {t('app.shortName')}
        </h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const Icon = getIcon(item.icon)
                const isActive = isActiveRoute(item.path)
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={t(item.labelKey)} className="w-full text-md h-10">
                      <NavLink to={item.path}>
                        <Icon className="h-5 w-5 shrink-0" />
                        <span>{t(item.labelKey)}</span>
                        {item.badge && item.badge > 0 && (
                          <SidebarMenuBadge className="ms-auto">
                            {item.badge}
                          </SidebarMenuBadge>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

