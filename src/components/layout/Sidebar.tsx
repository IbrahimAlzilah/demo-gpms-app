import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { NAV_MENU } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { isRTL } from '@/lib/utils/rtl'
import type { ComponentType } from 'react'
import type { SVGProps } from 'react'
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  FileCheck,
  FolderOpen,
  TrendingUp,
  Award,
  UserCheck,
  ClipboardCheck,
  Calendar,
  Megaphone,
  UserPlus,
  FileBarChart,
  Circle,
} from 'lucide-react'

interface SidebarProps {
  className?: string
}

const iconMap: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  FileCheck,
  FolderOpen,
  TrendingUp,
  Award,
  UserCheck,
  ClipboardCheck,
  Calendar,
  Megaphone,
  UserPlus,
  FileBarChart,
  Circle,
}

export function Sidebar({ className }: SidebarProps) {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const rtl = isRTL()

  if (!user) return null

  const menuItems = NAV_MENU[user.role] || []

  const getIcon = (iconName: string): ComponentType<SVGProps<SVGSVGElement>> => {
    return iconMap[iconName] || Circle
  }

  return (
    <aside
      className={cn(
        'h-screen w-64 bg-sidebar text-sidebar-foreground border-sidebar-border transition-colors duration-200',
        rtl ? 'border-e' : 'border-s',
        className
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo/Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <img 
            src="/src/assets/logo.png" 
            alt="GPMS Logo" 
            className="h-8 w-8 object-contain"
          />
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-sidebar-primary to-sidebar-foreground bg-clip-text text-transparent">
            {t('app.shortName')}
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4 custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = getIcon(item.icon)
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out',
                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-sidebar-primary/20'
                      : 'text-muted-foreground hover:translate-x-1'
                  )
                }
              >
                <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", rtl && "flip-if-needed")} />
                <span>{t(item.labelKey)}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ms-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary/10 px-1.5 text-[10px] font-bold text-sidebar-primary">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* User User Profile / Footer could go here */}
      </div>
    </aside>
  )
}
