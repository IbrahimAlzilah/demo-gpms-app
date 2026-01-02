import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { StatusBadge } from "@/components/common/StatusBadge"
import type { Project } from "@/types/project.types"
import { formatDate } from "@/lib/utils/format"

interface ProjectAnnouncementTableColumnsProps {
  selectedProjects: Set<string>
  onToggleProject: (projectId: string) => void
  t: (key: string) => string
}

export function createProjectAnnouncementColumns({
  selectedProjects,
  onToggleProject,
  t,
}: ProjectAnnouncementTableColumnsProps): ColumnDef<Project>[] {
  return [
    {
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
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('title')} />
      ),
      cell: ({ row }) => <div className="font-medium max-w-[300px] truncate">{row.original.title}</div>,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('description')} />
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
        <DataTableColumnHeader column={column} title={t('common.supervisor')} />
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
        <DataTableColumnHeader column={column} title={t('maxStudents')} />
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
  ]
}
