import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#444cf7_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="w-full max-w-md z-10 p-6">
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 shadow-xl rounded-2xl p-8 animate-in fade-in zoom-in-95 duration-500">
          {children}
        </div>
      </div>
    </div>
  )
}

