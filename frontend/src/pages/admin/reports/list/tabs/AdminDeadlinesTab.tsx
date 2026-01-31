import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, DataTable } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { useAdminDeadlinesReport } from '../../hooks/useReports'
import type { ReportFilters } from '../../api/report.service'

interface AdminDeadlinesTabProps {
  filters: ReportFilters
}

export function AdminDeadlinesTab({ filters }: AdminDeadlinesTabProps) {
  const { t } = useTranslation()
  const { data, isLoading, error } = useAdminDeadlinesReport(filters)

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        {t('common.errorLoadingData')}
      </div>
    )
  }

  const formatDate = (d: string | { format?: (s: string) => string } | null) => {
    if (!d) return '-'
    if (typeof d === 'string') return new Date(d).toLocaleDateString()
    return (d as any).format?.('Y-m-d') ?? '-'
  }

  const overdue = data.overdue_milestones || []
  const overdueItems = Array.isArray(overdue) ? overdue : []

  const columns = [
    {
      accessorKey: 'project',
      header: t('project.title'),
      cell: ({ row }: { row: { original: any } }) => row.original.project?.title || '-',
    },
    {
      accessorKey: 'title',
      header: t('milestone.title', { defaultValue: 'Milestone' }),
      cell: ({ row }: { row: { original: any } }) => row.original.title || '-',
    },
    {
      accessorKey: 'due_date',
      header: t('milestone.dueDate', { defaultValue: 'Due Date' }),
      cell: ({ row }: { row: { original: any } }) => formatDate(row.original.due_date),
    },
    {
      accessorKey: 'completed',
      header: t('common.status'),
      cell: ({ row }: { row: { original: any } }) => {
        const completed = row.original.completed
        const dueDate = row.original.due_date
        const isOverdue = !completed && dueDate && new Date(dueDate) < new Date()
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${completed
                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:border-green-800'
                : isOverdue
                  ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:border-red-800'
                  : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
              }`}
          >
            {completed ? t('common.completed') : isOverdue ? t('common.overdue') : t('common.pending')}
          </span>
        )
      },
    },
  ]

  const completionRate =
    data.summary.total > 0 ? Math.round((data.summary.completed / data.summary.total) * 100) : 0

  return (
    <div className="space-y-6">
      {data.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.total')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('common.completed')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{data.summary.completed}</div>
              <p className="text-xs text-muted-foreground mt-1">{completionRate}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('common.overdue')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{data.summary.overdue}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.onTime')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.on_time}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.delayed')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{data.summary.delayed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.avgDelayDays')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.average_delay_days}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{t('committee.reports.overdueMilestones')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={overdueItems}
            isLoading={isLoading}
            enableFiltering={false}
            enableViews={false}
          />
        </CardContent>
      </Card>
    </div>
  )
}
