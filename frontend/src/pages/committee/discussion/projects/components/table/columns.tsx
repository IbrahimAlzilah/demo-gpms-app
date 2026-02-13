import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { ActionsDropdown } from "@/components/common/ActionsDropdown"
import { Badge } from "@/components/ui/badge"
import type { Project } from "@/types/project.types"
import { Eye, Users, CheckCircle2, FileText } from "lucide-react"

export interface ProjectsTableColumnsProps {
  t: (key: string) => string
  onView?: (project: Project) => void
  onEvaluate?: (project: Project) => void
}

export function createProjectsColumns({
  t,
  onView,
  onEvaluate,
}: ProjectsTableColumnsProps): ColumnDef<Project>[] {
  const cols: ColumnDef<Project>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.title')} />
      ),
      cell: ({ row }) => <div className="font-medium max-w-[250px] truncate">{row.original.title}</div>,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.description')} />
      ),
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate text-muted-foreground text-sm">
          {row.original.description}
        </div>
      ),
    },
    {
      id: 'supervisor',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.supervisor')} />
      ),
      cell: ({ row }) => {
        const supervisor = row.original.supervisor
        if (!supervisor) {
          return <div className="text-muted-foreground text-sm">—</div>
        }
        return (
          <div className="flex flex-col gap-0.5">
            <div className="font-medium text-sm">{supervisor.name}</div>
            <div className="text-xs text-muted-foreground">{supervisor.department || '—'}</div>
          </div>
        )
      },
    },
    {
      id: 'group',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.group')} />
      ),
      cell: ({ row }) => {
        const groupInfo = row.original.groupInfo
        if (!groupInfo || groupInfo.code === 'N/A') {
          return <div className="text-muted-foreground text-sm">—</div>
        }
        return (
          <div className="flex flex-col gap-0.5">
            <div className="font-medium text-sm">{groupInfo.code}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{groupInfo.memberCount} {t('common.members')}</span>
            </div>
          </div>
        )
      },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('discussion.workflowStatus')} />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        const statusVariants: Record<string, string> = {
          'in_progress': 'default',
          'pending': 'secondary',
          'completed': 'success',
          'approved': 'success',
        }
        return (
          <Badge variant={statusVariants[status] as any || 'outline'}>
            {t(`status.${status}`)}
          </Badge>
        )
      },
    },
    {
      id: 'documents',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('discussion.documentsPhase')} />
      ),
      cell: ({ row }) => {
        const documentsCount = row.original.documentsCount ?? 0
        const documentsApprovedCount = row.original.documentsApprovedCount ?? 0
        return (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {documentsApprovedCount}/{documentsCount}
            </span>
          </div>
        )
      },
    },
    {
      id: 'defenseStage',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('discussion.defenseStage')} />
      ),
      cell: ({ row }) => {
        const defenseStage = row.original.defenseStage
        if (!defenseStage) {
          return <Badge variant="outline">FD1</Badge>
        }
        const stage = defenseStage.current.toUpperCase()
        const isLocked = defenseStage.current === 'fd1' ? defenseStage.fd1Locked : defenseStage.fd2Locked
        return (
          <div className="flex items-center gap-2">
            <Badge variant={defenseStage.current === 'fd1' ? 'default' : 'secondary'}>
              {stage}
            </Badge>
            {isLocked && (
              <span className="text-xs text-muted-foreground" title={t('discussion.stageLocked')}>
                🔒
              </span>
            )}
          </div>
        )
      },
    },
    {
      id: 'evaluationProgress',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('discussion.myProgress')} />
      ),
      cell: ({ row }) => {
        const evalStatus = row.original.evaluationStatus
        if (!evalStatus) {
          return <div className="text-muted-foreground text-sm">—</div>
        }
        const isComplete = evalStatus.isComplete
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {evalStatus.myEvaluatedCount}/{evalStatus.totalStudents}
            </span>
            {isComplete && (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            )}
            <span className="text-xs text-muted-foreground">
              ({evalStatus.percentage}%)
            </span>
          </div>
        )
      },
    },
  ]
  if (onView || onEvaluate) {
    cols.push({
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.actions')} />
      ),
      cell: ({ row }) => {
        const project = row.original
        const defenseStage = project.defenseStage
        const evalStatus = project.evaluationStatus
        const currentStage = defenseStage?.current || 'fd1'
        const isLocked = defenseStage?.[currentStage === 'fd1' ? 'fd1Locked' : 'fd2Locked'] ?? false
        const hasEvaluations = evalStatus && evalStatus.myEvaluatedCount > 0

        const actions = [
          ...(onView
            ? [{
              id: 'view',
              label: t('common.viewDetails'),
              icon: Eye,
              onClick: () => onView(project),
              variant: 'default' as const,
            }]
            : []),
          ...(onEvaluate
            ? [
              {
                id: 'view-evaluation',
                label: t('discussion.viewEvaluation'),
                icon: Eye,
                onClick: () => onEvaluate(project),
                hidden: () => !isLocked,
                variant: 'default' as const,
                separator: !!onView,
              },
              {
                id: 'edit-evaluation',
                label: t('discussion.editEvaluation'),
                icon: CheckCircle2,
                onClick: () => onEvaluate(project),
                hidden: () => !hasEvaluations || isLocked,
                variant: 'default' as const,
              },
              {
                id: 'evaluate',
                label: t('discussion.evaluateProject'),
                icon: CheckCircle2,
                onClick: () => onEvaluate(project),
                hidden: () => hasEvaluations || isLocked,
                variant: 'primary' as const,
              },
            ]
            : []),
        ]

        return <ActionsDropdown row={project} actions={actions} />
      },
    })
  }
  return cols
}
