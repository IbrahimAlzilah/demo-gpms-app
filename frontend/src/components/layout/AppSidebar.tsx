import { useState, useEffect } from 'react'
import type { ComponentType } from 'react'
import type { SVGProps } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/pages/auth/login'
import { NAV_MENU } from '@/lib/constants'
import { cn } from '@/lib/utils'
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
  useSidebar,
  Button,
} from '@/components/ui'
import * as Icons from 'lucide-react'
import { ChevronDown, ChevronUp, ChevronsLeft, ChevronsRight } from 'lucide-react'
import logo from '@/assets/logo2.png'

const getIcon = (iconName: string): ComponentType<SVGProps<SVGSVGElement>> => {
  return (Icons[iconName as keyof typeof Icons] as ComponentType<SVGProps<SVGSVGElement>>) || Icons.Circle
}

export function AppSidebar() {
  const { user } = useAuthStore()
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const isRtl = i18n.dir() === 'rtl'
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())
  const { toggleSidebar, state } = useSidebar()

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
    <Sidebar side={isRtl ? 'right' : 'left'} collapsible="icon" className="border-r border-sidebar-border/50 bg-sidebar/95 backdrop-blur supports-backdrop-filter:bg-sidebar/60">
      <SidebarHeader className={cn(
        'flex flex-row items-center h-16 px-4 border-b border-sidebar-border/50 transition-all duration-300',
        'group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center'
      )}>
        <div className="flex items-center gap-3 overflow-hidden flex-1 group-data-[collapsible=icon]:hidden">
          <img
            src={logo}
            alt="GPMS Logo"
            className="h-8 w-8 rounded-lg shrink-0 object-contain shadow-none"
          />
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold leading-tight tracking-tight text-sidebar-primary truncate">
              {t('app.shortName', { defaultValue: 'GPMS' })}
            </span>
            <span className="text-[10px] text-muted-foreground truncate">
              {t('app.name', { defaultValue: 'Project Management' })}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-sidebar-foreground/50 hover:text-sidebar-foreground shrink-0"
          onClick={toggleSidebar}
        >
          {isRtl ? (
            state === 'expanded' ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />
          ) : (
            state === 'expanded' ? <ChevronsLeft className="h-4 w-4" /> : <ChevronsRight className="h-4 w-4" />
          )}
        </Button>
      </SidebarHeader>
      <SidebarContent className="px-2 py-2 group-data-[collapsible=icon]:px-0">
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
                            "data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-none"
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
                          "data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-none"
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

