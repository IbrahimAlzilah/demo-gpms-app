import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isRTL } from '@/lib/utils/rtl'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const rtl = isRTL()

  // Auto-generate breadcrumbs from path if not provided
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    const paths = location.pathname.split('/').filter(Boolean)
    const generated: BreadcrumbItem[] = [
      { label: t('nav.home') || 'الرئيسية', href: '/' }
    ]

    let currentPath = ''
    paths.forEach((path, index) => {
      currentPath += `/${path}`
      const label = t(`nav.${path}`) || path
      if (index < paths.length - 1) {
        generated.push({ label, href: currentPath })
      } else {
        generated.push({ label })
      }
    })

    return generated
  })()

  if (breadcrumbItems.length <= 1) {
    return null
  }

  return (
    <nav
      aria-label={t('common.breadcrumbs') || 'مسار التنقل'}
      className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}
    >
      <ol className="flex items-center gap-2" itemScope itemType="https://schema.org/BreadcrumbList">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1
          
          return (
            <li
              key={index}
              className="flex items-center gap-2"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {index === 0 ? (
                <Link
                  to={item.href || '/'}
                  className={cn(
                    'flex items-center gap-1 hover:text-foreground transition-colors',
                    isLast && 'text-foreground font-medium'
                  )}
                  itemProp="item"
                >
                  <Home className="h-4 w-4" />
                  <span itemProp="name">{item.label}</span>
                </Link>
              ) : (
                <>
                  <ChevronLeft
                    className={cn('h-4 w-4 text-muted-foreground/50', rtl && 'rotate-180')}
                    aria-hidden="true"
                  />
                  {isLast ? (
                    <span className="text-foreground font-medium" itemProp="name">
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      to={item.href || '#'}
                      className="hover:text-foreground transition-colors"
                      itemProp="item"
                    >
                      <span itemProp="name">{item.label}</span>
                    </Link>
                  )}
                </>
              )}
              <meta itemProp="position" content={String(index + 1)} />
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

