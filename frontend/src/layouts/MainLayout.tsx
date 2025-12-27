import type { ReactNode } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '../components/layout/AppSidebar'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { Breadcrumbs } from '../components/common/Breadcrumbs'
import { LAYOUT_CONSTANTS, responsivePadding, responsiveSpacing } from '../components/layout/constants'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="bg-[#f1f3f6] dark:bg-transparent">
        <div className="flex min-h-screen flex-col">
          <Header />
          {/* main content */}
          <div className={cn(
            'mx-auto w-full space-y-4',
            LAYOUT_CONSTANTS.containerMaxWidth,
            responsivePadding.container,
            responsiveSpacing.content
          )}>
            <Breadcrumbs />
            {children}
          </div>
          {/* main content ends */}
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
