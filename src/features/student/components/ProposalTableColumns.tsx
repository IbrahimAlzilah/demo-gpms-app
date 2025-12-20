import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { StatusBadge } from "@/components/common/StatusBadge"
import type { Proposal } from "@/types/project.types"
import { Eye, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils/format"
import i18n from "@/lib/i18n/i18n"

interface ProposalTableColumnsProps {
  onView: (proposal: Proposal) => void
  rtl?: boolean
}

export function createProposalColumns({
  onView,
  rtl = false,
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
        <DataTableColumnHeader column={column} title={i18n.t('proposal.title') || 'العنوان'} rtl={rtl} />
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
        <DataTableColumnHeader column={column} title={i18n.t('proposal.description') || 'الوصف'} rtl={rtl} />
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
        <DataTableColumnHeader column={column} title={i18n.t('common.status') || 'الحالة'} rtl={rtl} />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={i18n.t('proposal.submittedAt') || 'تاريخ التقديم'} rtl={rtl} />
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
        <DataTableColumnHeader column={column} title={i18n.t('proposal.reviewedAt') || 'تاريخ المراجعة'} rtl={rtl} />
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
        <DataTableColumnHeader column={column} title={i18n.t('common.actions') || 'الإجراءات'} rtl={rtl} />
      ),
      cell: ({ row }) => {
        const proposal = row.original
        const viewLabel = i18n.t('common.view') || 'عرض'

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
