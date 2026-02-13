import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { ActionsDropdown } from '@/components/common/ActionsDropdown'
import { Badge } from '@/components/ui/badge'
import { Eye, Users, UserPlus, XCircle, RefreshCw } from 'lucide-react'
import type { ProjectForDiscussion } from '../api/committee.service'

export interface DistributeCommitteesColumnsProps {
  t: (key: string) => string
  onViewProject: (project: ProjectForDiscussion) => void
  onFormCommittee: (project: ProjectForDiscussion) => void
  onChangeCommittee: (project: ProjectForDiscussion) => void
  onRemoveCommittee: (project: ProjectForDiscussion) => void
  isRemovingId: string | null
  isFd1PeriodActive: boolean
  isFd2PeriodActive: boolean
}

export function createDistributeCommitteesColumns({
  t,
  onViewProject,
  onFormCommittee,
  onChangeCommittee,
  onRemoveCommittee,
  isRemovingId,
  isFd1PeriodActive,
  isFd2PeriodActive,
}: DistributeCommitteesColumnsProps): ColumnDef<ProjectForDiscussion>[] {
  return [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.title')} />
      ),
      cell: ({ row }) => (
        <div className="font-medium max-w-[220px] truncate" title={row.original.title}>
          {row.original.title}
        </div>
      ),
    },
    {
      id: 'groupName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('committee.distribute.table.groupName')} />
      ),
      cell: ({ row }) => {
        const g = row.original.groupInfo
        if (!g || g.code === 'N/A') return <span className="text-muted-foreground">—</span>
        return <span className="font-medium">{g.name !== 'N/A' ? g.name : g.code}</span>
      },
    },
    {
      id: 'memberCount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('committee.distribute.table.members')} />
      ),
      cell: ({ row }) => {
        const count = row.original.groupInfo?.memberCount ?? row.original.studentsCount ?? 0
        return (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{count}</span>
          </div>
        )
      },
    },
    {
      id: 'department',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('committee.distribute.department')} />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.department ?? 'N/A'}</span>
      ),
    },
    {
      id: 'projectPhase',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('committee.distribute.table.projectPhase')} />
      ),
      cell: ({ row }) => {
        const phase = row.original.readyForDefensePhase
        if (!phase) return <span className="text-muted-foreground text-sm">—</span>
        if (phase === 'final_defense_1') {
          return (
            <Badge variant="outline" className="border-primary/50 text-primary shadow-none">
              {t('committee.distribute.readyForFD1')}
            </Badge>
          )
        }
        return (
          <Badge variant="outline" className="border-primary/50 text-primary shadow-none">
            {t('committee.distribute.readyForFD2')}
          </Badge>
        )
      },
    },
    {
      id: 'workflowStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('committee.distribute.table.workflowStatus')} />
      ),
      cell: ({ row }) => {
        const stage = row.original.workflowStage
        if (!stage) return <span className="text-muted-foreground text-sm">—</span>
        return (
          <Badge
            variant={
              stage === 'grading_completed' ? 'default' : stage === 'committee_evaluation' ? 'secondary' : 'outline'
            }
            className="shadow-none"
          >
            {t(`committee.distribute.workflowStage.${stage}`)}
          </Badge>
        )
      },
    },
    {
      id: 'committeeStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('committee.distribute.table.committeeStatus')} />
      ),
      cell: ({ row }) => {
        const assigned = row.original.hasCommitteeAssigned ?? row.original.committeeCount > 0
        return assigned ? (
          <Badge variant="default" className="bg-green-600 hover:bg-green-600 shadow-none">
            {t('committee.distribute.committeeFormed')}
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-muted text-muted-foreground shadow-none">
            {t('committee.distribute.committeeNotAssigned')}
          </Badge>
        )
      },
    },
    {
      id: 'defenseStage',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('committee.distribute.table.defenseStage')} />
      ),
      cell: ({ row }) => {
        const display = row.original.defenseStageDisplay
        if (!display) return <span className="text-muted-foreground text-sm">—</span>
        return (
          <Badge variant="outline" className="shadow-none">
            {display}
          </Badge>
        )
      },
    },
    {
      id: 'defenseDateTime',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('committee.distribute.table.defenseDateTime')} />
      ),
      cell: ({ row }) => {
        const at = row.original.defenseScheduledAt
        if (!at) return <span className="text-muted-foreground text-sm">—</span>
        return (
          <span className="text-sm whitespace-nowrap">
            {new Date(at).toLocaleString(undefined, {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.actions')} />
      ),
      cell: ({ row }) => {
        const project = row.original
        const hasCommittee = project.hasCommitteeAssigned ?? project.committeeCount > 0
        const isRemoving = isRemovingId === project.id
        const isFd1 = project.readyForDefensePhase === 'final_defense_1'
        const isFd2 = project.readyForDefensePhase === 'final_defense_2'
        const canFormFd1 = isFd1 && isFd1PeriodActive
        const canFormFd2 = isFd2 && isFd2PeriodActive
        const canForm = canFormFd1 || canFormFd2
        const canChange = hasCommittee && isFd2 && isFd2PeriodActive

        const actions = [
          {
            id: 'view',
            label: t('committee.distribute.viewProject'),
            icon: Eye,
            onClick: (p: ProjectForDiscussion) => onViewProject(p),
            variant: 'default' as const,
          },
          {
            id: 'formCommittee',
            label: t('committee.distribute.formCommittee'),
            icon: UserPlus,
            onClick: (p: ProjectForDiscussion) => onFormCommittee(p),
            hidden: (p: ProjectForDiscussion) =>
              (p.hasCommitteeAssigned ?? p.committeeCount > 0) || !canForm,
            variant: 'primary' as const,
            separator: true,
          },
          {
            id: 'changeCommittee',
            label: t('committee.distribute.changeCommittee'),
            icon: RefreshCw,
            onClick: (p: ProjectForDiscussion) => onChangeCommittee(p),
            hidden: () => !canChange,
            variant: 'primary' as const,
          },
          {
            id: 'removeCommittee',
            label: t('committee.distribute.removeCommittee'),
            icon: XCircle,
            onClick: (p: ProjectForDiscussion) => onRemoveCommittee(p),
            disabled: () => isRemoving,
            hidden: (p: ProjectForDiscussion) => !(p.hasCommitteeAssigned ?? p.committeeCount > 0),
            variant: 'destructive' as const,
            separator: true,
          },
        ]

        return <ActionsDropdown row={project} actions={actions} />
      },
    },
  ]
}
