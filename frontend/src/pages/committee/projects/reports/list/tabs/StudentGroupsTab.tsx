import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, DataTable } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { useStudentGroupsReport } from '../../hooks/useReports'
import type { ReportFilters } from '../../api/report.service'
import { Users } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StudentGroupsTabProps {
  filters: ReportFilters
  onExport: (reportType: string, format: 'pdf' | 'excel') => void
}

function ReadinessBadge({ readiness }: { readiness: string }) {
  const { t } = useTranslation()
  const key = `committee.reports.readiness.${readiness}`
  const label = t(key)
  const variant = readiness === 'all_completed' ? 'text-green-600' : readiness === 'all_ready_fd2' ? 'text-blue-600' : readiness === 'all_ready_fd1' ? 'text-amber-600' : readiness === 'mixed' ? 'text-orange-600' : 'text-muted-foreground'
  return <span className={cn('font-medium', variant)}>{label}</span>
}

function DefenseStatusLabel({ status }: { status: string }) {
  const { t } = useTranslation()
  const key = status ? `committee.reports.defenseStatus.${status}` : 'committee.reports.defenseStatus.in_progress'
  const label = t(key)
  const color = status === 'completed' ? 'text-green-600' : status === 'ready_for_fd2' ? 'text-blue-600' : status === 'ready_for_fd1' ? 'text-amber-600' : 'text-muted-foreground'
  return <span className={color}>{label}</span>
}

export function StudentGroupsTab({ filters }: StudentGroupsTabProps) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [openRows, setOpenRows] = useState<Set<number>>(new Set())

  const { data, isLoading, error } = useStudentGroupsReport({
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
      accessorKey: 'group_code',
      header: t('committee.reports.groupCode'),
      cell: ({ row }: any) => (
        <div className="font-mono font-medium">{row.original.group_code}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: t('common.name'),
      cell: ({ row }: any) => row.original.name || '-',
    },
    {
      accessorKey: 'leader_name',
      header: t('committee.reports.leader'),
      cell: ({ row }: any) => row.original.leader_name || '-',
    },
    {
      accessorKey: 'member_count',
      header: t('committee.reports.memberCount'),
      cell: ({ row }: any) => row.original.member_count ?? 0,
    },
    {
      accessorKey: 'overall_readiness',
      header: t('committee.reports.overallReadiness'),
      cell: ({ row }: any) => (
        <ReadinessBadge readiness={row.original.overall_readiness || 'in_progress'} />
      ),
    },
    {
      accessorKey: 'project_title',
      header: t('project.title'),
      cell: ({ row }: any) => row.original.project_title || <span className="text-muted-foreground">-</span>,
    },
    {
      accessorKey: 'supervisor_name',
      header: t('project.supervisor'),
      cell: ({ row }: any) => row.original.supervisor_name || <span className="text-muted-foreground">-</span>,
    },
    {
      accessorKey: 'members',
      header: t('committee.reports.membersAndStatus'),
      cell: ({ row }: any) => {
        const members = row.original.members || []
        const groupId = row.original.id
        const isOpen = openRows.has(groupId)
        if (members.length === 0) return <span className="text-muted-foreground">-</span>
        return (
          <Collapsible
            open={isOpen}
            onOpenChange={(open) => {
              setOpenRows((prev) => {
                const next = new Set(prev)
                if (open) next.add(groupId)
                else next.delete(groupId)
                return next
              })
            }}
          >
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                {t('committee.reports.viewMembers', { count: members.length })}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="mt-2 space-y-1 pl-4 text-xs">
                {members.map((m: { id: number; name: string; student_id?: string; defense_status: string }) => (
                  <li key={m.id} className="flex justify-between gap-2">
                    <span>{m.name || '-'} {m.student_id && <span className="text-muted-foreground">({m.student_id})</span>}</span>
                    <DefenseStatusLabel status={m.defense_status} />
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      {data.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.totalGroups')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.total}</div>
            </CardContent>
          </Card>

          {data.summary.by_readiness && Object.keys(data.summary.by_readiness).length > 0 && (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('committee.reports.byReadiness')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {(['all_completed', 'all_ready_fd2', 'all_ready_fd1', 'mixed', 'in_progress'] as const).map((readiness) => (
                    <div key={readiness} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{t(`committee.reports.readiness.${readiness}`, { defaultValue: readiness })}:</span>
                      <span className="font-semibold">{data.summary.by_readiness?.[readiness] ?? 0}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <DataTable
        columns={columns}
        data={data.groups || []}
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
