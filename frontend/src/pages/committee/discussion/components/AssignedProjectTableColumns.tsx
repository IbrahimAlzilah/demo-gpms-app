import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { StatusBadge } from "@/components/common/StatusBadge"
import type { Project } from "@/types/project.types"
import { Award, User, Users } from "lucide-react"
import { Link } from "react-router-dom"
import { ROUTES } from "@/lib/constants"

interface AssignedProjectTableColumnsProps {
  t: (key: string) => string
}

export function createAssignedProjectColumns({
  t,
}: AssignedProjectTableColumnsProps): ColumnDef<Project>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.title')} />
      ),
      cell: ({ row }) => <div className="font-medium max-w-[300px] truncate">{row.original.title}</div>,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.description')} />
      ),
      cell: ({ row }) => (
        <div className="max-w-[400px] truncate text-muted-foreground text-sm">
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: "supervisor",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('discussion.supervisor')} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.supervisor?.name || t('common.unassigned')}</span>
        </div>
      ),
    },
    {
      accessorKey: "currentStudents",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.students')} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>
            {row.original.currentStudents}/{row.original.maxStudents}
          </span>
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
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.actions')} />
      ),
      cell: ({ row }) => {
        const project = row.original
        const evaluateLabel = t('discussion.evaluateProject')

        return (
          <Link to={`${ROUTES.DISCUSSION_COMMITTEE.EVALUATION}?projectId=${project.id}`}>
            <Button variant="outline" size="sm">
              <Award className="ml-2 h-4 w-4" />
              {evaluateLabel}
            </Button>
          </Link>
        )
      },
    },
  ]
}
