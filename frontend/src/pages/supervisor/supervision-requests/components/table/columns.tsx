import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/ui'
import { StatusBadge, ActionsDropdown, type TableAction } from '@/components/common'
import type { SupervisorAssignmentRequest } from '../../types/SupervisionRequests.types'
import { CheckCircle2, XCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'

export interface AssignmentRequestTableColumnsProps {
  onApprove: (request: SupervisorAssignmentRequest) => void
  onReject: (request: SupervisorAssignmentRequest) => void
  t: (key: string) => string
}

export function createAssignmentRequestColumns({
  onApprove,
  onReject,
  t,
}: AssignmentRequestTableColumnsProps): ColumnDef<SupervisorAssignmentRequest>[] {
  return [
    {
      accessorKey: 'project.title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.title')} />
      ),
      cell: ({ row }) => (
        <div className="font-medium max-w-[300px] truncate">
          {row.original.project?.title ?? '—'}
        </div>
      ),
      enableSorting: false,
    },
    {
      id: 'sender',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('committee.sender')} />
      ),
      cell: ({ row }) => {
        const request = row.original
        const name =
          request.requestedBy?.name ??
          request.requested_by_user?.name ??
          t('committee.sender')
        return <div className="text-sm font-medium">{name}</div>
      },
      enableSorting: false,
    },
    {
      accessorKey: 'committee_notes',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('committee.notes')} />
      ),
      cell: ({ row }) => {
        const notes = row.original.committee_notes
        if (!notes) return <span className="text-muted-foreground">—</span>
        return (
          <div
            className="max-w-[200px] truncate text-muted-foreground text-sm"
            title={notes}
          >
            {notes}
          </div>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.date')} />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.original.created_at)}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.status')} />
      ),
      cell: ({ row }) => (
        <StatusBadge status={row.original.status} />
      ),
      enableSorting: false,
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.actions')} />
      ),
      cell: ({ row }) => {
        const request = row.original
        const isPending = request.status === 'pending'
        const actions: TableAction<SupervisorAssignmentRequest>[] = []
        if (isPending) {
          actions.push({
            id: 'approve',
            label: t('common.approve'),
            icon: CheckCircle2,
            onClick: () => onApprove(request),
            variant: 'default',
          })
          actions.push({
            id: 'reject',
            label: t('common.reject'),
            icon: XCircle,
            onClick: () => onReject(request),
            variant: 'destructive',
          })
        }
        return (
          <ActionsDropdown row={request} actions={actions} />
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
