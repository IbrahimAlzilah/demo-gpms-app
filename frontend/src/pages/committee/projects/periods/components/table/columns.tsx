import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { StatusBadge } from "@/components/common/StatusBadge"
import type { TimePeriod } from "@/types/period.types"
import { Edit, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils/format"

export interface PeriodTableColumnsProps {
  onEdit?: (period: TimePeriod) => void
  onDelete?: (period: TimePeriod) => void
  t: (key: string) => string
}

export function createPeriodColumns({
  onEdit,
  onDelete,
  t,
}: PeriodTableColumnsProps): ColumnDef<TimePeriod>[] {
  const periodTypeLabels: Record<string, string> = {
    proposal_submission: t('committee.periods.types.proposalSubmission'),
    project_registration: t('committee.periods.types.projectRegistration'),
    document_submission: t('committee.periods.types.documentSubmission'),
    supervisor_evaluation: t('committee.periods.types.supervisorEvaluation'),
    committee_evaluation: t('committee.periods.types.committeeEvaluation'),
    discussion_evaluation: t('committee.periods.types.discussionEvaluation'),
    final_discussion: t('committee.periods.types.finalDiscussion'),
    general: t('committee.periods.types.general'),
  }

  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('committee.periods.name')} />
      ),
      cell: ({ row }) => <div className="font-medium max-w-[300px] truncate">{row.original.name}</div>,
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('committee.periods.type')} />
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          {periodTypeLabels[row.original.type] || row.original.type}
        </div>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('committee.periods.startDate')} />
      ),
      cell: ({ row }) => <div className="text-sm">{formatDate(row.original.startDate)}</div>,
    },
    {
      accessorKey: "endDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('committee.periods.endDate')} />
      ),
      cell: ({ row }) => <div className="text-sm">{formatDate(row.original.endDate)}</div>,
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.status')} />
      ),
      cell: ({ row }) => (
        <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} />
      ),
      filterFn: (row, id, value) => {
        const isActive = row.getValue(id) as boolean
        return value.includes(isActive ? 'active' : 'inactive')
      },
    },
    {
      id: "actions",
      header: t('common.actions'),
      cell: ({ row }) => {
        const period = row.original
        return (
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(period)}
                className="h-8"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">{t('common.edit')}</span>
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(period)}
                className="h-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">{t('common.delete')}</span>
              </Button>
            )}
          </div>
        )
      },
    },
  ]
}
