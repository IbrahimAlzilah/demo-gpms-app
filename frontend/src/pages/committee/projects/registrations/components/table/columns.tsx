import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { StatusBadge } from '@/components/common/StatusBadge'
import type { ProjectRegistration } from '@/types/project.types'
import { CheckCircle2, XCircle, User, Briefcase } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'

export interface RegistrationTableColumnsProps {
  onApprove: (registration: ProjectRegistration) => void
  onReject: (registration: ProjectRegistration) => void
  t: (key: string) => string
}

export function createRegistrationColumns({
  onApprove,
  onReject,
  t,
}: RegistrationTableColumnsProps): ColumnDef<ProjectRegistration>[] {
  return [
    {
      accessorKey: 'student',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('registration.student') || 'الطالب'} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {row.original.student?.name || row.original.studentId}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'project',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('registration.project') || 'المشروع'} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.project?.title || row.original.projectId}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.status') || 'الحالة'} />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'submittedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('registration.submittedAt') || 'تاريخ التقديم'} />
      ),
      cell: ({ row }) => formatDate(row.original.submittedAt),
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.actions') || 'الإجراءات'} />
      ),
      cell: ({ row }) => {
        const registration = row.original
        if (registration.status !== 'pending') return null

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onApprove(registration)}
              className="text-success hover:text-success"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              {t('common.approve') || 'قبول'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReject(registration)}
              className="text-destructive hover:text-destructive"
            >
              <XCircle className="h-4 w-4 mr-1" />
              {t('common.reject') || 'رفض'}
            </Button>
          </div>
        )
      },
    },
  ]
}
