import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, DataTable } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { useAdminSupervisorsReport } from '../../hooks/useReports'
import type { ReportFilters } from '../../api/report.service'

interface AdminSupervisorsTabProps {
  filters: ReportFilters
}

export function AdminSupervisorsTab({ filters }: AdminSupervisorsTabProps) {
  const { t } = useTranslation()
  const { data, isLoading, error } = useAdminSupervisorsReport(filters)

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

  const maxProjects = Math.max(...(data.supervisors || []).map((s) => s.projects_count), 1)

  const columns = [
    { accessorKey: 'name', header: t('common.name'), cell: ({ row }: { row: { original: any } }) => <div className="font-medium">{row.original.name}</div> },
    { accessorKey: 'department', header: t('user.department'), cell: ({ row }: { row: { original: any } }) => row.original.department || '-' },
    {
      accessorKey: 'projects_count',
      header: t('committee.reports.projectsCount'),
      cell: ({ row }: { row: { original: any } }) => {
        const count = row.original.projects_count
        const percentage = (count / maxProjects) * 100
        return (
          <div className="w-full max-w-[120px]">
            <div className="flex justify-between text-xs mb-1">
              <span>{count}</span>
            </div>
            <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percentage}%` }} />
            </div>
          </div>
        )
      },
    },
    { accessorKey: 'students_count', header: t('committee.reports.studentsCount') },
    {
      accessorKey: 'average_grade',
      header: t('committee.reports.averageGrade'),
      cell: ({ row }: { row: { original: any } }) =>
        row.original.average_grade ? Number(row.original.average_grade).toFixed(1) : '-',
    },
    {
      accessorKey: 'pending_evaluations',
      header: t('committee.reports.pendingEvaluations'),
      cell: ({ row }: { row: { original: any } }) => (
        <span
          className={
            row.original.pending_evaluations > 0 ? 'text-amber-600 font-medium' : 'text-muted-foreground'
          }
        >
          {row.original.pending_evaluations}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {data.summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('committee.reports.totalSupervisors')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('committee.reports.totalProjects')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.total_projects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('committee.reports.totalStudents')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.total_students}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data.supervisors || []}
        isLoading={isLoading}
        enableFiltering={false}
        enableViews={false}
      />
    </div>
  )
}
