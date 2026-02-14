import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/ui'
import { StatusBadge, ActionsDropdown, type TableAction } from '@/components/common'
import type { SupervisorAssignmentRow, SupervisorAssignmentStatus } from '../../api/supervisor.service'
import type { Project } from '@/types/project.types'
import { UserCheck, X, UserMinus, UserCog } from 'lucide-react'
import { formatDateShort } from '@/lib/utils/format'

export interface SupervisorAssignmentColumnsProps {
  onAssign: (project: Project) => void
  onChangeSupervisor?: (project: Project) => void
  onCancelRequest?: (requestId: number) => void
  onUnassign?: (project: Project) => void
  t: (key: string) => string
}

const assignmentStatusLabels: Record<SupervisorAssignmentStatus, string> = {
  needs_supervisor: 'committee.supervisors.statusNeedsSupervisor',
  pending_approval: 'committee.supervisors.statusPendingApproval',
  approved: 'committee.supervisors.statusApproved',
  rejected: 'committee.supervisors.statusRejected',
}

export function createSupervisorAssignmentColumns({
  onAssign,
  onChangeSupervisor,
  onCancelRequest,
  onUnassign,
  t,
}: SupervisorAssignmentColumnsProps): ColumnDef<SupervisorAssignmentRow>[] {
  return [
    {
      accessorKey: 'project.title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('proposal.title')} />
      ),
      cell: ({ row }) => {
        const project = row.original.project
        return (
          <div className="space-y-0.5">
            <div className="font-medium max-w-[280px] truncate">{project.title}</div>
            {project.specialization && (
              <div className="text-xs text-muted-foreground truncate max-w-[280px]">
                {project.specialization}
              </div>
            )}
          </div>
        )
      },
      enableSorting: false,
      enableColumnFilter: true,
    },
    {
      id: 'supervisor',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.supervisor')} />
      ),
      cell: ({ row }) => {
        const { project, assignmentStatus, latestRequest } = row.original
        if (project.supervisor?.name) {
          return (
            <div className="text-sm">
              {project.supervisor.name}
              {project.supervisor.department && (
                <div className="text-xs text-muted-foreground">{project.supervisor.department}</div>
              )}
            </div>
          )
        }
        if (latestRequest?.supervisor?.name) {
          return (
            <div className="text-sm">
              <span className="text-muted-foreground">
                {assignmentStatus === 'pending_approval'
                  ? t('committee.supervisors.requested')
                  : t('committee.supervisors.previouslyRequested')}
                :
              </span>{' '}
              {latestRequest.supervisor.name}
            </div>
          )
        }
        return <span className="text-muted-foreground text-sm">—</span>
      },
      enableSorting: false,
    },
    {
      accessorKey: 'assignmentStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.status')} />
      ),
      cell: ({ row }) => {
        const status = row.original.assignmentStatus
        const labelKey = assignmentStatusLabels[status] ?? status
        const badgeStatus =
          status === 'approved'
            ? 'active'
            : status === 'pending_approval'
              ? 'pending'
              : status === 'rejected'
                ? 'inactive'
                : 'warning'
        return (
          <StatusBadge
            status={badgeStatus}
            className={
              status === 'needs_supervisor'
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                : undefined
            }
          >
            {t(labelKey)}
          </StatusBadge>
        )
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
      enableSorting: false,
      enableColumnFilter: true,
    },
    {
      id: 'updatedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.date')} />
      ),
      cell: ({ row }) => {
        const project = row.original.project
        const date = project.updatedAt ?? project.createdAt
        return <div className="text-sm text-muted-foreground">{date ? formatDateShort(date) : '—'}</div>
      },
      enableSorting: false,
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.actions')} />
      ),
      cell: ({ row }) => {
        const { project, assignmentStatus, latestRequest } = row.original
        const actions: TableAction<SupervisorAssignmentRow>[] = []

        // Assign: when no supervisor or rejected (or first-time assign for pending_approval we use "Change" instead)
        const canAssign = assignmentStatus === 'needs_supervisor' || assignmentStatus === 'rejected'
        if (canAssign) {
          actions.push({
            id: 'assign',
            label: t('committee.supervisors.assignSupervisor'),
            icon: UserCheck,
            onClick: () => onAssign(project),
            variant: 'default',
          })
        }

        // Change supervisor: when project has a supervisor (approved) or has pending request (pending_approval)
        const canChange =
          (assignmentStatus === 'approved' && project.supervisor) ||
          assignmentStatus === 'pending_approval'
        if (canChange && onChangeSupervisor) {
          actions.push({
            id: 'change',
            label: t('committee.supervisors.changeSupervisor'),
            icon: UserCog,
            onClick: () => onChangeSupervisor(project),
            variant: 'default',
          })
        }

        if (assignmentStatus === 'approved' && project.supervisor && onUnassign) {
          actions.push({
            id: 'unassign',
            label: t('committee.supervisors.unassignSupervisor'),
            icon: UserMinus,
            onClick: () => onUnassign(project),
            variant: 'destructive',
            separator: true,
          })
        }

        if (assignmentStatus === 'pending_approval' && latestRequest && onCancelRequest) {
          actions.push({
            id: 'cancel',
            label: t('common.cancel'),
            icon: X,
            onClick: () => onCancelRequest(latestRequest.id),
            variant: 'destructive',
            separator: true,
          })
        }

        return <ActionsDropdown row={row.original} actions={actions} />
      },
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
