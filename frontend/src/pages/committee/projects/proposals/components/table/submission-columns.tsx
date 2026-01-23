import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { StatusBadge } from "@/components/common/StatusBadge"
import { ActionsDropdown } from "@/components/common/ActionsDropdown"
import type { ProposalSubmission } from "@/types/project.types"
import { Check, X, FileEdit, Edit, Trash2, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils/format"

export interface SubmissionTableColumnsProps {
  onView: (submission: ProposalSubmission) => void
  onApprove: (submission: ProposalSubmission) => void
  onReject: (submission: ProposalSubmission) => void
  onRequestModification: (submission: ProposalSubmission) => void
  onEdit: (submission: ProposalSubmission) => void
  onDelete: (submission: ProposalSubmission) => void
  t: (key: string) => string
}

export function createSubmissionColumns({
  onView,
  onApprove,
  onReject,
  onRequestModification,
  onEdit,
  onDelete,
  t,
}: SubmissionTableColumnsProps): ColumnDef<ProposalSubmission>[] {
  
  return [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.id')} />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          #{row.original.id}
        </div>
      ),
    },
    {
      accessorKey: "submitter",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('proposal.submitter')} />
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.submitter?.name || row.original.studentGroup?.name || '-'}
        </div>
      ),
    },
    {
      accessorKey: "studentGroup",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('proposal.studentGroup')} />
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.original.studentGroup?.name || row.original.studentGroup?.groupCode || '-'}
        </div>
      ),
    },
    {
      accessorKey: "proposals",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('proposal.proposalsCount')} />
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.original.proposals?.length || 0} {t('proposal.proposals')}
        </div>
      ),
    },
    {
      accessorKey: "submittedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('proposal.submittedAt')} />
      ),
      cell: ({ row }) => (
        <div>{row.original.submittedAt ? formatDate(row.original.submittedAt) : '-'}</div>
      ),
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
        const submission = row.original

        const actions = [
          {
            id: 'view',
            label: t('committee.proposal.viewDetails'),
            icon: Eye,
            onClick: () => onView(submission),
            variant: 'default' as const,
            separator: true,
          },
          {
            id: 'approve',
            label: t('committee.proposal.approve'),
            icon: Check,
            onClick: () => onApprove(submission),
            variant: 'default' as const,
            disabled: submission.status !== 'submitted' && submission.status !== 'under_review' && submission.status !== 'requires_modification',
          },
          {
            id: 'reject',
            label: t('committee.proposal.reject'),
            icon: X,
            onClick: () => onReject(submission),
            variant: 'destructive' as const,
            disabled: submission.status !== 'submitted' && submission.status !== 'under_review' && submission.status !== 'requires_modification',
          },
          {
            id: 'modify',
            label: t('committee.proposal.requestModification'),
            icon: FileEdit,
            onClick: () => onRequestModification(submission),
            variant: 'default' as const,
            disabled: submission.status !== 'submitted' && submission.status !== 'under_review' && submission.status !== 'requires_modification',
          },
          {
            id: 'edit',
            label: t('common.edit'),
            icon: Edit,
            onClick: () => onEdit(submission),
            variant: 'default' as const,
            separator: true,
            disabled: submission.status === 'approved' || submission.status === 'rejected',
          },
          {
            id: 'delete',
            label: t('common.delete'),
            icon: Trash2,
            onClick: () => onDelete(submission),
            variant: 'destructive' as const,
            disabled: submission.status === 'approved' || submission.status === 'rejected',
          },
        ]

        return <ActionsDropdown actions={actions} />
      },
    },
  ]
}
