import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, DataTable } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { useStudentsReport } from '../../hooks/useReports'
import type { ReportFilters } from '../../api/report.service'
import { Users, UserCheck, UserX, Users as UsersGroup } from 'lucide-react'

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
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.name}</div>
      )
    },
    {
      accessorKey: 'student_id',
      header: t('user.studentId'),
    },
    {
      accessorKey: 'department',
      header: t('user.department'),
      cell: ({ row }: any) => row.original.department || '-',
    },
    {
      accessorKey: 'is_registered',
      header: t('committee.reports.registered'),
      cell: ({ row }: any) => (
        <span className={row.original.is_registered ? "text-green-600 font-medium" : "text-amber-600"}>
          {row.original.is_registered ? t('common.yes') : t('common.no')}
        </span>
      ),
    },
    {
      accessorKey: 'project_title',
      header: t('project.title'),
      cell: ({ row }: any) => row.original.project_title || <span className="text-muted-foreground">-</span>,
    },
    {
      accessorKey: 'is_in_group',
      header: t('committee.reports.inGroup'),
      cell: ({ row }: any) => row.original.is_in_group ? t('common.yes') : t('common.no'),
    },
  ]

  const total = data.summary?.total || 1
  const registeredPercent = Math.round(((data.summary?.registered || 0) / total) * 100)
  const unregisteredPercent = Math.round(((data.summary?.unregistered || 0) / total) * 100)
  const inGroupsPercent = Math.round(((data.summary?.in_groups || 0) / total) * 100)

  return (
    <div className="space-y-6">
      {data.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.total')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.registered')}</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.registered}</div>
              <div className="text-xs text-muted-foreground mt-1">{registeredPercent}% {t('common.ofTotal')}</div>
              <div className="h-1.5 w-full bg-secondary/30 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-green-600 rounded-full" style={{ width: `${registeredPercent}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.unregistered')}</CardTitle>
              <UserX className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.unregistered}</div>
              <div className="text-xs text-muted-foreground mt-1">{unregisteredPercent}% {t('common.ofTotal')}</div>
              <div className="h-1.5 w-full bg-secondary/30 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-amber-600 rounded-full" style={{ width: `${unregisteredPercent}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.inGroups')}</CardTitle>
              <UsersGroup className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.in_groups}</div>
              <div className="text-xs text-muted-foreground mt-1">{inGroupsPercent}% {t('common.ofTotal')}</div>
              <div className="h-1.5 w-full bg-secondary/30 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${inGroupsPercent}%` }} />
              </div>
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
