import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    subValue?: string
    color?: 'blue' | 'green' | 'yellow' | 'purple'
}

export function StatsCard({ title, value, icon: Icon, subValue, color = 'blue' }: StatsCardProps) {
    const colorStyles: Record<'blue' | 'green' | 'yellow' | 'purple', string> = {
        blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
        green: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
        yellow: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
        purple: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
    }

    const style = colorStyles[color]

    return (
        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between transition-all duration-300">

            {/* Content Section */}
            <div className="flex flex-col space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground/80">{title}</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
                </div>
                {subValue && <p className="text-xs font-medium text-muted-foreground/80 mt-1">{subValue}</p>}
            </div>

            {/* Icon Section */}
            <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105", style)}>
                <Icon className="h-6 w-6" />
            </div>
        </div>
    )
}