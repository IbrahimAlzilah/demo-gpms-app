import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ActionsDropdown } from '@/components/common/ActionsDropdown'
import type { Project } from '@/types/project.types'
import { Eye, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import type { ProjectTableColumnsProps } from '../../types/Projects.types'

export function createProjectColumns({
  onSelectProject,
  onViewRejection,
  t,
  registrationMap,
}: ProjectTableColumnsProps): ColumnDef<Project>[] {
  return [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.title')} />
      ),
      cell: ({ row }) => <div className="font-medium">{row.original.title}</div>,
    },
    {
      accessorKey: 'description',
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
      accessorKey: 'supervisor',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.supervisor')} />
      ),
      cell: ({ row }) => (
        <div>{row.original.supervisor?.name || t('project.noSupervisor')}</div>
      ),
    },
    {
      accessorKey: 'currentStudents',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.students')} />
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
        <DataTableColumnHeader column={column} title={t('common.status')} />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      id: 'registrationStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.registrationStatus')} />
      ),
      cell: ({ row }) => {
        const project = row.original
        const registration = registrationMap?.get(project.id)

        if (!registration) {
          return <span className="text-xs text-muted-foreground">-</span>
        }

        const statusConfig = {
          pending: {
            icon: Clock,
            color: 'text-warning',
            bg: 'bg-warning/10',
            label: t('project.registrationPending'),
          },
          approved: {
            icon: CheckCircle2,
            color: 'text-success',
            bg: 'bg-success/10',
            label: t('project.registrationApproved'),
          },
          rejected: {
            icon: XCircle,
            color: 'text-destructive',
            bg: 'bg-destructive/10',
            label: t('project.registrationRejected'),
          },
          cancelled: {
            icon: XCircle,
            color: 'text-muted-foreground',
            bg: 'bg-muted',
            label: t('project.registrationCancelled'),
          },
        }

        const config = statusConfig[registration.status as keyof typeof statusConfig]
        if (!config) return null

        const Icon = config.icon
        return (
          <div className={`flex items-center gap-2 px-2 py-1 rounded-md ${config.bg}`}>
            <Icon className={`h-3 w-3 ${config.color}`} />
            <span className={`text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>
        )
      },
    },
    ...(onSelectProject
      ? [
        {
          id: 'actions',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('common.actions')} />
          ),
          cell: ({ row }) => {
            const project = row.original
            const registration = registrationMap?.get(project.id)
            const isRejected = registration?.status === 'rejected'

            const actions = [
              {
                id: 'view',
                label: t('common.view'),
                icon: Eye,
                onClick: () => onSelectProject(project),
              },
              ...(isRejected && onViewRejection
                ? [
                  {
                    id: 'viewRejection',
                    label: t('project.viewRejectionReason'),
                    icon: AlertCircle,
                    onClick: () => onViewRejection(project, registration),
                    variant: 'destructive' as const,
                    separator: true,
                  },
                ]
                : []),
            ]

            return <ActionsDropdown row={project} actions={actions} />
          },
        } as ColumnDef<Project>,
      ]
      : []),
  ]
}
