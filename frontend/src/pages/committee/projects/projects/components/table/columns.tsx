import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { StatusBadge } from "@/components/common/StatusBadge"
import { ActionsDropdown } from "@/components/common/ActionsDropdown"
import type { Project } from "@/types/project.types"
import { formatDate } from "@/lib/utils/format"
import { Eye, Pencil, Trash2 } from "lucide-react"

export interface ProjectsTableColumnsProps {
  onView: (project: Project) => void
  onEdit?: (project: Project) => void
  onDelete?: (project: Project) => void
  t: (key: string) => string
}

export function createProjectsColumns({
  onView,
  onEdit,
  onDelete,
  t,
}: ProjectsTableColumnsProps): ColumnDef<Project>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('proposal.title')} />
      ),
      cell: ({ row }) => <div className="font-medium max-w-[300px] truncate">{row.original.title}</div>,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('proposal.description')} />
      ),
      cell: ({ row }) => (
        <div className="max-w-[400px] truncate text-muted-foreground">
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: "supervisor",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.supervisor')} />
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.supervisor?.name || t('common.unassigned')}
        </div>
      ),
    },
    {
      accessorKey: "currentGroups",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.groups')} />
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.currentGroups ?? 0} / {row.original.maxGroups ?? 1}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.status')} />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.date')} />
      ),
      cell: ({ row }) => <div className="text-sm">{formatDate(row.original.createdAt)}</div>,
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.actions')} />
      ),
      cell: ({ row }) => {
        const project = row.original
        const canDelete = project?.status && !['in_progress', 'completed'].includes(project.status)

        const actions = [
          {
            id: 'view',
            label: t('common.view'),
            icon: Eye,
            onClick: () => onView(project),
            variant: 'default' as const,
          },
          ...(onEdit
            ? [{
              id: 'edit',
              label: t('common.edit'),
              icon: Pencil,
              onClick: () => onEdit(project),
              variant: 'outline' as const,
            }]
            : []),
          ...(onDelete && canDelete
            ? [{
              id: 'delete',
              label: t('common.delete'),
              icon: Trash2,
              onClick: () => onDelete(project),
              variant: 'destructive' as const,
            }]
            : []),
        ]

        return <ActionsDropdown row={project} actions={actions} />
      },
    },
  ]
}
