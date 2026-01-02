import { FileText } from 'lucide-react'
import type { ProposalStatistics } from '../types/Proposals.types'

interface StatisticsCardsProps {
  statistics: ProposalStatistics
  t: (key: string) => string
}

export function StatisticsCards({ statistics, t }: StatisticsCardsProps) {
  if (statistics.total === 0) {
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{t('proposal.total')}</p>
            <p className="text-2xl font-bold">{statistics.total}</p>
          </div>
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {t('proposal.status.pendingReview')}
            </p>
            <p className="text-2xl font-bold">{statistics.pending}</p>
          </div>
          <FileText className="h-8 w-8 text-warning" />
        </div>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {t('proposal.status.approved')}
            </p>
            <p className="text-2xl font-bold">{statistics.approved}</p>
          </div>
          <FileText className="h-8 w-8 text-success" />
        </div>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {t('proposal.status.rejected')}
            </p>
            <p className="text-2xl font-bold">{statistics.rejected}</p>
          </div>
          <FileText className="h-8 w-8 text-destructive" />
        </div>
      </div>
    </div>
  )
}
