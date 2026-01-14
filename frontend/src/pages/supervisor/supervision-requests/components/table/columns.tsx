import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { ActionsDropdown } from "@/components/common/ActionsDropdown"
import type { Project } from "@/types/project.types"
import { CheckCircle2, XCircle, Briefcase, Tag, Users } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils/format"
import type { SupervisionRequestTableColumnsProps } from '../../types/SupervisionRequests.types'

export function createSupervisionRequestColumns({
  onApprove,
  onReject,
  canAcceptMore,
  t,
}: SupervisionRequestTableColumnsProps): ColumnDef<Project>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('supervision.projectTitle')} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium max-w-[250px] truncate">{row.original.title}</span>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('supervision.description')} />
      ),
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate text-muted-foreground text-sm">
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: "specialization",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('supervision.specialization')} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{row.original.specialization || '-'}</span>
        </div>
      ),
    },
    {
      accessorKey: "maxStudents",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('supervision.maxStudents')} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{row.original.maxStudents}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('supervision.assignedAt')} />
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
        const project = row.original

        const actions = [
          {
            id: 'approve',
            label: t('common.accept'),
            icon: CheckCircle2,
            onClick: () => onApprove(project),
            disabled: !canAcceptMore,
            variant: 'success' as const,
          },
          {
            id: 'reject',
            label: t('common.reject'),
            icon: XCircle,
            onClick: () => onReject(project),
            variant: 'destructive' as const,
            separator: true,
          },
        ]

        return <ActionsDropdown row={project} actions={actions} />
      },
    },
  ]
}
