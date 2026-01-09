import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ActionsDropdown } from '@/components/common/ActionsDropdown'
import type { ProjectRegistration } from '@/types/project.types'
import { CheckCircle2, XCircle, User, Briefcase, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'

export interface RegistrationTableColumnsProps {
  onView: (registration: ProjectRegistration) => void
  onApprove: (registration: ProjectRegistration) => void
  onReject: (registration: ProjectRegistration) => void
  t: (key: string) => string
}

export function createRegistrationColumns({
  onView,
  onApprove,
  onReject,
  t,
}: RegistrationTableColumnsProps): ColumnDef<ProjectRegistration>[] {
  return [
    {
      accessorKey: 'student',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('registration.student')} />
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
        <DataTableColumnHeader column={column} title={t('registration.project')} />
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
        <DataTableColumnHeader column={column} title={t('common.status')} />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'submittedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('registration.submittedAt')} />
      ),
      cell: ({ row }) => formatDate(row.original.submittedAt),
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.actions')} />
      ),
      cell: ({ row }) => {
        const registration = row.original

        const actions = [
          {
            id: 'view',
            label: t('registration.viewDetails'),
            icon: Eye,
            onClick: () => onView(registration),
            variant: 'default' as const,
            separator: true,
          },
          {
            id: 'approve',
            label: t('common.approve'),
            icon: CheckCircle2,
            onClick: () => onApprove(registration),
            hidden: () => registration.status !== 'pending',
            variant: 'success' as const,
          },
          {
            id: 'reject',
            label: t('common.reject'),
            icon: XCircle,
            onClick: () => onReject(registration),
            hidden: () => registration.status !== 'pending',
            variant: 'destructive' as const,
          },
        ]

        return <ActionsDropdown row={registration} actions={actions} />
      },
    },
  ]
}
