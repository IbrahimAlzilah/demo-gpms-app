import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, DataTable } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { useSupervisorsReport, type ReportFilters } from '../../hooks/useReports'

interface SupervisorsTabProps {
  filters: ReportFilters
  onExport: (reportType: string, format: 'pdf' | 'excel') => void
}

export function SupervisorsTab({ filters }: SupervisorsTabProps) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, isLoading, error } = useSupervisorsReport({
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
      accessorKey: 'department',
      header: t('user.department'),
    },
    {
      accessorKey: 'projects_count',
      header: t('committee.reports.projectsCount'),
    },
    {
      accessorKey: 'students_count',
      header: t('committee.reports.studentsCount'),
    },
    {
      accessorKey: 'average_grade',
      header: t('committee.reports.averageGrade'),
    },
    {
      accessorKey: 'pending_evaluations',
      header: t('committee.reports.pendingEvaluations'),
    },
  ]

  return (
    <div className="space-y-4">
      {data.summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('committee.reports.totalSupervisors')}</div>
              <div className="text-2xl font-bold">{data.summary.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('committee.reports.totalProjects')}</div>
              <div className="text-2xl font-bold">{data.summary.total_projects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{t('committee.reports.totalStudents')}</div>
              <div className="text-2xl font-bold">{data.summary.total_students}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data.supervisors || []}
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
