import { useState } from 'react'
import type { ReactNode } from 'react'
import { Sidebar } from '../../components/layout/Sidebar'
import { Header } from '../../components/layout/Header'
import { Footer } from '../../components/layout/Footer'
import { Breadcrumbs } from '../../components/common/Breadcrumbs'
import { cn } from '@/lib/utils'
import { isRTL } from '@/lib/utils/rtl'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const rtl = isRTL()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        {/* Sidebar - hidden on mobile, shown on desktop */}
        <div
          className={cn(
            'fixed inset-y-0 z-50 lg:static lg:z-auto',
            rtl ? 'end-0' : 'start-0',
            'transition-transform duration-300 ease-in-out',
            sidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full lg:translate-x-0'
          )}
        >
          <Sidebar />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        {/* <main className={cn('flex-1', rtl ? 'lg:me-64' : 'lg:ms-64')}> */}
        <main className='flex-1'>
          <div className="container mx-auto px-4 py-6 lg:px-8 space-y-4">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
