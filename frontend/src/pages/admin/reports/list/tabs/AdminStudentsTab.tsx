import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, DataTable } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { useAdminStudentsReport } from '../../hooks/useReports'
import type { ReportFilters } from '../../api/report.service'

interface AdminStudentsTabProps {
  filters: ReportFilters
}

export function AdminStudentsTab({ filters }: AdminStudentsTabProps) {
  const { t } = useTranslation()
  const { data, isLoading, error } = useAdminStudentsReport(filters)

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
    { accessorKey: 'name', header: t('common.name'), cell: ({ row }: { row: { original: any } }) => <div className="font-medium">{row.original.name}</div> },
    { accessorKey: 'student_id', header: t('user.studentId'), cell: ({ row }: { row: { original: any } }) => row.original.student_id || '-' },
    { accessorKey: 'department', header: t('user.department'), cell: ({ row }: { row: { original: any } }) => row.original.department || '-' },
    {
      accessorKey: 'is_registered',
      header: t('committee.reports.registered'),
      cell: ({ row }: { row: { original: any } }) => (
        <span className={row.original.is_registered ? 'text-green-600 font-medium' : 'text-amber-600'}>
          {row.original.is_registered ? t('common.yes') : t('common.no')}
        </span>
      ),
    },
    {
      accessorKey: 'project_title',
      header: t('project.title'),
      cell: ({ row }: { row: { original: any } }) => row.original.project_title || <span className="text-muted-foreground">-</span>,
    },
    {
      accessorKey: 'is_in_group',
      header: t('committee.reports.inGroup'),
      cell: ({ row }: { row: { original: any } }) => (row.original.is_in_group ? t('common.yes') : t('common.no')),
    },
  ]

  const total = data.summary?.total || 1

  return (
    <div className="space-y-6">
      {data.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.registered')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{data.summary.registered}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(((data.summary.registered || 0) / total) * 100)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.unregistered')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{data.summary.unregistered}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(((data.summary.unregistered || 0) / total) * 100)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.inGroups')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.in_groups ?? 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data.students || []}
        isLoading={isLoading}
        enableFiltering={false}
        enableViews={false}
      />
    </div>
  )
}
