import { FileCheck, CheckCircle2, XCircle, Clock } from 'lucide-react'
import type { RequestStatistics } from '../types/Requests.types'

interface StatisticsCardsProps {
  statistics: RequestStatistics
  t: (key: string) => string
}

export function StatisticsCards({ statistics, t }: StatisticsCardsProps) {
  if (statistics.total === 0) return null

  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{t('request.total')}</p>
            <p className="text-2xl font-bold">{statistics.total}</p>
          </div>
          <FileCheck className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{t('request.status.pending')}</p>
            <p className="text-2xl font-bold">{statistics.pending}</p>
          </div>
          <Clock className="h-8 w-8 text-warning" />
        </div>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{t('request.status.approved')}</p>
            <p className="text-2xl font-bold">{statistics.approved}</p>
          </div>
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{t('request.status.rejected')}</p>
            <p className="text-2xl font-bold">{statistics.rejected}</p>
          </div>
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
      </div>
    </div>
  )
}
