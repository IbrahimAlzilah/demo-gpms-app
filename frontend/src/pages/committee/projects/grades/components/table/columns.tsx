import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ActionsDropdown } from '@/components/common/ActionsDropdown'
import type { Grade } from '@/types/evaluation.types'
import { CheckCircle2, User, Briefcase, Eye, Award } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'

export interface GradeTableColumnsProps {
  onView: (grade: Grade) => void
  onApprove: (grade: Grade) => void
  t: (key: string) => string
}

export function createGradeColumns({
  onView,
  onApprove,
  t,
}: GradeTableColumnsProps): ColumnDef<Grade>[] {
  return [
    {
      accessorKey: 'student',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('grades.student')} />
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
        <DataTableColumnHeader column={column} title={t('grades.project')} />
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
        <DataTableColumnHeader column={column} title={t('grades.supervisorGrade')} />
      ),
      cell: ({ row }) => {
        const grade = row.original.supervisorGrade
        if (!grade) return <span className="text-muted-foreground">-</span>
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{grade.score}</span>
            <span className="text-muted-foreground">/ {grade.maxScore}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'committeeGrade',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('grades.committeeGrade')} />
      ),
      cell: ({ row }) => {
        const grade = row.original.committeeGrade
        if (!grade) return <span className="text-muted-foreground">-</span>
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{grade.score}</span>
            <span className="text-muted-foreground">/ {grade.maxScore}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'finalGrade',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('grades.finalGrade')} />
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
        <DataTableColumnHeader column={column} title={t('grades.approvedAt')} />
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
            label: t('grades.viewDetails'),
            icon: Eye,
            onClick: () => onView(grade),
            variant: 'default' as const,
            separator: true,
          },
          {
            id: 'approve',
            label: t('common.approve'),
            icon: CheckCircle2,
            onClick: () => onApprove(grade),
            hidden: () => grade.isApproved || !grade.finalGrade,
            variant: 'success' as const,
          },
        ]

        return <ActionsDropdown row={grade} actions={actions} />
      },
    },
  ]
}
