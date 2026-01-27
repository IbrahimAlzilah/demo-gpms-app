import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { StatusBadge } from "@/components/common/StatusBadge"
import type { TimePeriod } from "@/types/period.types"
import { Edit, Trash2, Power, PowerOff } from "lucide-react"
import { formatDate } from "@/lib/utils/format"

export interface PeriodTableColumnsProps {
  onEdit?: (period: TimePeriod) => void
  onDelete?: (period: TimePeriod) => void
  onActivate?: (period: TimePeriod) => void
  onDeactivate?: (period: TimePeriod) => void
  t: (key: string) => string
}

export function createPeriodColumns({
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  t,
}: PeriodTableColumnsProps): ColumnDef<TimePeriod>[] {
  const periodTypeLabels: Record<string, string> = {
    proposal_submission: t('committee.periods.types.proposalSubmission'),
    project_registration: t('committee.periods.types.projectRegistration'),
    chapter_submission_phase_1: t('committee.periods.types.chapterSubmissionPhase1'),
    final_defense_phase_1: t('committee.periods.types.finalDefensePhase1'),
    chapter_submission_phase_2: t('committee.periods.types.chapterSubmissionPhase2'),
    final_defense_phase_2: t('committee.periods.types.finalDefensePhase2'),
    final_project_document_submission: t('committee.periods.types.finalProjectDocumentSubmission'),
    grade_approval: t('committee.periods.types.gradeApproval'),
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
            {onActivate && !period.isActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onActivate(period)}
                className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                title={t('committee.periods.activate')}
              >
                <Power className="h-4 w-4" />
                <span className="sr-only">{t('committee.periods.activate')}</span>
              </Button>
            )}
            {onDeactivate && period.isActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeactivate(period)}
                className="h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                title={t('committee.periods.deactivate')}
              >
                <PowerOff className="h-4 w-4" />
                <span className="sr-only">{t('committee.periods.deactivate')}</span>
              </Button>
            )}
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
