import { FileText, Clock, CheckCircle2, XCircle, TrendingUp } from 'lucide-react'
import type { ProposalStatistics } from '../types/Proposals.types'
import { cn } from '@/lib/utils'

interface StatisticsCardsProps {
  statistics: ProposalStatistics
  t: (key: string) => string
}

interface StatCard {
  key: string
  labelKey: string
  value: number
  icon: typeof FileText
  gradient: string
  iconColor: string
  textColor: string
  trend?: string
}

export function StatisticsCards({ statistics, t }: StatisticsCardsProps) {
  if (statistics.total === 0) {
    return null
  }

  const cards: StatCard[] = [
    {
      key: 'total',
      labelKey: 'proposal.total',
      value: statistics.total,
      icon: FileText,
      gradient: 'from-slate-500/10 to-slate-600/5 dark:from-slate-400/10 dark:to-slate-500/5',
      iconColor: 'text-slate-600 dark:text-slate-400',
      textColor: 'text-slate-700 dark:text-slate-300',
    },
    {
      key: 'pending',
      labelKey: 'proposal.status.pendingReview',
      value: statistics.pending,
      icon: Clock,
      gradient: 'from-amber-500/10 to-orange-500/5 dark:from-amber-400/10 dark:to-orange-400/5',
      iconColor: 'text-amber-600 dark:text-amber-400',
      textColor: 'text-amber-700 dark:text-amber-300',
      trend: statistics.pending > 0 ? 'awaiting' : undefined,
    },
    {
      key: 'approved',
      labelKey: 'proposal.status.approved',
      value: statistics.approved,
      icon: CheckCircle2,
      gradient: 'from-emerald-500/10 to-green-500/5 dark:from-emerald-400/10 dark:to-green-400/5',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      textColor: 'text-emerald-700 dark:text-emerald-300',
    },
    {
      key: 'rejected',
      labelKey: 'proposal.status.rejected',
      value: statistics.rejected,
      icon: XCircle,
      gradient: 'from-rose-500/10 to-red-500/5 dark:from-rose-400/10 dark:to-red-400/5',
      iconColor: 'text-rose-600 dark:text-rose-400',
      textColor: 'text-rose-700 dark:text-rose-300',
    },
  ]

  // Calculate approval rate for total card
  const approvalRate = statistics.total > 0
    ? Math.round((statistics.approved / statistics.total) * 100)
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon
        const showTrend = card.key === 'total' && approvalRate > 0

        return (
          <div
            key={card.key}
            className={cn(
              'relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 transition-all duration-300',
              'hover:shadow-md hover:scale-[1.02] hover:border-primary/20',
              card.gradient
            )}
          >
            {/* Decorative background element */}
            <div className="absolute -top-4 -end-4 h-24 w-24 rounded-full bg-gradient-radial from-current/5 to-transparent opacity-50" />

            <div className="relative flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {t(card.labelKey)}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className={cn('text-3xl font-bold tracking-tight', card.textColor)}>
                    {card.value}
                  </p>
                  {showTrend && (
                    <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="h-3 w-3" />
                      {approvalRate}%
                    </span>
                  )}
                  {card.trend && card.value > 0 && (
                    <span className="text-xs font-medium text-muted-foreground animate-pulse">
                      •
                    </span>
                  )}
                </div>
              </div>
              <div className={cn(
                'rounded-lg p-2.5 bg-background/50 backdrop-blur-sm shadow-sm',
                'ring-1 ring-inset ring-black/5 dark:ring-white/10'
              )}>
                <Icon className={cn('h-5 w-5', card.iconColor)} />
              </div>
            </div>

            {/* Progress bar for pending items */}
            {card.key === 'pending' && statistics.total > 0 && (
              <div className="mt-3 pt-3 border-t border-current/10">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>{t('common.progress')}</span>
                  <span>{Math.round(((statistics.total - statistics.pending) / statistics.total) * 100)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${((statistics.total - statistics.pending) / statistics.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
