import type { ReactNode } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '../components/layout/AppSidebar'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'

import { responsivePadding, responsiveSpacing } from '../components/layout/constants'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="bg-muted/30 dark:bg-background transition-colors">
        <div className="flex min-h-screen flex-col">
          <Header />
          {/* main content */}
          <div className={cn(
            'mx-auto w-full max-w-full space-y-4', // padding handled by responsivePadding
            responsivePadding.container,
            responsiveSpacing.content
          )}>
            {children}
          </div>
          {/* main content ends */}
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
