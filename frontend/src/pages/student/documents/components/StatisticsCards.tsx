import { FolderOpen, Clock, CheckCircle2, XCircle } from 'lucide-react'
import type { DocumentStatistics } from '../types/Documents.types'

interface StatisticsCardsProps {
  statistics: DocumentStatistics
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
            <p className="text-sm text-muted-foreground">{t('document.total')}</p>
            <p className="text-2xl font-bold">{statistics.total}</p>
          </div>
          <FolderOpen className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {t('document.status.pending')}
            </p>
            <p className="text-2xl font-bold">{statistics.pending}</p>
          </div>
          <Clock className="h-8 w-8 text-warning" />
        </div>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {t('document.status.approved')}
            </p>
            <p className="text-2xl font-bold">{statistics.approved}</p>
          </div>
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {t('document.status.rejected')}
            </p>
            <p className="text-2xl font-bold">{statistics.rejected}</p>
          </div>
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
      </div>
    </div>
  )
}
