import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useApproveProposal, useRejectProposal, useRequestModification, useUpdateProposal, useDeleteProposal } from '../hooks/useProposalOperations'
import { useProposal } from '../hooks/useProposals'
import { DataTable, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent } from '@/components/ui'
import { BlockContent, ConfirmDialog, LoadingSpinner } from '@/components/common'
import { createProposalColumns } from '../components/table'
import { ProposalReviewDialog } from '../components/ProposalReviewDialog'
import { ProposalEditDialog } from '../components/ProposalEditDialog'
import { ProposalsView } from '../view/ProposalsView.screen'
import { useProposalsList } from './ProposalsList.hook'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { Proposal } from '@/types/project.types'

export function ProposalsList() {
  const { t } = useTranslation()

  const approveProposal = useApproveProposal()
  const rejectProposal = useRejectProposal()
  const requestModification = useRequestModification()
  const updateProposal = useUpdateProposal()
  const deleteProposal = useDeleteProposal()

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
          setState((prev) => ({ ...prev, proposalToEditId: proposal.id }))
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
        toast.success(t('committee.proposal.approveSuccess'))
      } else if (actionType === 'reject') {
        await rejectProposal.mutateAsync({ id: proposalId, reviewNotes: notes })
        toast.success(t('committee.proposal.rejectSuccess'))
      } else if (actionType === 'modify') {
        if (!notes) {
          toast.error(t('committee.proposal.modificationsRequired'))
          return
        }
        await requestModification.mutateAsync({ id: proposalId, reviewNotes: notes })
        toast.success(t('committee.proposal.modifySuccess'))
      }
      setState((prev) => ({ ...prev, selectedProposal: null, action: null }))
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('committee.proposal.processError')
      toast.error(errorMsg)
    }
  }

  const handleEdit = async (proposalId: string, data: Partial<Proposal>) => {
    try {
      await updateProposal.mutateAsync({ id: proposalId, data })
      toast.success(t('committee.proposal.updateSuccess'))
      setState((prev) => ({ ...prev, proposalToEdit: null }))
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('committee.proposal.updateError')
      toast.error(errorMsg)
    }
  }

  const handleDelete = async () => {
    if (!state.proposalToDelete) return
    try {
      await deleteProposal.mutateAsync(state.proposalToDelete.id)
      toast.success(t('committee.proposal.deleteSuccess'))
      setState((prev) => ({ ...prev, proposalToDelete: null }))
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('committee.proposal.deleteError')
      toast.error(errorMsg)
    }
  }

  const isLoadingAction =
    approveProposal.isPending || rejectProposal.isPending || requestModification.isPending

  // Fetch full proposal data when editing
  const { data: proposalToEdit, isLoading: isLoadingProposal } = useProposal(state.proposalToEditId || '')

  return (
    <>
      <BlockContent title={t('committee.proposal.reviewPanel')}>

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

      {state.proposalToEditId && (
        <>
          {isLoadingProposal ? (
            <Dialog open={true} onOpenChange={() => setState((prev) => ({ ...prev, proposalToEditId: null }))}>
              <DialogContent>
                <div className="flex items-center justify-center p-8">
                  <LoadingSpinner />
                </div>
              </DialogContent>
            </Dialog>
          ) : proposalToEdit ? (
            <ProposalEditDialog
              proposal={proposalToEdit}
              onClose={() => {
                setState((prev) => ({ ...prev, proposalToEditId: null }))
              }}
              onConfirm={handleEdit}
              isLoading={updateProposal.isPending}
            />
          ) : null}
        </>
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
