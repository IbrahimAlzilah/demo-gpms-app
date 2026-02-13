import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, DataTable } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { useDiscussionCommitteesReport } from '../../hooks/useReports'
import type { ReportFilters } from '../../api/report.service'
import { Briefcase } from 'lucide-react'

interface DiscussionCommitteesTabProps {
  filters: ReportFilters
  onExport: (reportType: string, format: 'pdf' | 'excel') => void
}

export function DiscussionCommitteesTab({ filters }: DiscussionCommitteesTabProps) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, isLoading, error } = useDiscussionCommitteesReport({
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
      accessorKey: 'title',
      header: t('project.title'),
      cell: ({ row }: any) => <div className="font-medium">{row.original.title}</div>,
    },
    {
      accessorKey: 'status',
      header: t('project.status'),
      cell: ({ row }: any) => <span className="text-sm">{row.original.status ?? '-'}</span>,
    },
    {
      accessorKey: 'supervisor_name',
      header: t('project.supervisor'),
      cell: ({ row }: any) => row.original.supervisor_name || <span className="text-muted-foreground">-</span>,
    },
    {
      accessorKey: 'committee_member_names',
      header: t('committee.reports.discussionCommittee'),
      cell: ({ row }: any) => {
        const names = row.original.committee_member_names
        if (!names || names.length === 0) return <span className="text-muted-foreground">-</span>
        return <span className="text-sm">{names.join(', ')}</span>
      },
    },
    {
      accessorKey: 'fd1_status',
      header: t('committee.reports.fd1Status'),
      cell: ({ row }: any) => row.original.fd1_status ?? '-',
    },
    {
      accessorKey: 'fd2_status',
      header: t('committee.reports.fd2Status'),
      cell: ({ row }: any) => row.original.fd2_status ?? '-',
    },
    {
      accessorKey: 'students_count',
      header: t('committee.reports.studentsCount'),
      cell: ({ row }: any) => row.original.students_count ?? 0,
    },
  ]

  const memberWorkload = data.member_workload || []

  return (
    <div className="space-y-6">
      {data.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.projectsWithCommittee')}</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.total}</div>
            </CardContent>
          </Card>
          {data.summary.total_committee_members != null && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.memberWorkload')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.summary.total_committee_members}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('committee.reports.membersWithAssignments')}</p>
              </CardContent>
            </Card>
          )}
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
      />

      {memberWorkload.length > 0 && (
        <Card className="print-break-before">
          <CardHeader>
            <CardTitle className="text-base">{t('committee.reports.memberWorkload')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('committee.reports.memberWorkloadDescription')}</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-medium">{t('common.name')}</th>
                    <th className="text-left py-2 px-2 font-medium">{t('user.email')}</th>
                    <th className="text-right py-2 px-2 font-medium">{t('committee.reports.projectsCount')}</th>
                    <th className="text-left py-2 px-2 font-medium">{t('project.title')}</th>
                  </tr>
                </thead>
                <tbody>
                  {memberWorkload.map((mw: { id: number; name: string; email: string | null; projects_count: number; projects: Array<{ title: string; fd1_status: string; fd2_status: string }> }) => (
                    <tr key={mw.id} className="border-b last:border-0">
                      <td className="py-2 px-2">{mw.name}</td>
                      <td className="py-2 px-2 text-muted-foreground">{mw.email ?? '-'}</td>
                      <td className="py-2 px-2 text-right font-medium">{mw.projects_count}</td>
                      <td className="py-2 px-2">
                        {(mw.projects || []).map((p, i) => (
                          <span key={i} className="block text-muted-foreground">
                            {p.title} (FD1: {p.fd1_status}, FD2: {p.fd2_status})
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
