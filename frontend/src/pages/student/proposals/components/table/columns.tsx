import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ActionsDropdown } from '@/components/common/ActionsDropdown'
import type { Proposal } from '@/types/project.types'
import { Eye, Edit, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'
import type { ProposalTableColumnsProps } from '../../types/Proposals.types'

export function createProposalColumns({
  onView,
  onEdit,
  t,
}: ProposalTableColumnsProps): ColumnDef<Proposal>[] {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-success" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-destructive" />
      case 'requires_modification':
        return <AlertCircle className="h-4 w-4 text-warning" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  return [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('proposal.title')} />
      ),
      cell: ({ row }) => (
        <div className="font-medium flex items-center gap-2">
          {getStatusIcon(row.original.status)}
          <span className="max-w-[300px] truncate">{row.original.title}</span>
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('proposal.description')} />
      ),
      cell: ({ row }) => (
        <div className="max-w-[400px] truncate text-muted-foreground text-sm">
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.status')} />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('proposal.submittedAt')} />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatRelativeTime(row.original.createdAt)}
        </div>
      ),
    },
    {
      accessorKey: 'reviewedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('proposal.reviewedAt')} />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.reviewedAt ? formatRelativeTime(row.original.reviewedAt) : '-'}
        </div>
      ),
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.actions')} />
      ),
      cell: ({ row }) => {
        const proposal = row.original

        const actions = [
          {
            id: 'view',
            label: t('common.view'),
            icon: Eye,
            onClick: () => onView(proposal),
          },
          {
            id: 'edit',
            label: t('common.edit'),
            icon: Edit,
            onClick: () => onEdit?.(proposal),
            hidden: (row: Proposal) => row.status !== 'pending_review' || !onEdit,
          },
        ]

        return <ActionsDropdown row={proposal} actions={actions} />
      },
    },
  ]
}
