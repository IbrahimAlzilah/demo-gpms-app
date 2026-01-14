import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/pages/auth/login'
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
    <Sidebar side={isRtl ? 'right' : 'left'} collapsible="icon" className="border-r border-sidebar-border/50 bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60">
      <SidebarHeader className={cn(
        'flex flex-row items-center gap-3 border-b border-sidebar-border/50 h-16 px-4 transition-all duration-300')}>
        <img
          src={logo}
          alt="GPMS Logo"
          className="h-9 w-9 rounded-xl shrink-0 object-contain shadow-sm"
        />
        <h2 className="text-lg font-bold tracking-tight text-sidebar-primary truncate transition-opacity duration-300 group-data-[collapsible=icon]:opacity-0">
          {t('app.shortName')}
        </h2>
      </SidebarHeader>
      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
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
                          className={cn(
                            "w-full text-sm font-medium h-10 transition-all duration-200",
                            "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                            "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-sm"
                          )}
                          data-state={isExpanded ? 'open' : 'closed'}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span className="group-data-[collapsible=icon]:hidden">{t(item.labelKey)}</span>
                          {item.badge && item.badge > 0 && (
                            <SidebarMenuBadge className="ms-auto group-data-[collapsible=icon]:hidden">
                              {item.badge}
                            </SidebarMenuBadge>
                          )}
                          {isRtl ? (
                            isExpanded ? (
                              <ChevronUp className="h-4 w-4 ms-auto group-data-[collapsible=icon]:hidden transition-transform" />
                            ) : (
                              <ChevronDown className="h-4 w-4 ms-auto group-data-[collapsible=icon]:hidden transition-transform" />
                            )
                          ) : (
                            isExpanded ? (
                              <ChevronUp className="h-4 w-4 ms-auto group-data-[collapsible=icon]:hidden transition-transform" />
                            ) : (
                              <ChevronDown className="h-4 w-4 ms-auto group-data-[collapsible=icon]:hidden transition-transform" />
                            )
                          )}
                        </SidebarMenuButton>
                        {isExpanded && (
                          <SidebarMenuSub className="ms-2 border-s-sidebar-border/50">
                            {item.submenu?.map((subItem) => {
                              const SubIcon = subItem.icon ? getIcon(subItem.icon) : null
                              const isSubActive = isActiveRoute(subItem.path)
                              return (
                                <SidebarMenuSubItem key={subItem.path}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isSubActive}
                                    className={cn(
                                      "h-9 text-sm transition-colors",
                                      isSubActive ? "font-medium text-primary bg-sidebar-accent/30" : "text-muted-foreground hover:text-foreground"
                                    )}
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
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={t(item.labelKey)}
                        className={cn(
                          "w-full text-sm font-medium h-10 transition-all duration-200",
                          "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                          "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-sm"
                        )}>
                        <NavLink to={item.path || '#'}>
                          <Icon className="h-5 w-5 shrink-0" />
                          <span className="group-data-[collapsible=icon]:hidden">{t(item.labelKey)}</span>
                          {item.badge && item.badge > 0 && (
                            <SidebarMenuBadge className="ms-auto group-data-[collapsible=icon]:hidden">
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

