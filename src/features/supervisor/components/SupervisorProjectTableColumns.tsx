import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { StatusBadge } from "@/components/common/StatusBadge"
import type { Project } from "@/types/project.types"
import { Eye, Users } from "lucide-react"
import { Link } from "react-router-dom"
import { ROUTES } from "@/lib/constants"
import i18n from "@/lib/i18n/i18n"

interface SupervisorProjectTableColumnsProps {
  rtl?: boolean
}

export function createSupervisorProjectColumns({
  rtl = false,
}: SupervisorProjectTableColumnsProps): ColumnDef<Project>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={i18n.t('project.title') || 'العنوان'} rtl={rtl} />
      ),
      cell: ({ row }) => <div className="font-medium max-w-[300px] truncate">{row.original.title}</div>,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={i18n.t('project.description') || 'الوصف'} rtl={rtl} />
      ),
      cell: ({ row }) => (
        <div className="max-w-[400px] truncate text-muted-foreground text-sm">
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: "currentStudents",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={i18n.t('common.students') || 'الطلاب'} rtl={rtl} />
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
        <DataTableColumnHeader column={column} title={i18n.t('common.status') || 'الحالة'} rtl={rtl} />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={i18n.t('common.actions') || 'الإجراءات'} rtl={rtl} />
      ),
      cell: ({ row }) => {
        const project = row.original
        const viewLabel = i18n.t('common.viewDetails') || 'عرض التفاصيل'

        return (
          <Link to={`${ROUTES.SUPERVISOR.PROJECTS}/${project.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="ml-2 h-4 w-4" />
              {viewLabel}
            </Button>
          </Link>
        )
      },
    },
  ]
}



