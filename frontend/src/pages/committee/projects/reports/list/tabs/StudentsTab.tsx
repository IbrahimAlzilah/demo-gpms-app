import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, DataTable } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { useStudentsReport, type ReportFilters } from '../../hooks/useReports'

interface StudentsTabProps {
  filters: ReportFilters
  onExport: (reportType: string, format: 'pdf' | 'excel') => void
}

export function StudentsTab({ filters }: StudentsTabProps) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, isLoading, error } = useStudentsReport({
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
      accessorKey: 'name',
      header: t('common.name'),
    },
    {
      accessorKey: 'student_id',
      header: t('user.studentId'),
    },
    {
      accessorKey: 'department',
      header: t('user.department'),
    },
    {
      accessorKey: 'is_registered',
      header: t('committee.reports.registered'),
      cell: ({ row }: any) => row.original.is_registered ? t('common.yes') : t('common.no'),
    },
    {
      accessorKey: 'project_title',
      header: t('project.title'),
    },
    {
      accessorKey: 'is_in_group',
      header: t('committee.reports.inGroup'),
      cell: ({ row }: any) => row.original.is_in_group ? t('common.yes') : t('common.no'),
    },
  ]

  return (
    <div className="space-y-4">
      {data.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('committee.reports.total')}</div>
              <div className="text-2xl font-bold">{data.summary.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('committee.reports.registered')}</div>
              <div className="text-2xl font-bold">{data.summary.registered}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('committee.reports.unregistered')}</div>
              <div className="text-2xl font-bold">{data.summary.unregistered}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('committee.reports.inGroups')}</div>
              <div className="text-2xl font-bold">{data.summary.in_groups}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data.students || []}
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
