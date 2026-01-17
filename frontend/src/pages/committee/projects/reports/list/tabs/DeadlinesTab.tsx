import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, DataTable } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { useDeadlinesReport, type ReportFilters } from '../../hooks/useReports'

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

  const columns = [
    {
      accessorKey: 'project.title',
      header: t('project.title'),
    },
    {
      accessorKey: 'title',
      header: t('milestone.title'),
    },
    {
      accessorKey: 'due_date',
      header: t('milestone.dueDate'),
    },
    {
      accessorKey: 'completed',
      header: t('common.status'),
      cell: ({ row }: any) => row.original.completed ? t('common.completed') : t('common.overdue'),
    },
  ]

  return (
    <div className="space-y-4">
      {data.summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('committee.reports.total')}</div>
              <div className="text-2xl font-bold">{data.summary.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('common.completed')}</div>
              <div className="text-2xl font-bold">{data.summary.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('common.overdue')}</div>
              <div className="text-2xl font-bold">{data.summary.overdue}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('committee.reports.onTime')}</div>
              <div className="text-2xl font-bold">{data.summary.on_time}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('committee.reports.avgDelay')}</div>
              <div className="text-2xl font-bold">{data.summary.average_delay_days} {t('common.days')}</div>
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
