import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { StatusBadge } from "@/components/common/StatusBadge"
import { ActionsDropdown } from "@/components/common/ActionsDropdown"
import type { Request } from "@/types/request.types"
import { Eye, X, Edit, Trash2, User, Users, Briefcase, FileCheck, CheckCircle2, XCircle, Clock } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils/format"
import type { RequestTableColumnsProps } from '../../types/Requests.types'

export function createRequestColumns({
  onView,
  onCancel,
  onEdit,
  onDelete,
  t,
}: RequestTableColumnsProps): ColumnDef<Request>[] {
  const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      change_supervisor: t('requests.change_supervisor'),
      change_group: t('requests.change_group'),
      change_project: t('requests.change_project'),
      other: t('requests.other'),
    }
    return labels[type] || type
  }

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'change_supervisor':
        return <User className="h-4 w-4" />
      case 'change_group':
        return <Users className="h-4 w-4" />
      case 'change_project':
        return <Briefcase className="h-4 w-4" />
      default:
        return <FileCheck className="h-4 w-4" />
    }
  }

  return [
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('request.type')} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {getRequestTypeIcon(row.original.type)}
          <span className="font-medium">{getRequestTypeLabel(row.original.type)}</span>
        </div>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "reason",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('request.reason')} />
      ),
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate text-muted-foreground text-sm">
          {row.original.reason}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.status')} />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      id: "workflow",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('request.workflow')} />
      ),
      cell: ({ row }) => {
        const request = row.original
        return (
          <div className="flex items-center gap-2 text-xs">
            {request.supervisorApproval ? (
              <div className={`flex items-center gap-1 px-2 py-1 rounded ${
                request.supervisorApproval.approved
                  ? 'bg-success/10 text-success'
                  : 'bg-destructive/10 text-destructive'
              }`}>
                {request.supervisorApproval.approved ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {t('request.supervisorDecision')}
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted text-muted-foreground">
                <Clock className="h-3 w-3" />
                {t('request.awaitingSupervisor')}
              </div>
            )}
            {request.committeeApproval ? (
              <div className={`flex items-center gap-1 px-2 py-1 rounded ${
                request.committeeApproval.approved
                  ? 'bg-success/10 text-success'
                  : 'bg-destructive/10 text-destructive'
              }`}>
                {request.committeeApproval.approved ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {t('request.committeeDecision')}
              </div>
            ) : request.supervisorApproval?.approved && (
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted text-muted-foreground">
                <Clock className="h-3 w-3" />
                {t('request.awaitingCommittee')}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('request.submittedAt')} />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatRelativeTime(row.original.createdAt)}
        </div>
      ),
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.actions')} />
      ),
      cell: ({ row }) => {
        const request = row.original
        const isPending = request.status === 'pending'

        const actions = [
          {
            id: 'view',
            label: t('common.view'),
            icon: Eye,
            onClick: () => onView(request),
            variant: 'default' as const,
          },
          {
            id: 'edit',
            label: t('common.edit'),
            icon: Edit,
            onClick: () => onEdit?.(request),
            hidden: () => !isPending || !onEdit,
          },
          {
            id: 'delete',
            label: t('common.delete'),
            icon: Trash2,
            onClick: () => onDelete?.(request),
            variant: 'destructive' as const,
            hidden: () => !isPending || !onDelete,
          },
          {
            id: 'cancel',
            label: t('request.cancel'),
            icon: X,
            onClick: () => onCancel?.(request),
            variant: 'destructive' as const,
            hidden: () => !isPending || !onCancel,
          },
        ]

        return <ActionsDropdown row={request} actions={actions} />
      },
    },
  ]
}
