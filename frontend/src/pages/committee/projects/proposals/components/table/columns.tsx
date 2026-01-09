import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { StatusBadge } from "@/components/common/StatusBadge"
import { ActionsDropdown } from "@/components/common/ActionsDropdown"
import type { Proposal } from "@/types/project.types"
import { Check, X, FileEdit, Edit, Trash2, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils/format"
import type { TFunction } from "react-i18next"

export interface ProposalTableColumnsProps {
  onView: (proposal: Proposal) => void
  onApprove: (proposal: Proposal) => void
  onReject: (proposal: Proposal) => void
  onRequestModification: (proposal: Proposal) => void
  onEdit: (proposal: Proposal) => void
  onDelete: (proposal: Proposal) => void
  t: TFunction
}

export function createProposalColumns({
  onView,
  onApprove,
  onReject,
  onRequestModification,
  onEdit,
  onDelete,
  t,
}: ProposalTableColumnsProps): ColumnDef<Proposal>[] {
  
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('proposal.title')} />
      ),
      cell: ({ row }) => <div className="font-medium max-w-[300px] truncate">{row.original.title}</div>,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('proposal.description')} />
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
        <DataTableColumnHeader column={column} title={t('proposal.submittedAt')} />
      ),
      cell: ({ row }) => <div>{formatDate(row.original.createdAt)}</div>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.status')} />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.actions')} />
      ),
      cell: ({ row }) => {
        const proposal = row.original

        const actions = [
          {
            id: 'view',
            label: t('committee.proposal.viewDetails'),
            icon: Eye,
            onClick: () => onView(proposal),
            variant: 'default' as const,
            separator: true,
          },
          {
            id: 'approve',
            label: t('committee.proposal.approve'),
            icon: Check,
            onClick: () => onApprove(proposal),
            hidden: (row: Proposal) => row.status !== 'pending_review' && row.status !== 'requires_modification',
            variant: 'success' as const,
          },
          {
            id: 'request-modification',
            label: t('committee.proposal.requestModification'),
            icon: FileEdit,
            onClick: () => onRequestModification(proposal),
            hidden: (row: Proposal) => row.status !== 'pending_review' && row.status !== 'requires_modification',
            variant: 'primary' as const,
          },
          {
            id: 'reject',
            label: t('committee.proposal.reject'),
            icon: X,
            onClick: () => onReject(proposal),
            hidden: (row: Proposal) => row.status !== 'pending_review' && row.status !== 'requires_modification',
            variant: 'destructive' as const,
          },
          {
            id: 'edit',
            label: t('common.edit'),
            icon: Edit,
            onClick: () => onEdit(proposal),
            variant: 'default' as const,
          },
          {
            id: 'delete',
            label: t('common.delete'),
            icon: Trash2,
            onClick: () => onDelete(proposal),
            variant: 'destructive' as const,
            separator: true,
          },
        ]

        return <ActionsDropdown row={proposal} actions={actions} />
      },
    },
  ]
}
