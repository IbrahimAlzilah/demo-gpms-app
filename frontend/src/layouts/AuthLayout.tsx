import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Professional Pattern Background */}
      <div className="absolute inset-0 z-0 w-full h-full bg-muted/30">
        {/* Abstract Geometric Shapes - Grid Pattern */}
        <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Gradient Orbs for depth and modern feel */}
        <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-primary/10 opacity-40 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/10 opacity-40 blur-[120px] animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-[450px] z-10 p-4 sm:p-6 relative">
        <div className="bg-card/75 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl shadow-primary/5 rounded-3xl p-8 sm:p-10 animate-in fade-in zoom-in-95 duration-500 relative ring-1 ring-black/5 dark:ring-white/5">
          {children}
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground/60 font-medium">
          &copy; {new Date().getFullYear()} University GPMS System
        </div>
      </div>
    </div>
  )
}

