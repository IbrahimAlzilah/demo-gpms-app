import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { NAV_MENU } from '@/lib/constants'
import { useDirection } from '@/hooks/use-direction'
import { cn } from '@/lib/utils'
import * as Icons from 'lucide-react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState, useEffect } from 'react'
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
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
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())

  if (!user) return null

  const menuItems = NAV_MENU[user.role] || []

  const isActiveRoute = (path?: string) => {
    if (!path) return false
    // Exact match
    if (location.pathname === path) return true
    // For submenu items, check exact match (not prefix match to avoid false positives)
    // For parent routes, check prefix match
    const isSubmenuRoute = path.includes('/my') || path.includes('/approved')
    if (isSubmenuRoute) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path + '/')
  }

  const toggleMenu = (labelKey: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev)
      if (next.has(labelKey)) {
        next.delete(labelKey)
      } else {
        next.add(labelKey)
      }
      return next
    })
  }

  const isMenuExpanded = (labelKey: string) => {
    return expandedMenus.has(labelKey)
  }

  const isSubmenuItemActive = (submenu: { path: string }[]) => {
    return submenu.some((subItem) => isActiveRoute(subItem.path))
  }

  // Auto-expand menu if any submenu item is active
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.submenu && item.submenu.length > 0) {
        const hasActiveSubmenu = isSubmenuItemActive(item.submenu)
        if (hasActiveSubmenu && !expandedMenus.has(item.labelKey)) {
          setExpandedMenus((prev) => new Set([...prev, item.labelKey]))
        }
      }
    })
  }, [location.pathname, menuItems, expandedMenus])

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
                const hasSubmenu = item.submenu && item.submenu.length > 0
                const isExpanded = hasSubmenu ? isMenuExpanded(item.labelKey) : false
                const isActive = hasSubmenu
                  ? isSubmenuItemActive(item.submenu || [])
                  : isActiveRoute(item.path)

                return (
                  <SidebarMenuItem key={item.path || item.labelKey}>
                    {hasSubmenu ? (
                      <>
                        <SidebarMenuButton
                          onClick={() => toggleMenu(item.labelKey)}
                          isActive={isActive}
                          tooltip={t(item.labelKey)}
                          className="w-full text-md h-10"
                          data-state={isExpanded ? 'open' : 'closed'}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span>{t(item.labelKey)}</span>
                          {item.badge && item.badge > 0 && (
                            <SidebarMenuBadge className="ms-auto">
                              {item.badge}
                            </SidebarMenuBadge>
                          )}
                          {isRtl ? (
                            isExpanded ? (
                              <ChevronUp className="h-4 w-4 ms-auto" />
                            ) : (
                              <ChevronDown className="h-4 w-4 ms-auto" />
                            )
                          ) : (
                            isExpanded ? (
                              <ChevronUp className="h-4 w-4 ms-auto" />
                            ) : (
                              <ChevronDown className="h-4 w-4 ms-auto" />
                            )
                          )}
                        </SidebarMenuButton>
                        {isExpanded && (
                          <SidebarMenuSub>
                            {item.submenu?.map((subItem) => {
                              const SubIcon = subItem.icon ? getIcon(subItem.icon) : null
                              const isSubActive = isActiveRoute(subItem.path)
                              return (
                                <SidebarMenuSubItem key={subItem.path}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isSubActive}
                                  >
                                    <NavLink to={subItem.path}>
                                      {SubIcon && <SubIcon className="h-4 w-4 shrink-0" />}
                                      <span>{t(subItem.labelKey)}</span>
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            })}
                          </SidebarMenuSub>
                        )}
                      </>
                    ) : (
                      <SidebarMenuButton asChild isActive={isActive} tooltip={t(item.labelKey)} className="w-full text-md h-10">
                        <NavLink to={item.path || '#'}>
                          <Icon className="h-5 w-5 shrink-0" />
                          <span>{t(item.labelKey)}</span>
                          {item.badge && item.badge > 0 && (
                            <SidebarMenuBadge className="ms-auto">
                              {item.badge}
                            </SidebarMenuBadge>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    )}
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

