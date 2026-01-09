import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { StatusBadge } from "@/components/common/StatusBadge"
import { ActionsDropdown } from "@/components/common/ActionsDropdown"
import type { Project } from "@/types/project.types"
import { formatDate } from "@/lib/utils/format"
import { Eye, X } from "lucide-react"

export interface AnnounceProjectsTableColumnsProps {
  selectedProjects: Set<string>
  onToggleProject: (projectId: string) => void
  onView: (project: Project) => void
  onRemove?: (project: Project) => void
  t: (key: string) => string
  showSelection?: boolean
}

export function createAnnounceProjectsColumns({
  selectedProjects,
  onToggleProject,
  onView,
  onRemove,
  t,
  showSelection = true,
}: AnnounceProjectsTableColumnsProps): ColumnDef<Project>[] {
  const columns: ColumnDef<Project>[] = []

  if (showSelection) {
    columns.push({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value)
            table.getRowModel().rows.forEach((row) => {
              const projectId = row.original.id
              if (value) {
                if (!selectedProjects.has(projectId)) {
                  onToggleProject(projectId)
                }
              } else {
                if (selectedProjects.has(projectId)) {
                  onToggleProject(projectId)
                }
              }
            })
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => {
        const projectId = row.original.id
        return (
          <Checkbox
            checked={selectedProjects.has(projectId)}
            onCheckedChange={() => onToggleProject(projectId)}
            aria-label={`Select ${row.original.title}`}
          />
        )
      },
      enableSorting: false,
      enableHiding: false,
    })
  }

  columns.push(
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
      accessorKey: "maxStudents",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.maxStudents')} />
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.currentStudents || 0} / {row.original.maxStudents}
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

        const actions = [
          {
            id: 'view',
            label: t('committee.announce.viewDetails'),
            icon: Eye,
            onClick: () => onView(project),
            variant: 'default' as const,
          },
        ]

        // Add remove action for announced projects (available_for_registration status)
        if (onRemove && project.status === 'available_for_registration') {
          actions.push({
            id: 'remove',
            label: t('committee.announce.remove'),
            icon: X,
            onClick: () => onRemove(project),
            variant: 'destructive' as const,
          })
        }

        return <ActionsDropdown row={project} actions={actions} />
      },
    },
  )

  return columns
}
