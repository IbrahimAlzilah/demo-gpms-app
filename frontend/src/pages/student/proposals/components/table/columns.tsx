import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ActionsDropdown, type TableAction } from '@/components/common/ActionsDropdown'
import { Badge } from '@/components/ui/badge'
import type { Proposal } from '@/types/project.types'
import { Eye, Edit } from 'lucide-react'
import { formatDateShort } from '@/lib/utils/format'
import type { ProposalTableColumnsProps } from '../../types/Proposals.types'

export function createProposalColumns({
  onView,
  onEdit,
  t,
  readOnly = false,
}: ProposalTableColumnsProps): ColumnDef<Proposal>[] {
  return [
    {
      accessorKey: 'submitter',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('proposal.submitterName')} />
      ),
      cell: ({ row }) => {
        const s = row.original.submitter
        const initial = s?.name?.charAt(0)?.toUpperCase() ?? '?'
        const id = s?.studentId ?? s?.username ?? ''
        return (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="font-medium truncate">{s?.name ?? '-'}</div>
              {id ? (
                <div className="text-xs text-muted-foreground truncate">{id}</div>
              ) : null}
            </div>
          </div>
        )
      },
      enableSorting: true,
      enableColumnFilter: true,
      filterFn: (row, _id, value) => {
        const s = row.original.submitter
        const name = (s?.name ?? '').toLowerCase()
        const sid = (s?.studentId ?? s?.username ?? '').toLowerCase()
        const v = String(value).toLowerCase()
        return name.includes(v) || sid.includes(v)
      },
    },
    {
      accessorKey: 'studentGroup.groupCode',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('group.groupCode')} />
      ),
      cell: ({ row }) =>
        row.original.studentGroup?.groupCode ? (
          <Badge variant="outline">{row.original.studentGroup.groupCode}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
      enableSorting: true,
      enableColumnFilter: true,
      filterFn: (row, _id, value) => {
        const code = (row.original.studentGroup?.groupCode ?? '').toLowerCase()
        return code.includes(String(value).toLowerCase())
      },
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('proposal.title')} />
      ),
      cell: ({ row }) => (
        <div className="font-medium max-w-[200px] truncate">{row.original.title}</div>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('proposal.description')} />
      ),
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate text-muted-foreground text-sm">
          {row.original.description}
        </div>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'submitter.department',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.department')} />
      ),
      cell: ({ row }) => (
        <div className="text-sm">{row.original.submitter?.department ?? '-'}</div>
      ),
      enableSorting: true,
      enableColumnFilter: true,
      filterFn: (row, _id, value) => {
        const dept = (row.original.submitter?.department ?? '').toLowerCase()
        return dept.includes(String(value).toLowerCase())
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.status')} />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      filterFn: (row, id, value) => {
        const vals = Array.isArray(value) ? value : [value]
        return vals.includes(row.getValue(id))
      },
      enableSorting: false,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('proposal.submittedAt')} />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDateShort(row.original.createdAt)}
        </div>
      ),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.actions')} />
      ),
      cell: ({ row }) => {
        const proposal = row.original
        const actions: TableAction<Proposal>[] = [
          {
            id: 'view',
            label: t('common.view'),
            icon: Eye,
            onClick: () => onView(proposal),
          },
        ]
        if (!readOnly && onEdit) {
          actions.push({
            id: 'edit',
            label: t('common.edit'),
            icon: Edit,
            onClick: () => onEdit(proposal),
            hidden: (r: Proposal) =>
              r.status !== 'pending_review' && r.status !== 'requires_modification',
          })
        }
        return <ActionsDropdown row={proposal} actions={actions} />
      },
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
