import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { StatusBadge } from "@/components/common/StatusBadge"
import type { Project } from "@/types/project.types"
import { Eye } from "lucide-react"

interface ProjectTableColumnsProps {
  onSelectProject?: (project: Project) => void
  rtl?: boolean
}

export function createProjectColumns({
  onSelectProject,
  rtl = false,
}: ProjectTableColumnsProps): ColumnDef<Project>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="العنوان" rtl={rtl} />
      ),
      cell: ({ row }) => <div className="font-medium">{row.original.title}</div>,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="الوصف" rtl={rtl} />
      ),
      cell: ({ row }) => (
        <div className="max-w-[400px] truncate text-muted-foreground">
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: "supervisor",
      header: "المشرف",
      cell: ({ row }) => (
        <div>{row.original.supervisor?.name || "غير معين"}</div>
      ),
    },
    {
      accessorKey: "currentStudents",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="الطلاب" rtl={rtl} />
      ),
      cell: ({ row }) => (
        <div>
          {row.original.currentStudents}/{row.original.maxStudents}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="الحالة" rtl={rtl} />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    ...(onSelectProject
      ? [
          {
            id: "actions",
            header: "الإجراءات",
            cell: ({ row }) => {
              const project = row.original
              return (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectProject(project)}
                >
                  <Eye className="ml-2 h-4 w-4" />
                  عرض التفاصيل
                </Button>
              )
            },
          } as ColumnDef<Project>,
        ]
      : []),
  ]
}

