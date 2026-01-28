import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui"
import { StatusBadge, ActionsDropdown, type TableAction } from "@/components/common"
import type { TimePeriod } from "@/types/period.types"
import { Edit, Trash2, Power, PowerOff, Clock } from "lucide-react"
import { formatDateShort } from "@/lib/utils/format"

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
    request_submission: t('committee.periods.types.requestSubmission'),
    chapter_submission_phase_1: t('committee.periods.types.chapterSubmissionPhase1'),
    final_defense_phase_1: t('committee.periods.types.finalDefensePhase1'),
    chapter_submission_phase_2: t('committee.periods.types.chapterSubmissionPhase2'),
    final_defense_phase_2: t('committee.periods.types.finalDefensePhase2'),
    final_project_document_submission: t('committee.periods.types.finalProjectDocumentSubmission'),
    general: t('committee.periods.types.general'),
  }

  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('committee.periods.name')} />
      ),
      cell: ({ row }) => {
        const period = row.original
        return (
          <div className="space-y-1">
            <div className="font-medium max-w-[300px] truncate">{period.name}</div>
            {/* {period.description && (
              <div className="text-xs text-muted-foreground max-w-[300px] truncate">
                {period.description}
              </div>
            )} */}
          </div>
        )
      },
      enableSorting: false,
      enableColumnFilter: true,
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
      enableSorting: false,
      enableColumnFilter: true,
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('committee.periods.startDate')} />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDateShort(row.original.startDate)}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "endDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('committee.periods.endDate')} />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDateShort(row.original.endDate)}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "createdBy",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.createdBy')} />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">{row.original.creator?.name}</div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.status')} />
      ),
      cell: ({ row }) => {
        const period = row.original
        const now = new Date()
        const startDate = new Date(period.startDate)
        const endDate = new Date(period.endDate)
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
        const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())

        // Determine period state
        const isScheduled = today < start
        const isActive = period.isActive && today >= start && today <= end
        const isExpired = today > end
        const isInactive = !period.isActive

        let status: 'active' | 'inactive' | 'scheduled' | 'expired' = 'inactive'
        let tooltip = ''

        if (isExpired) {
          status = 'expired'
          tooltip = t('committee.periods.statusExpired') || 'Period has ended'
        } else if (isScheduled && isInactive) {
          status = 'scheduled'
          tooltip = t('committee.periods.statusScheduled') || 'Scheduled - will activate on start date'
        } else if (isActive) {
          status = 'active'
          tooltip = t('committee.periods.statusActive') || 'Currently active'
        } else {
          status = 'inactive'
          tooltip = t('committee.periods.statusInactive') || 'Inactive'
        }

        return (
          <div className="flex items-center gap-2" title={tooltip}>
            <StatusBadge
              status={status === 'active' ? 'active' : status === 'scheduled' ? 'pending' : 'inactive'}
            />
            {isScheduled && !period.isActive && (
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>
        )
      },
      filterFn: (row, id, value) => {
        const isActive = row.getValue(id) as boolean
        return value.includes(isActive ? 'active' : 'inactive')
      },
      enableSorting: false,
      enableColumnFilter: true,
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.actions')} />
      ),
      cell: ({ row }) => {
        const period = row.original
        const actions: TableAction<TimePeriod>[] = []

        // Activate action - only show when period is inactive
        if (onActivate) {
          actions.push({
            id: 'activate',
            label: t('committee.periods.activate'),
            icon: Power,
            onClick: () => onActivate(period),
            hidden: () => period.isActive,
            variant: 'success',
          })
        }

        // Deactivate action - only show when period is active
        if (onDeactivate) {
          actions.push({
            id: 'deactivate',
            label: t('committee.periods.deactivate'),
            icon: PowerOff,
            onClick: () => onDeactivate(period),
            hidden: () => !period.isActive,
            variant: 'warning',
          })
        }

        // Edit action
        if (onEdit) {
          actions.push({
            id: 'edit',
            label: t('common.edit'),
            icon: Edit,
            onClick: () => onEdit(period),
          })
        }

        // Delete action - with separator and destructive variant
        if (onDelete) {
          actions.push({
            id: 'delete',
            label: t('common.delete'),
            icon: Trash2,
            onClick: () => onDelete(period),
            variant: 'destructive',
            separator: true,
          })
        }

        return <ActionsDropdown row={period} actions={actions} />
      },
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
