import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, DataTable } from '@/components/ui'
import { LoadingSpinner, StatusBadge } from '@/components/common'
import { useProjectsReportData } from '../../hooks/useReports'
import type { ReportFilters } from '../../api/report.service'

interface ProjectsTabProps {
  filters: ReportFilters
  onExport: (reportType: string, format: 'pdf' | 'excel') => void
}

export function ProjectsTab({ filters }: ProjectsTabProps) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')

  const { data, isLoading, error } = useProjectsReportData({
    ...filters,
    page,
    pageSize,
    search,
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
      accessorKey: 'title',
      header: t('project.title'),
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.title}</div>
          {row.original.code && <div className="text-xs text-muted-foreground">{row.original.code}</div>}
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: t('project.status'),
      cell: ({ row }: any) => <StatusBadge status={typeof row.original.status === 'string' ? row.original.status : row.original.status?.value ?? row.original.status} />,
    },
    {
      accessorKey: 'phase',
      header: t('project.phase'),
      cell: ({ row }: any) => {
        const phase = row.original.phase
        if (!phase) return '-'
        const key = `committee.reports.phase.${phase}`
        const translated = t(key)
        return key !== translated ? translated : phase
      },
    },
    {
      accessorKey: 'specialization',
      header: t('project.specialization'),
    },
    {
      accessorKey: 'supervisor.name',
      header: t('project.supervisor'),
      cell: ({ row }: any) => row.original.supervisor?.name || t('common.notAssigned'),
    },
    {
      accessorKey: 'committee_member_names',
      header: t('committee.reports.discussionCommittee'),
      cell: ({ row }: any) => {
        const names = row.original.committee_member_names
        if (!names || !Array.isArray(names) || names.length === 0) return <span className="text-muted-foreground">-</span>
        return <span className="text-sm">{names.join(', ')}</span>
      },
    },
    {
      accessorKey: 'assigned_group_name',
      header: t('committee.reports.assignedGroup'),
      cell: ({ row }: any) => row.original.assigned_group_name || <span className="text-muted-foreground">-</span>,
    },
    {
      accessorKey: 'fd1_status',
      header: t('committee.reports.fd1Status'),
      cell: ({ row }: any) => {
        const s = row.original.fd1_status
        return s ? t(`status.${s}`, { defaultValue: s }) : '-'
      },
    },
    {
      accessorKey: 'fd2_status',
      header: t('committee.reports.fd2Status'),
      cell: ({ row }: any) => {
        const s = row.original.fd2_status
        return s ? t(`status.${s}`, { defaultValue: s }) : '-'
      },
    },
    {
      accessorKey: 'current_students',
      header: t('project.students'),
      cell: ({ row }: any) => `${row.original.current_students ?? 0} / ${row.original.max_students || '-'}`,
    },
  ]

  return (
    <div className="space-y-6">
      {data.summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.totalProjects')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.byStatus')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {Object.entries(data.summary.byStatus || {}).slice(0, 3).map(([status, count]) => (
                  <div key={status} className="flex justify-between text-sm">
                    <span>{t(`status.${status}`, { defaultValue: status })}</span>
                    <span className="font-semibold">{count as number}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.byPhase')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {Object.entries(data.summary.byPhase || {}).slice(0, 3).map(([phase, count]) => (
                  <div key={phase} className="flex justify-between text-sm">
                    <span>{t(`committee.reports.phase.${phase}`, { defaultValue: phase })}</span>
                    <span className="font-semibold">{count as number}</span>
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
        pageCount={data.pagination?.totalPages || 1}
        pageIndex={page - 1}
        pageSize={pageSize}
        onPaginationChange={(pageIndex, newPageSize) => {
          setPage(pageIndex + 1)
          setPageSize(newPageSize)
        }}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('common.search')}
      />
    </div>
  )
}
