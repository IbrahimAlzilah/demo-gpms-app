import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    subValue?: string
    color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red'
    onClick?: () => void
}

export function StatsCard({ title, value, icon: Icon, subValue, color = 'blue', onClick }: StatsCardProps) {
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
                "group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300",
                onClick && "cursor-pointer"
            )}
        >
            <div className="flex items-center justify-between">
                <div className="space-y-1 relative z-10">
                    <h3 className="text-sm font-medium text-muted-foreground/90 tracking-wide">{title}</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold tracking-tight text-foreground">{value}</span>
                    </div>
                    {subValue && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{subValue}</p>
                    )}
                </div>
                <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-2.5 rounded-xl transition-colors", style)}>
                        <Icon className="size-6" />
                    </div>
                </div>
            </div>
        </div>
    )
}