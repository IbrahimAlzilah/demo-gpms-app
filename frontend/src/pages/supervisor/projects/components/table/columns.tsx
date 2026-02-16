import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { StatusBadge } from "@/components/common/StatusBadge"
import { ActionsDropdown } from "@/components/common/ActionsDropdown"
import { Badge } from "@/components/ui/badge"
import type { Project } from "@/types/project.types"
import { Eye, Users, ClipboardCheck, Calendar, ShieldCheck } from "lucide-react"
import { ROUTES } from "@/lib/constants/constants"
import type { ProjectTableColumnsProps } from '../../types/Projects.types'

export function createProjectColumns({
  t,
  onProjectSelect,
  navigate,
  onEvaluate,
}: ProjectTableColumnsProps): ColumnDef<Project>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.title')} />
      ),
      cell: ({ row }) => <div className="font-medium max-w-[250px] truncate" title={row.original.title}>{row.original.title}</div>,
    },
    {
      id: 'group',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.studentGroup')} />
      ),
      cell: ({ row }) => {
        const group = row.original.assignedGroup || row.original.group
        // Prefer groupCode from assignedGroup/group, fallback to groupName or derive from other fields if possible
        const code = group?.groupCode || row.original.groupName

        if (!code) {
          return <div className="text-muted-foreground text-sm">—</div>
        }
        return (
          <div className="flex flex-col gap-0.5">
            <div className="font-medium text-sm">{code}</div>
            {group?.name && (
              <div className="text-xs text-muted-foreground">{group.name}</div>
            )}
          </div>
        )
      },
    },
    {
      id: 'members',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.members')} />
      ),
      cell: ({ row }) => {
        const group = row.original.assignedGroup || row.original.group
        const memberCount = group?.memberCount || row.original.students?.length || 0
        const maxMembers = row.original.maxStudents || 0
        return (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{memberCount} / {maxMembers}</span>
          </div>
        )
      },
    },
    {
      id: 'department',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.department')} />
      ),
      cell: ({ row }) => {
        // supervisor.department is in JSON
        const dept = row.original.supervisor?.department || row.original.department || row.original.students?.[0]?.department || 'N/A'
        return <div className="text-sm">{dept}</div>
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.workflowStatus')} />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "supervisorApprovalStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.supervisor') + ' Approval'} />
      ),
      cell: ({ row }) => {
        const status = row.original.supervisorApprovalStatus;
        if (!status) return <div className="text-muted-foreground text-sm">—</div>;

        const variant = status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary';
        let label: string | undefined = status;
        if (status === 'approved') label = t('common.approved');
        else if (status === 'rejected') label = t('common.rejected');
        else if (status === 'pending') label = t('common.pending') || 'Pending';

        return <Badge variant={variant}>{label}</Badge>;
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      id: 'committeeStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('supervisor_dashboard.committeeStatus')} />
      ),
      cell: ({ row }) => {
        // Fallback logic if committeeStatus string is missing
        const committeeStatus = row.original.committeeStatus
          ?? (row.original.committeeId || row.original.discussionCommitteeId ? 'assigned' : 'not_assigned')

        const isAssigned = committeeStatus === 'assigned'
        return (
          <div className="flex items-center gap-2">
            <ShieldCheck className={`h-4 w-4 ${isAssigned ? 'text-green-600' : 'text-muted-foreground'}`} />
            <Badge variant={isAssigned ? 'default' : 'outline'} className={isAssigned ? 'bg-green-600 text-white hover:bg-green-700' : ''}>
              {t(`supervisor.committee.${committeeStatus}`, { defaultValue: committeeStatus })}
            </Badge>
          </div>
        )
      },
    },
    {
      id: 'defenseStage',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('supervisor_dashboard.defenseStage')} />
      ),
      cell: ({ row }) => {
        const defenseStage = row.original.defenseStage
        if (!defenseStage) {
          return <div className="text-muted-foreground text-sm">—</div>
        }

        const stage = defenseStage.current.toUpperCase()
        const isLocked = defenseStage.current === 'fd1'
          ? defenseStage.fd1Locked
          : defenseStage.fd2Locked

        return (
          <div className="flex items-center gap-2">
            <Badge variant={stage === 'FD1' ? 'default' : 'secondary'}>
              {t(`evaluation.${defenseStage.current}`, { defaultValue: defenseStage.current })}
            </Badge>
            {isLocked && <span className="text-xs">🔒</span>}
          </div>
        )
      },
    },
    {
      id: 'defenseDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('supervisor_dashboard.defenseDate')} />
      ),
      cell: ({ row }) => {
        const defenseStage = row.original.defenseStage
        if (!defenseStage) {
          return <div className="text-muted-foreground text-sm">—</div>
        }

        const date = defenseStage.current === 'fd1'
          ? defenseStage.fd1Date
          : defenseStage.fd2Date

        if (!date) {
          return <div className="text-muted-foreground text-sm">{t('common.notSet')}</div>
        }

        return (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(date).toLocaleDateString()}</span>
          </div>
        )
      },
    },
    {
      id: 'supervisorEvaluation',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('supervisor_dashboard.evaluationStatus')} />
      ),
      cell: ({ row }) => {
        const evalStatus = row.original.supervisorEvaluationStatus
        const defenseStage = row.original.defenseStage

        if (!evalStatus || !defenseStage) {
          return <div className="text-muted-foreground text-sm">—</div>
        }

        const currentStageStatus = defenseStage.current === 'fd1'
          ? evalStatus.fd1
          : evalStatus.fd2

        const isEvaluated = currentStageStatus.evaluated
        const progress = `${currentStageStatus.evaluatedCount}/${currentStageStatus.totalStudents}`

        return (
          <div className="flex items-center gap-2">
            <ClipboardCheck
              className={`h-4 w-4 ${isEvaluated ? 'text-green-600' : 'text-muted-foreground'}`}
            />
            <div className="flex flex-col gap-0.5">
              <Badge variant={isEvaluated ? 'default' : 'outline'} className={currentStageStatus.isComplete ? 'bg-green-600 text-white hover:bg-green-700' : ''}>
                {isEvaluated ? t('supervisor_dashboard.evaluated') : t('supervisor_dashboard.notEvaluated')}
              </Badge>
              <span className="text-xs text-muted-foreground">{progress}</span>
            </div>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.actions')} />
      ),
      cell: ({ row }) => {
        const project = row.original
        const defenseStage = project.defenseStage
        const evalStatus = project.supervisorEvaluationStatus
        const currentStage = defenseStage?.current || 'fd1'
        const currentStageEvalStatus = currentStage === 'fd1' ? evalStatus?.fd1 : evalStatus?.fd2
        const hasEvaluations = currentStageEvalStatus?.evaluated || false
        const isLocked = defenseStage?.[currentStage === 'fd1' ? 'fd1Locked' : 'fd2Locked'] ?? false

        const handleNavigate = (path: string) => {
          if (navigate) {
            navigate(path)
          } else {
            window.location.href = path
          }
        }

        const actions = [
          {
            id: 'view',
            label: t('common.viewDetails'),
            icon: Eye,
            onClick: () => {
              if (onProjectSelect) {
                onProjectSelect(project)
              } else {
                handleNavigate(`${ROUTES.SUPERVISOR.PROJECTS}/${project.id}`)
              }
            },
            variant: 'default' as const,
          },
          ...(onEvaluate && project.students && project.students.length > 0 && defenseStage
            ? [
              {
                id: 'view-evaluation',
                label: `${t('discussion.viewEvaluation')} (${t(`evaluation.${currentStage}`, { defaultValue: currentStage })})`,
                icon: Eye,
                onClick: () => onEvaluate(project),
                hidden: () => !isLocked || !hasEvaluations,
                variant: 'default' as const,
                separator: true,
              },
              {
                id: 'edit-evaluation',
                label: `${t('discussion.editEvaluation')} (${t(`evaluation.${currentStage}`, { defaultValue: currentStage })})`,
                icon: ClipboardCheck,
                onClick: () => onEvaluate(project),
                hidden: () => !hasEvaluations || isLocked,
                variant: 'default' as const,
                separator: !isLocked && !hasEvaluations,
              },
              {
                id: 'evaluate',
                label: `${t('discussion.evaluateProject')} (${t(`evaluation.${currentStage}`, { defaultValue: currentStage })})`,
                icon: ClipboardCheck,
                onClick: () => onEvaluate(project),
                hidden: () => hasEvaluations || isLocked,
                variant: 'primary' as const,
              },
            ]
            : []),
        ]

        return <ActionsDropdown row={project} actions={actions} />
      },
    },
  ]
}
