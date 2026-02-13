import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, DataTable } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { useSupervisorsReport } from '../../hooks/useReports'
import type { ReportFilters } from '../../api/report.service'
import { Users, Briefcase, GraduationCap } from 'lucide-react'

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

  const maxProjects = Math.max(...(data.supervisors || []).map(s => s.projects_count), 5)

  const columns = [
    {
      accessorKey: 'name',
      header: t('common.name'),
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.name}</div>
      )
    },
    {
      accessorKey: 'department',
      header: t('user.department'),
      cell: ({ row }: any) => row.original.department || '-',
    },
    {
      accessorKey: 'projects_count',
      header: t('committee.reports.projectsCount'),
      cell: ({ row }: any) => {
        const count = row.original.projects_count
        const percentage = (count / maxProjects) * 100
        return (
          <div className="w-full max-w-[120px]">
            <div className="flex justify-between text-xs mb-1">
              <span>{count}</span>
            </div>
            <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'students_count',
      header: t('committee.reports.studentsCount'),
    },
    {
      accessorKey: 'by_status',
      header: t('committee.reports.statusBreakdown'),
      cell: ({ row }: any) => {
        const byStatus = row.original.by_status
        if (!byStatus || typeof byStatus !== 'object' || Object.keys(byStatus).length === 0) return <span className="text-muted-foreground">-</span>
        return (
          <div className="flex flex-wrap gap-1">
            {Object.entries(byStatus).map(([status, count]) => (
              <span key={status} className="inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 text-xs font-medium">
                {status}: {String(count)}
              </span>
            ))}
          </div>
        )
      },
    },
    {
      accessorKey: 'average_grade',
      header: t('committee.reports.averageGrade'),
      cell: ({ row }: any) => row.original.average_grade ? Number(row.original.average_grade).toFixed(1) : '-',
    },
    {
      accessorKey: 'pending_evaluations',
      header: t('committee.reports.pendingEvaluations'),
      cell: ({ row }: any) => (
        <span className={row.original.pending_evaluations > 0 ? "text-amber-600 font-medium" : "text-muted-foreground"}>
          {row.original.pending_evaluations}
        </span>
      ),
    },
    {
      accessorKey: 'project_titles',
      header: t('committee.reports.projectsList'),
      cell: ({ row }: any) => {
        const titles = row.original.project_titles
        if (!titles || titles.length === 0) return <span className="text-muted-foreground">-</span>
        return <span className="text-sm" title={titles.join('\n')}>{titles.join(', ')}</span>
      },
    },
  ]

  return (
    <div className="space-y-6">
      {data.summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.totalSupervisors')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.totalProjects')}</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.total_projects}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.totalStudents')}</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
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
