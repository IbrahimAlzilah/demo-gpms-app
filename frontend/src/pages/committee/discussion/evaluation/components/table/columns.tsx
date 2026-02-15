import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui/badge"
import { Lock, Eye, Edit3, ClipboardCheck, User, Award, CheckCircle2 } from "lucide-react"
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
      cell: ({ row }) => {
        const project = row.original.project
        return (
          <div className="max-w-[300px]">
            <p className="font-semibold text-foreground truncate" title={project.title}>
              {project.title}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5" title={project.description}>
              {project.description}
            </p>
            {project.supervisor && (
              <p className="text-xs text-muted-foreground/80 truncate mt-1">
                <span className="font-medium">{t('project.supervisor')}:</span> {project.supervisor.name}
              </p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "student.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('student.name')} />
      ),
      cell: ({ row }) => {
        const student = row.original.student
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="font-semibold text-sm truncate">{student.name || '-'}</p>
              <p className="text-xs text-muted-foreground font-mono">{student.studentId}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "evaluation.supervisorScore",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('supervisor.grade') || 'Supervisor Grade'} />
      ),
      cell: ({ row }) => {
        const evaluation = row.original.evaluation
        if (!evaluation?.supervisorScore && evaluation?.supervisorScore !== 0) {
          return <span className="text-muted-foreground/50 text-center block">—</span>
        }
        const maxScore = evaluation.supervisorMaxScore || 100
        return (
          <div className="text-center">
            <span className="font-semibold text-sm">
              {Number(evaluation.supervisorScore).toFixed(2)}
            </span>
            <span className="text-muted-foreground text-xs"> / {maxScore}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "evaluation.score",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('committee.grade') || 'Committee Grade'} />
      ),
      cell: ({ row }) => {
        const evaluation = row.original.evaluation
        if (!evaluation?.score && evaluation?.score !== 0) {
          return <span className="text-muted-foreground/50 text-center block">—</span>
        }
        const maxScore = evaluation.maxScore || 100
        return (
          <div className="text-center">
            <span className="font-semibold text-sm">
              {Number(evaluation.score).toFixed(2)}
            </span>
            <span className="text-muted-foreground text-xs"> / {maxScore}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "evaluation.finalGrade",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('final.grade') || 'Final Grade'} />
      ),
      cell: ({ row }) => {
        const evaluation = row.original.evaluation
        if (!evaluation?.finalGrade && evaluation?.finalGrade !== 0) {
          return <span className="text-muted-foreground/50 text-center block">—</span>
        }
        const finalGrade = Number(evaluation.finalGrade)
        const percentage = finalGrade

        return (
          <div className="flex items-center justify-center gap-2">
            <Badge
              variant="outline"
              className={`font-bold text-sm px-3 py-1 ${percentage >= 80
                ? 'border-green-300 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : percentage >= 60
                  ? 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'border-red-300 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}
            >
              <Award className="h-3.5 w-3.5 mr-1.5" />
              {finalGrade.toFixed(2)}
            </Badge>
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
            <div className="flex justify-center">
              <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 gap-1.5 hover:bg-green-100">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t('common.approved')}
              </Badge>
            </div>
          )
        }
        if (isLocked) {
          return (
            <div className="flex justify-center">
              <Badge variant="secondary" className="gap-1.5 bg-gray-100 text-gray-700 border-gray-200">
                <Lock className="h-3.5 w-3.5" />
                {t('common.locked')}
              </Badge>
            </div>
          )
        }
        if (hasEvaluation) {
          return (
            <div className="flex justify-center">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 gap-1.5">
                <ClipboardCheck className="h-3.5 w-3.5" />
                {t('common.completed')}
              </Badge>
            </div>
          )
        }
        return (
          <div className="flex justify-center">
            <Badge variant="outline" className="text-muted-foreground bg-amber-50 text-amber-700 border-amber-200">
              {t('common.pending')}
            </Badge>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">{t('common.actions') || 'Actions'}</div>,
      cell: ({ row }) => {
        const item = row.original
        const isApproved = item.evaluation?.isApproved === true
        const isLocked = item.isLocked === true
        const hasEvaluation = item.hasEvaluation

        const isReadOnly = isApproved || isLocked

        return (
          <div className="flex justify-center">
            <Button
              variant={isReadOnly ? "ghost" : hasEvaluation ? "outline" : "default"}
              size="sm"
              onClick={() => onEvaluate(item)}
              className={`gap-1.5 h-8 px-3 text-xs transition-all ${isReadOnly
                ? 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                : hasEvaluation
                  ? 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
                  : 'bg-primary hover:bg-primary/90 shadow-sm'
                }`}
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
