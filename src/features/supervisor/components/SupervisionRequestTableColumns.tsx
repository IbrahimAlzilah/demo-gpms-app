import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import type { Request } from "@/types/request.types"
import { CheckCircle2, XCircle, User, Briefcase } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils/format"

interface SupervisionRequestTableColumnsProps {
  onApprove: (request: Request) => void
  onReject: (request: Request) => void
  canAcceptMore: boolean
  t: (key: string) => string
}

export function createSupervisionRequestColumns({
  onApprove,
  onReject,
  canAcceptMore,
  t,
}: SupervisionRequestTableColumnsProps): ColumnDef<Request>[] {
  return [
    {
      accessorKey: "student",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('supervision.student')} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.student?.name || '-'}</span>
        </div>
      ),
    },
    {
      accessorKey: "project",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('supervision.project')} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <span className="max-w-[200px] truncate">{row.original.project?.title || '-'}</span>
        </div>
      ),
    },
    {
      accessorKey: "reason",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('supervision.reason')} />
      ),
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate text-muted-foreground text-sm">
          {row.original.reason}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('request.submittedAt')} />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatRelativeTime(row.original.createdAt)}
        </div>
      ),
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.actions')} />
      ),
      cell: ({ row }) => {
        const request = row.original
        const approveLabel = t('common.accept')
        const rejectLabel = t('common.reject')

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onApprove(request)}
              disabled={!canAcceptMore}
              className="h-8 text-success hover:text-success/80"
              title={approveLabel}
              aria-label={approveLabel}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span className="sr-only">{approveLabel}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReject(request)}
              className="h-8 text-destructive hover:text-destructive"
              title={rejectLabel}
              aria-label={rejectLabel}
            >
              <XCircle className="h-4 w-4" />
              <span className="sr-only">{rejectLabel}</span>
            </Button>
          </div>
        )
      },
    },
  ]
}



