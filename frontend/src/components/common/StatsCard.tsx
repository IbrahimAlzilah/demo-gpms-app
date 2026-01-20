import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface StatsCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    subValue?: string
    trend?: {
        value: number
        label: string
        positive?: boolean
    }
    color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red'
    onClick?: () => void
}

export function StatsCard({ title, value, icon: Icon, subValue, trend, color = 'blue', onClick }: StatsCardProps) {
    const colorStyles: Record<'blue' | 'green' | 'yellow' | 'purple' | 'red', string> = {
        blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40",
        green: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40",
        yellow: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40",
        purple: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/40",
        red: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/40",
    }

    const style = colorStyles[color]

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                onClick && "cursor-pointer"
            )}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon className={cn("w-16 h-16", style.split(' ')[0])} />
            </div>

            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl transition-colors", style)}>
                    <Icon className="h-5 w-5" />
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center text-xs font-medium px-2 py-1 rounded-full",
                        trend.positive
                            ? "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30"
                            : "text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-900/30"
                    )}>
                        {trend.positive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                        {trend.value}%
                    </div>
                )}
            </div>

            <div className="space-y-1 relative z-10">
                <h3 className="text-sm font-medium text-muted-foreground/90 tracking-wide">{title}</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
                </div>
                {subValue && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{subValue}</p>
                )}
                {trend && (
                    <p className="text-xs text-muted-foreground mt-1">
                        <span className={trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                            {trend.label}
                        </span>
                    </p>
                )}
            </div>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/10 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </div>
    )
}