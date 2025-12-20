import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { StatusBadge } from "@/components/common/StatusBadge"
import type { Proposal } from "@/types/project.types"
import { Check, X, FileEdit } from "lucide-react"
import { formatDate } from "@/lib/utils/format"

interface ProposalTableColumnsProps {
  onApprove: (proposal: Proposal) => void
  onReject: (proposal: Proposal) => void
  onRequestModification: (proposal: Proposal) => void
}

export function createProposalColumns({
  onApprove,
  onReject,
  onRequestModification,
}: ProposalTableColumnsProps): ColumnDef<Proposal>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="العنوان" />
      ),
      cell: ({ row }) => <div className="font-medium max-w-[300px] truncate">{row.original.title}</div>,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="الوصف" />
      ),
      cell: ({ row }) => (
        <div className="max-w-[400px] truncate text-muted-foreground">
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="تاريخ التقديم" />
      ),
      cell: ({ row }) => <div>{formatDate(row.original.createdAt)}</div>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="الحالة" />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const proposal = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onApprove(proposal)}
              className="h-8 text-success hover:text-success/80"
            >
              <Check className="h-4 w-4" />
              <span className="sr-only">قبول</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRequestModification(proposal)}
              className="h-8 text-primary hover:text-primary/80"
            >
              <FileEdit className="h-4 w-4" />
              <span className="sr-only">طلب تعديل</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReject(proposal)}
              className="h-8 text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">رفض</span>
            </Button>
          </div>
        )
      },
    },
  ]
}

