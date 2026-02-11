import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { StatusBadge } from "@/components/common/StatusBadge"
import { ActionsDropdown } from "@/components/common/ActionsDropdown"
import type { Request } from "@/types/request.types"
import { Eye, ClipboardCheck, User } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils/format"

export interface RequestTableColumnsProps {
  onView: (request: Request) => void
  onProcess: (request: Request) => void
  t: (key: string) => string
}

export function createRequestColumns({
  onView,
  onProcess,
  t,
}: RequestTableColumnsProps): ColumnDef<Request>[] {
  const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      change_supervisor: t('requests.change_supervisor'),
      change_group: t('requests.change_group'),
      change_project: t('requests.change_project'),
      change_project_title: t('requests.change_project_title'),
      other: t('requests.other'),
    }
    return labels[type] || type
  }

  return [
    {
      accessorKey: "student",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('committee.requests.student')} />
      ),
      cell: ({ row }) => {
        const student = row.original.student
        if (!student) return <span className="text-muted-foreground">-</span>

        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{student.name}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "department",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.department')} />
      ),
      cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.original.student?.department ?? '-'}</div>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      enableSorting: false,
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('request.type')} />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{getRequestTypeLabel(row.original.type)}</div>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      enableSorting: false,
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

        const actions = [
          {
            id: 'view',
            label: t('common.view'),
            icon: Eye,
            onClick: () => onView(request),
            variant: 'default' as const,
          },
          {
            id: 'process',
            label: t('committee.requests.processRequest'),
            icon: ClipboardCheck,
            onClick: () => onProcess(request),
            hidden: (row: Request) => row.status !== 'pending' && row.status !== 'supervisor_approved',
            variant: 'primary' as const,
            separator: true,
          },
        ]

        return <ActionsDropdown row={request} actions={actions} />
      },
    },
  ]
}

