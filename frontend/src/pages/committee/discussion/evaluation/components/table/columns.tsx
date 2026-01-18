import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui/badge"
import { ClipboardCheck, CheckCircle2 } from "lucide-react"
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
        <div className="font-medium max-w-[300px] truncate">
          {row.original.project.title}
        </div>
      ),
    },
    {
      accessorKey: "student.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('student.name') || 'Student'} />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.original.student.name}</div>
      ),
    },
    {
      accessorKey: "student.studentId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('student.id') || 'Student ID'} />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.student.studentId || '-'}
        </div>
      ),
    },
    {
      accessorKey: "hasEvaluation",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('evaluation.status') || 'Status'} />
      ),
      cell: ({ row }) => {
        const hasEvaluation = row.original.hasEvaluation
        return (
          <Badge variant={hasEvaluation ? "default" : "secondary"}>
            {hasEvaluation ? (
              <>
                <CheckCircle2 className="mr-1 h-3 w-3" />
                {t('evaluation.completed') || 'Completed'}
              </>
            ) : (
              t('evaluation.pending') || 'Pending'
            )}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">{t('common.actions') || 'Actions'}</div>,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEvaluate(item)}
            >
              <ClipboardCheck className="mr-2 h-4 w-4" />
              {item.hasEvaluation
                ? t('evaluation.update') || 'Update Evaluation'
                : t('evaluation.evaluate') || 'Evaluate'}
            </Button>
          </div>
        )
      },
    },
  ]
}
