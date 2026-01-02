import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { StatusBadge } from '@/components/common/StatusBadge'
import type { Project } from '@/types/project.types'
import { Eye } from 'lucide-react'
import type { ProjectTableColumnsProps } from '../../types/Projects.types'

export function createProjectColumns({
  onSelectProject,
  t,
}: ProjectTableColumnsProps): ColumnDef<Project>[] {
  return [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.title') || 'العنوان'} />
      ),
      cell: ({ row }) => <div className="font-medium">{row.original.title}</div>,
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.description') || 'الوصف'} />
      ),
      cell: ({ row }) => (
        <div className="max-w-[400px] truncate text-muted-foreground text-sm">
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: 'supervisor',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.supervisor') || 'المشرف'} />
      ),
      cell: ({ row }) => (
        <div>{row.original.supervisor?.name || t('project.noSupervisor') || 'غير معين'}</div>
      ),
    },
    {
      accessorKey: 'currentStudents',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.students') || 'الطلاب'} />
      ),
      cell: ({ row }) => (
        <div>
          {row.original.currentStudents}/{row.original.maxStudents}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.status') || 'الحالة'} />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    ...(onSelectProject
      ? [
          {
            id: 'actions',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title={t('common.actions') || 'الإجراءات'} />
            ),
            cell: ({ row }) => {
              const project = row.original
              return (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectProject(project)}
                >
                  <Eye className="size-4" />
                </Button>
              )
            },
          } as ColumnDef<Project>,
        ]
      : []),
  ]
}
