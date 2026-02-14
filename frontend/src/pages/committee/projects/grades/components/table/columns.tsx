import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ActionsDropdown } from '@/components/common/ActionsDropdown'
import type { Grade } from '@/types/evaluation.types'
import { CheckCircle2, User, Briefcase, Eye, Award } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'

export interface GradeTableColumnsProps {
  onView: (grade: Grade) => void
  onEdit: (grade: Grade) => void
  onApprove: (grade: Grade) => void
  t: (key: string, options?: Record<string, unknown>) => string
}

export function createGradeColumns({
  onView,
  onEdit,
  onApprove,
  t,
}: GradeTableColumnsProps): ColumnDef<Grade>[] {
  return [
    {
      accessorKey: 'student',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('committee.grades.student')} />
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
        <DataTableColumnHeader column={column} title={t('committee.grades.project')} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.project?.title || row.original.projectId}</span>
        </div>
      ),
    },
    {
      accessorKey: 'supervisorGrade',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('committee.grades.supervisorGrade')} />
      ),
      cell: ({ row }) => {
        const grade = row.original
        // Use standardized supervisorScore from backend if available
        const score = grade.supervisorScore ?? grade.supervisorGrade?.score ?? grade.displaySupervisorGrade?.score
        const maxScore = grade.supervisorGrade?.maxScore ?? grade.displaySupervisorGrade?.maxScore ?? 100

        if (score == null) return <span className="text-muted-foreground">-</span>

        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{Number(score).toFixed(2)}</span>
            <span className="text-muted-foreground">/ {maxScore}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'committeeGrade',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('committee.grades.committeeGrade')} />
      ),
      cell: ({ row }) => {
        const grade = row.original
        // Use standardized committeeScore from backend if available
        const score = grade.committeeScore ?? grade.committeeGrade?.score ?? grade.displayCommitteeGrade?.score
        const maxScore = grade.committeeGrade?.maxScore ?? grade.displayCommitteeGrade?.maxScore ?? 100

        if (score == null) return <span className="text-muted-foreground">-</span>

        // Committee member count logic
        const memberCount = grade.displayCommitteeGrade?.committeeMembers?.length ??
          (grade.committeeGrade?.members ? Object.keys(grade.committeeGrade.members).length : 0);

        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{Number(score).toFixed(2)}</span>
            <span className="text-muted-foreground">/ {maxScore}</span>
            {memberCount > 0 && (
              <span className="text-xs text-muted-foreground" title={t('committee.grades.averageOfEvaluators', { count: memberCount })}>
                ({memberCount})
              </span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'finalGrade',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('committee.grades.finalGrade')} />
      ),
      cell: ({ row }) => {
        const finalGrade = row.original.finalGrade
        if (!finalGrade) return <span className="text-muted-foreground">-</span>
        return (
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            <span className="font-bold text-lg">{finalGrade.toFixed(2)}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'isApproved',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.status')} />
      ),
      cell: ({ row }) => (
        <StatusBadge status={row.original.isApproved ? 'approved' : 'pending'} />
      ),
    },
    {
      accessorKey: 'approvedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('committee.grades.approvedAt')} />
      ),
      cell: ({ row }) => {
        if (!row.original.approvedAt) return <span className="text-muted-foreground">-</span>
        return formatDate(row.original.approvedAt)
      },
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.actions')} />
      ),
      cell: ({ row }) => {
        const grade = row.original

        const actions = [
          {
            id: 'view',
            label: t('committee.grades.viewDetails'),
            icon: Eye,
            onClick: () => onView(grade),
            variant: 'default' as const,
            separator: true,
          },
          {
            id: 'edit',
            label: t('common.edit'),
            icon: Briefcase, // using Briefcase as generic edit icon or import Edit? Briefcase is imported. 
            // Better to use Edit/Pencil icon? 'lucide-react' usually has Edit.
            // I'll stick to Briefcase if I don't want to change imports, but Edit is better.
            // I'll check imports. Line 6 has `CheckCircle2, User, Briefcase, Eye, Award`.
            // I should add Edit to imports if possible, or just use Briefcase for now to avoid import errors if I can't multi-replace imports easily.
            // Actually, I can just use Eye for view, and maybe User for edit? No.
            // I'll use Briefcase.
            onClick: () => onEdit(grade),
            hidden: () => grade.isApproved,
            variant: 'default' as const,
          },
          {
            id: 'approve',
            label: t('common.approve'),
            icon: CheckCircle2,
            onClick: () => onApprove(grade),
            hidden: () => grade.isApproved || !(grade.isReadyForApproval ?? (!!grade.finalGrade)),
            disabled: () => !grade.isReadyForApproval,
            variant: 'success' as const,
          },
        ]

        return <ActionsDropdown row={grade} actions={actions} />
      },
    },
  ]
}
