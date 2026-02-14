import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, DataTable } from '@/components/ui'
import { LoadingSpinner, StatusBadge } from '@/components/common'
import { useAdminProjectsReport } from '../../hooks/useReports'
import type { ReportFilters } from '../../api/report.service'

interface AdminProjectsTabProps {
  filters: ReportFilters
}

export function AdminProjectsTab({ filters }: AdminProjectsTabProps) {
  const { t } = useTranslation()
  const { data, isLoading, error } = useAdminProjectsReport(filters)

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
      accessorKey: 'title',
      header: t('project.title'),
      cell: ({ row }: { row: { original: any } }) => (
        <div>
          <div className="font-medium">{row.original.title}</div>
          {row.original.code && <div className="text-xs text-muted-foreground">{row.original.code}</div>}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: t('project.status'),
      cell: ({ row }: { row: { original: any } }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'phase',
      header: t('project.phase'),
      cell: ({ row }: { row: { original: any } }) => {
        const phase = row.original.phase
        return phase ? t(`committee.reports.phase.${phase}`, { defaultValue: phase }) : '-'
      },
    },
    {
      accessorKey: 'specialization',
      header: t('project.specialization'),
      cell: ({ row }: { row: { original: any } }) => row.original.specialization || '-',
    },
    {
      accessorKey: 'supervisor.name',
      header: t('project.supervisor'),
      cell: ({ row }: { row: { original: any } }) =>
        row.original.supervisor?.name || t('common.notAssigned'),
    },
    {
      accessorKey: 'current_students',
      header: t('project.students'),
      cell: ({ row }: { row: { original: any } }) =>
        `${row.original.current_students ?? 0} / ${row.original.max_students || '-'}`,
    },
  ]

  return (
    <div className="space-y-6">
      {data.summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('committee.reports.totalProjects')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('committee.reports.byStatus')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {Object.entries(data.summary.byStatus || {}).slice(0, 5).map(([status, count]) => (
                  <div key={status} className="flex justify-between text-sm">
                    <span>{t(`status.${status}`, { defaultValue: status })}</span>
                    <span className="font-semibold">{String(count)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('committee.reports.byPhase')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {Object.entries(data.summary.byPhase || {}).slice(0, 5).map(([phase, count]) => (
                  <div key={phase} className="flex justify-between text-sm">
                    <span>{t(`committee.reports.phase.${phase}`, { defaultValue: phase })}</span>
                    <span className="font-semibold">{String(count)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data.projects || []}
        isLoading={isLoading}
        enableFiltering={false}
        enableViews={false}
      />
    </div>
  )
}
