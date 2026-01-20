import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
    title?: string
    subtitle?: string
    children?: React.ReactNode
    className?: string
}

export function DashboardHeader({ title, subtitle, children, className }: DashboardHeaderProps) {
    const { i18n } = useTranslation()
    const isRTL = i18n.dir() === 'rtl'

    // Get greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good Morning'
        if (hour < 18) return 'Good Afternoon'
        return 'Good Evening'
    }

    const todayDate = new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8", className)}>
            <div className="space-y-1.5 animation-delay-100 animate-in fade-in slide-in-from-bottom-3 duration-700">
                <h1 className="text-3xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                    {title || getGreeting()}
                </h1>
                {subtitle && (
                    <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
                        {subtitle}
                    </p>
                )}
                {!subtitle && (
                    <p className="text-muted-foreground text-sm flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        {todayDate}
                    </p>
                )}
            </div>

            {children && (
                <div className="flex items-center gap-2 animation-delay-300 animate-in fade-in slide-in-from-right-3 duration-700">
                    {children}
                </div>
            )}
        </div>
    )
}
