import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApproveProposal, useRejectProposal, useRequestModification, useDeleteProposal } from '../hooks/useProposalOperations'
import { DataTable, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button } from '@/components/ui'
import { BlockContent, ConfirmDialog } from '@/components/common'
import { createProposalColumns } from '../components/table'
import { ProposalReviewDialog } from '../components/ProposalReviewDialog'
import { ProposalsNew } from '../new/ProposalsNew.screen'
import { ProposalsEdit } from '../edit/ProposalsEdit.screen'
import { ProposalsView } from '../view/ProposalsView.screen'
import { useProposalsList } from './ProposalsList.hook'
import { AlertCircle, Plus } from 'lucide-react'
import { useToast } from '@/components/common'

export function ProposalsList() {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()

  const approveProposal = useApproveProposal()
  const rejectProposal = useRejectProposal()
  const requestModification = useRequestModification()
  const deleteProposal = useDeleteProposal()

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null)

  const {
    data,
    state,
    setState,
    totalCount,
    pageCount,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
  } = useProposalsList()

  const columns = useMemo(
    () =>
      createProposalColumns({
        onView: (proposal) => {
          setState((prev) => ({ ...prev, proposalToViewId: proposal.id }))
        },
        onApprove: (proposal) => {
          setState((prev) => ({ ...prev, selectedProposal: proposal, action: 'approve' }))
        },
        onReject: (proposal) => {
          setState((prev) => ({ ...prev, selectedProposal: proposal, action: 'reject' }))
        },
        onRequestModification: (proposal) => {
          setState((prev) => ({ ...prev, selectedProposal: proposal, action: 'modify' }))
        },
        onEdit: (proposal) => {
          setEditingProposalId(proposal.id)
        },
        onDelete: (proposal) => {
          setState((prev) => ({ ...prev, proposalToDelete: proposal }))
        },
        t,
      }),
    [setState, t]
  )

  const handleConfirm = async (
    proposalId: string,
    actionType: 'approve' | 'reject' | 'modify',
    notes?: string
  ) => {
    try {
      if (actionType === 'approve') {
        await approveProposal.mutateAsync({ id: proposalId })
        toastSuccess('committee.proposal.approveSuccess')
      } else if (actionType === 'reject') {
        await rejectProposal.mutateAsync({ id: proposalId, reviewNotes: notes })
        toastSuccess('committee.proposal.rejectSuccess')
      } else if (actionType === 'modify') {
        if (!notes) {
          toastError('committee.proposal.modificationsRequired')
          return
        }
        await requestModification.mutateAsync({ id: proposalId, reviewNotes: notes })
        toastSuccess('committee.proposal.modifySuccess')
      }
      setState((prev) => ({ ...prev, selectedProposal: null, action: null }))
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'committee.proposal.processError')
    }
  }

  const handleEditSuccess = () => {
    setEditingProposalId(null)
  }

  const handleDelete = async () => {
    if (!state.proposalToDelete) return
    try {
      await deleteProposal.mutateAsync(state.proposalToDelete.id)
      toastSuccess('committee.proposal.deleteSuccess')
      setState((prev) => ({ ...prev, proposalToDelete: null }))
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'committee.proposal.deleteError')
    }
  }

  const isLoadingAction =
    approveProposal.isPending || rejectProposal.isPending || requestModification.isPending

  return (
    <>

      <BlockContent
        variant="data-table"
        title={t('committee.proposal.reviewPanel')}
        actions={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('committee.proposal.create', { defaultValue: 'New Proposal' })}
          </Button>
        }
      >

        <DataTable
          toolbarContent={
            <Select
              value={state.statusFilter}
              onValueChange={(value) => setState((prev) => ({ ...prev, statusFilter: value as typeof prev.statusFilter }))}
            >
              <SelectTrigger id="status-filter" className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('committee.proposal.allProposals')}</SelectItem>
                <SelectItem value="pending_review">{t('proposal.status.pendingReview')}</SelectItem>
                <SelectItem value="approved">{t('proposal.status.approved')}</SelectItem>
                <SelectItem value="rejected">{t('proposal.status.rejected')}</SelectItem>
                <SelectItem value="requires_modification">{t('proposal.status.requiresModification')}</SelectItem>
              </SelectContent>
            </Select>
          }
          columns={columns}
          data={data.proposals}
          isLoading={data.isLoading}
          error={data.error}
          pageCount={pageCount}
          totalCount={totalCount}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          onPaginationChange={(pageIndex, pageSize) => {
            setPagination({ pageIndex, pageSize })
          }}
          sorting={sorting}
          onSortingChange={setSorting}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          searchValue={globalFilter}
          onSearchChange={setGlobalFilter}
          searchPlaceholder={t('committee.proposal.searchPlaceholder')}
          enableFiltering={true}
          enableViews={true}
          emptyMessage={t('committee.proposal.noProposals')}
        />
      </BlockContent>

      <ProposalsNew
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => setShowCreateDialog(false)}
      />

      {data.error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('committee.proposal.loadError')}</span>
          </div>
        </BlockContent>
      )}

      <ProposalReviewDialog
        proposal={state.selectedProposal}
        action={state.action}
        onClose={() => {
          setState((prev) => ({ ...prev, selectedProposal: null, action: null }))
        }}
        onConfirm={handleConfirm}
        isLoading={isLoadingAction}
      />

      {editingProposalId && (
        <ProposalsEdit
          proposalId={editingProposalId}
          open={!!editingProposalId}
          onClose={() => setEditingProposalId(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      <ConfirmDialog
        open={!!state.proposalToDelete}
        onClose={() => {
          setState((prev) => ({ ...prev, proposalToDelete: null }))
        }}
        onConfirm={handleDelete}
        title={t('committee.proposal.confirmDelete')}
        description={
          state.proposalToDelete
            ? t('committee.proposal.confirmDeleteDescription', { title: state.proposalToDelete.title })
            : ''
        }
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="destructive"
      />

      <ProposalsView
        proposalId={state.proposalToViewId}
        open={!!state.proposalToViewId}
        onClose={() => {
          setState((prev) => ({ ...prev, proposalToViewId: null }))
        }}
      />
    </>
  )
}
