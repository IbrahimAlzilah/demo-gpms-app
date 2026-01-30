import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui/badge"
import { Lock, Eye, Edit3, ClipboardCheck } from "lucide-react"
import type { EvaluationListItem } from "../../list/EvaluationList.types"

export interface EvaluationTableColumnsProps {
  onEvaluate: (item: EvaluationListItem) => void
  t: (key: string) => string
}

export function createEvaluationColumns({
  onEvaluate,
  t,
}: EvaluationTableColumnsProps): ColumnDef<EvaluationListItem>[] {
  return [
    {
      accessorKey: "project.title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.title') || 'Project Title'} />
      ),
      cell: ({ row }) => (
        <div className="font-medium max-w-[280px]">
          <p className="truncate text-foreground">{row.original.project.title}</p>
          {row.original.project.supervisor && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {t('project.supervisor')}: {row.original.project.supervisor.name}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "student.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('student.name')} />
      ),
      cell: ({ row }) => {
        const student = row.original.student
        return (
          <div>
            <p className="font-medium text-foreground">{student.name || '-'}</p>
            {student.email && (
              <p className="text-xs text-muted-foreground truncate">{student.email}</p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "student.studentId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('student.id')} />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground font-mono">
          {row.original.student.studentId || '-'}
        </div>
      ),
    },
    {
      accessorKey: "evaluation.score",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('discussion.score')} />
      ),
      cell: ({ row }) => {
        const evaluation = row.original.evaluation
        if (!evaluation?.score) {
          return <span className="text-muted-foreground">—</span>
        }
        const percentage = evaluation.maxScore
          ? Math.round((evaluation.score / evaluation.maxScore) * 100)
          : null
        return (
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {evaluation.score}/{evaluation.maxScore}
            </span>
            {percentage !== null && (
              <Badge
                variant="secondary"
                className={`text-xs ${percentage >= 80
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : percentage >= 60
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}
              >
                {percentage}%
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "hasEvaluation",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.status') || 'Status'} />
      ),
      cell: ({ row }) => {
        const item = row.original
        const hasEvaluation = item.hasEvaluation
        const isApproved = item.evaluation?.isApproved === true
        const isLocked = item.isLocked === true

        if (isApproved) {
          return (
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
              <Lock className="h-3 w-3" />
              {t('common.approved')}
            </Badge>
          )
        }
        if (isLocked) {
          return (
            <Badge variant="secondary" className="gap-1">
              <Lock className="h-3 w-3" />
              {t('common.locked')}
            </Badge>
          )
        }
        if (hasEvaluation) {
          return (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {t('common.completed')}
            </Badge>
          )
        }
        return (
          <Badge variant="outline" className="text-muted-foreground">
            {t('common.pending')}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">{t('common.actions') || 'Actions'}</div>,
      cell: ({ row }) => {
        const item = row.original
        const isApproved = item.evaluation?.isApproved === true
        const isLocked = item.isLocked === true
        const hasEvaluation = item.hasEvaluation

        const isReadOnly = isApproved || isLocked

        return (
          <div className="flex justify-end">
            <Button
              variant={isReadOnly ? "ghost" : hasEvaluation ? "outline" : "default"}
              size="sm"
              onClick={() => onEvaluate(item)}
              className="gap-1.5"
            >
              {isReadOnly ? (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  {t('common.view')}
                </>
              ) : hasEvaluation ? (
                <>
                  <Edit3 className="h-3.5 w-3.5" />
                  {t('common.edit')}
                </>
              ) : (
                <>
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  {t('common.evaluate')}
                </>
              )}
            </Button>
          </div>
        )
      },
    },
  ]
}
