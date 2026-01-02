import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable, Button } from '@/components/ui'
import { BlockContent, ModalDialog, useToast } from '@/components/common'
import { AlertCircle, PlusCircle, RotateCcw, Loader2 } from 'lucide-react'
import { createProposalColumns } from '../components/table'
import { StatisticsCards } from '../components/StatisticsCards'
import { ProposalsNew } from '../new/ProposalsNew.screen'
import { ProposalsView } from '../view/ProposalsView.screen'
import { ProposalsEdit } from '../edit/ProposalsEdit.screen'
import { useProposalsList } from './ProposalsList.hook'
import { useResubmitProposal } from '../hooks/useProposalOperations'

export function ProposalsList() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const resubmitProposal = useResubmitProposal()
  const {
    data,
    state,
    setState,
    isMyProposals,
    isApprovedProposals,
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
          setState((prev) => ({ ...prev, selectedProposal: proposal }))
        },
        onEdit: (proposal) => {
          // Only allow edit if status is pending_review
          if (proposal.status === 'pending_review') {
            setState((prev) => ({ ...prev, editingProposalId: String(proposal.id) }))
          } else {
            showToast(
              t('proposal.cannotEdit') || 'This proposal cannot be edited. Only proposals with pending_review status can be edited.',
              'error'
            )
          }
        },
        t,
      }),
    [t, setState]
  )

  const handleFormSuccess = () => {
    setState((prev) => ({ ...prev, showForm: false }))
    showToast(t('proposal.submitSuccess'), 'success')
  }

  const handleEditSuccess = () => {
    setState((prev) => ({ ...prev, editingProposalId: null }))
    showToast(t('proposal.updateSuccess') || 'Proposal updated successfully', 'success')
  }

  const handleResubmit = async () => {
    if (!state.proposalToResubmit) return

    try {
      await resubmitProposal.mutateAsync(state.proposalToResubmit)
      showToast(t('proposal.resubmitSuccess'), 'success')
      setState((prev) => ({
        ...prev,
        showResubmitDialog: false,
        proposalToResubmit: null,
        selectedProposal: null,
      }))
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t('proposal.resubmitError'),
        'error'
      )
    }
  }

  const actions = useMemo(
    () => (
      <Button onClick={() => setState((prev) => ({ ...prev, showForm: true }))}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {t('proposal.submitNew')}
      </Button>
    ),
    [t, setState]
  )

  const pageTitle = isMyProposals
    ? t('nav.myProposals')
    : isApprovedProposals
    ? t('nav.approvedProposals')
    : t('nav.proposals')

  return (
    <>
      {/* Statistics Cards - Only show for "My Proposals" */}
      {isMyProposals && <StatisticsCards statistics={data.statistics} t={t} />}

      <BlockContent title={pageTitle} actions={actions}>
        <DataTable
          columns={columns}
          data={data.proposals}
          isLoading={data.isLoading}
          error={data.error}
          pageCount={pageCount}
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
          enableFiltering={true}
          enableViews={true}
          emptyMessage={t('proposal.noProposals')}
        />
      </BlockContent>

      {data.error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('proposal.loadError')}</span>
          </div>
        </BlockContent>
      )}

      {/* New Proposal Modal */}
      <ProposalsNew
        open={state.showForm}
        onClose={() => setState((prev) => ({ ...prev, showForm: false }))}
        onSuccess={handleFormSuccess}
      />

      {/* View Proposal Modal */}
      {state.selectedProposal && (
        <ProposalsView
          proposalId={state.selectedProposal.id}
          open={!!state.selectedProposal}
          onClose={() => setState((prev) => ({ ...prev, selectedProposal: null }))}
          onResubmit={(proposal) => {
            setState((prev) => ({
              ...prev,
              proposalToResubmit: proposal,
              showResubmitDialog: true,
              selectedProposal: null,
            }))
          }}
        />
      )}

      {/* Edit Proposal Modal */}
      {state.editingProposalId && (
        <ProposalsEdit
          proposalId={state.editingProposalId}
          open={!!state.editingProposalId}
          onClose={() => setState((prev) => ({ ...prev, editingProposalId: null }))}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Resubmit Confirmation Dialog */}
      <ModalDialog
        open={state.showResubmitDialog}
        onOpenChange={(open) =>
          setState((prev) => ({ ...prev, showResubmitDialog: open }))
        }
        title={t('proposal.resubmitTitle')}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('proposal.resubmitMessage')}
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  showResubmitDialog: false,
                  proposalToResubmit: null,
                }))
              }
              disabled={resubmitProposal.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleResubmit}
              disabled={resubmitProposal.isPending}
            >
              {resubmitProposal.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.processing')}
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t('proposal.resubmit')}
                </>
              )}
            </Button>
          </div>
        </div>
      </ModalDialog>
    </>
  )
}
