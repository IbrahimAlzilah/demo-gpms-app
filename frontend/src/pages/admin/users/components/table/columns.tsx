import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { StatusBadge } from '@/components/common/StatusBadge'
import type { User } from '@/types/user.types'
import { Pencil, Trash2 } from 'lucide-react'

export interface UserTableColumnsProps {
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  t: (key: string) => string
}

export function createUserColumns({
  onEdit,
  onDelete,
  t,
}: UserTableColumnsProps): ColumnDef<User>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.name')} />
      ),
      cell: ({ row }) => (
        <div className="font-medium flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
            {row.original.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{row.original.name}</div>
            {row.original.studentId && (
              <div className="text-xs text-muted-foreground">
                {row.original.studentId}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.email')} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-sm">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('user.role')} />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary">
              {t(`roles.${row.original.role}`) || row.original.role}
            </span>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.status')} />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'department',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('user.department')} />
      ),
      cell: ({ row }) =>
        row.original.department ? (
          <div className="flex items-center gap-2 text-sm">
            {row.original.department}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        ),
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.actions')} />
      ),
      cell: ({ row }) => {
        const user = row.original
        const editLabel = t('common.edit')
        const deleteLabel = t('common.delete')

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(user)}
              className="h-8 w-8 p-0"
              title={editLabel}
              aria-label={editLabel}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">{editLabel}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(user)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              title={deleteLabel}
              aria-label={deleteLabel}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">{deleteLabel}</span>
            </Button>
          </div>
        )
      },
    },
  ]
}
