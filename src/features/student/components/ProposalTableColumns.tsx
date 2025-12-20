import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { StatusBadge } from "@/components/common/StatusBadge"
import type { Proposal } from "@/types/project.types"
import { Eye, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils/format"

interface ProposalTableColumnsProps {
  onView: (proposal: Proposal) => void
  t: (key: string) => string
}

export function createProposalColumns({
  onView,
  t,
}: ProposalTableColumnsProps): ColumnDef<Proposal>[] {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-success" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-destructive" />
      case 'requires_modification':
        return <AlertCircle className="h-4 w-4 text-warning" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('proposal.title')} />
      ),
      cell: ({ row }) => (
        <div className="font-medium flex items-center gap-2">
          {getStatusIcon(row.original.status)}
          <span className="max-w-[300px] truncate">{row.original.title}</span>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('proposal.description')} />
      ),
      cell: ({ row }) => (
        <div className="max-w-[400px] truncate text-muted-foreground text-sm">
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.status')} />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('proposal.submittedAt')} />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatRelativeTime(row.original.createdAt)}
        </div>
      ),
    },
    {
      accessorKey: "reviewedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('proposal.reviewedAt')} />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.reviewedAt ? formatRelativeTime(row.original.reviewedAt) : '-'}
        </div>
      ),
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.actions')} />
      ),
      cell: ({ row }) => {
        const proposal = row.original
        const viewLabel = t('common.view')

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(proposal)}
              className="h-8 w-8 p-0"
              title={viewLabel}
              aria-label={viewLabel}
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">{viewLabel}</span>
            </Button>
          </div>
        )
      },
    },
  ]
}
