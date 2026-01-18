import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, DataTable } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { useDeadlinesReport } from '../../hooks/useReports'
import type { ReportFilters } from '../../api/report.service'
import { Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react'

interface DeadlinesTabProps {
  filters: ReportFilters
  onExport: (reportType: string, format: 'pdf' | 'excel') => void
}

export function DeadlinesTab({ filters }: DeadlinesTabProps) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, isLoading, error } = useDeadlinesReport({
    ...filters,
    page,
    pageSize,
  })

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

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  const columns = [
    {
      accessorKey: 'project.title',
      header: t('project.title'),
      cell: ({ row }: any) => row.original.project?.title || '-',
    },
    {
      accessorKey: 'title',
      header: t('milestone.title'),
    },
    {
      accessorKey: 'due_date',
      header: t('milestone.dueDate'),
      cell: ({ row }: any) => formatDate(row.original.due_date),
    },
    {
      accessorKey: 'completed',
      header: t('common.status'),
      cell: ({ row }: any) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${row.original.completed
            ? "bg-green-50 text-green-700 border-green-200"
            : new Date(row.original.due_date) < new Date()
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-blue-50 text-blue-700 border-blue-200"
          }`}>
          {row.original.completed
            ? t('common.completed')
            : new Date(row.original.due_date) < new Date()
              ? t('common.overdue')
              : t('common.pending')}
        </span>
      ),
    },
  ]

  const completionRate = data.summary.total > 0
    ? Math.round((data.summary.completed / data.summary.total) * 100)
    : 0

  return (
    <div className="space-y-6">
      {data.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.total')}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('common.completed')}</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.completed}</div>
              <div className="text-xs text-muted-foreground mt-1">{completionRate}% {t('common.completionRate')}</div>
              <div className="h-1.5 w-full bg-secondary/30 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-green-600 rounded-full" style={{ width: `${completionRate}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('common.overdue')}</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.overdue}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.avgDelay')}</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.average_delay_days} <span className="text-sm font-normal text-muted-foreground">{t('common.days')}</span></div>
            </CardContent>
          </Card>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data.overdue_milestones || []}
        isLoading={isLoading}
        pageCount={data.pagination?.totalPages || 1}
        pageIndex={page - 1}
        pageSize={pageSize}
        onPaginationChange={(pageIndex, newPageSize) => {
          setPage(pageIndex + 1)
          setPageSize(newPageSize)
        }}
      />
    </div>
  )
}
