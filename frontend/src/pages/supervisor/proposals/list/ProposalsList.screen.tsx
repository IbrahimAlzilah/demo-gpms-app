import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DataTable, Button } from '@/components/ui'
import { BlockContent, ModalDialog, ConfirmDialog } from '@/components/common'
import { useToast } from '@/components/common'
import {
  AlertCircle,
  RotateCcw,
  Loader2,
  Edit,
  PlusCircle,
  ArrowRight
} from 'lucide-react'
import { createProposalColumns } from '../components/table'
import { EmptyProposalsState } from '../components/EmptyProposalsState'
import { useProposalsList } from './ProposalsList.hook'
import { useResubmitProposal, useDeleteProposal } from '../hooks/useProposalOperations'
import { useAuthStore } from '@/pages/auth/login'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { proposalService } from '../api/proposal.service'
import { AssignmentDialog } from '../components/AssignmentDialog'
import type { Proposal } from '@/types/project.types'

export function ProposalsList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toastSuccess, toastError } = useToast()
  const { user } = useAuthStore()
  const [assignmentProposal, setAssignmentProposal] = useState<Proposal | null>(null)
  const [showLockModal, setShowLockModal] = useState(false)
  const [proposalToDelete, setProposalToDelete] = useState<Proposal | null>(null)

  const resubmitProposal = useResubmitProposal()
  const deleteProposal = useDeleteProposal()
  const {
    data,
    state,
    setState,
    isMyProposals,
    isApprovedProposals,
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

  // Check if proposals have been submitted (lock status)
  const hasSubmittedProposals = !!data.proposals.find(p => p.status === 'pending_review' || p.status === 'approved' || p.status === 'requires_modification')

  const columns = useMemo(
    () =>
      createProposalColumns({
        onView: (proposal) => {
          navigate(`${ROUTES.SUPERVISOR.PROPOSALS_VIEW}/${proposal.id}`)
        },
        onEdit: async (proposal) => {
          // Check if proposal status allows editing (individual proposal check)
          if (proposal.status !== 'pending_review' && proposal.status !== 'requires_modification') {
            toastError('proposal.cannotEdit')
            return
          }

          // Use getSubmissionContext API to validate ALL proposals
          // This ensures we check ALL proposals, not just paginated ones
          try {
            const context = await proposalService.getSubmissionContext()

            // Check if editing is not allowed
            if (context.can_edit === false) {
              const errorMessage = context.message ||
                (context.has_approved_proposal
                  ? 'proposal.cannotEditApproved'
                  : 'proposal.cannotEditNotAllPending')
              toastError(errorMessage)
              return
            }

            // If can_edit is true or undefined (legacy support), allow navigation
            // The edit page will also validate via getSubmissionContext
            navigate(ROUTES.SUPERVISOR.PROPOSALS_EDIT)
          } catch (error: any) {
            // Handle API errors
            const errorMessage = error.response?.data?.message ||
              error.message ||
              'proposal.loadError'
            toastError(errorMessage)
          }
        },
        onAssign: (proposal) => {
          setAssignmentProposal(proposal)
        },
        onDelete: (proposal) => {
          setProposalToDelete(proposal)
        },
        t,
      }),
    [t, navigate, toastError]
  )

  const handleResubmit = async () => {
    if (!state.proposalToResubmit) return

    try {
      await resubmitProposal.mutateAsync(state.proposalToResubmit)
      toastSuccess('proposal.resubmitSuccess')
      setState((prev) => ({
        ...prev,
        showResubmitDialog: false,
        proposalToResubmit: null,
        selectedProposal: null,
      }))
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'proposal.resubmitError')
    }
  }

  const handleSubmitClick = async () => {
    // Check if locked from proposals data
    if (hasSubmittedProposals) {
      setShowLockModal(true)
      return
    }

    navigate(ROUTES.SUPERVISOR.PROPOSALS_SUBMIT)
  }

  // Enhanced action buttons with better visual design
  const actions = useMemo(
    () => {
      // Show either Submit or Edit button based on lock status
      if (hasSubmittedProposals) {
        // Already submitted - show Edit button to allow adding new proposals
        return (
          <Button
            variant="default"
            onClick={() => navigate(ROUTES.SUPERVISOR.PROPOSALS_EDIT)}
          >
            <Edit className="size-4" />
            {t('proposal.editProposals')}
            <ArrowRight className="size-3 opacity-0 -ms-1 group-hover:opacity-100 group-hover:ms-0 transition-all" />
          </Button>
        )
      }

      // Not yet submitted - show Submit button
      return (
        <Button
          variant="default"
          onClick={handleSubmitClick}
        >
          <PlusCircle className="size-4" />
          {t('proposal.submitNew')}
          <ArrowRight className="size-3 opacity-0 -ms-1 group-hover:opacity-100 group-hover:ms-0 transition-all" />
        </Button>
      )
    },
    [t, hasSubmittedProposals, handleSubmitClick, navigate]
  )

  const pageTitle = isMyProposals
    ? t('nav.myProposals')
    : isApprovedProposals
      ? t('nav.approvedProposals')
      : t('nav.proposals')

  // Check if list is empty
  const isEmpty = !data.isLoading && data.proposals.length === 0

  return (
    <div className="space-y-6">
      {/* Main Content */}
      {isEmpty && !data.isLoading && !isApprovedProposals ? (
        <BlockContent title={pageTitle} variant="data-table" actions={actions} className="border-dashed">
          <EmptyProposalsState
            t={t}
            canSubmit={true}
            isReadOnly={false}
            onSubmit={handleSubmitClick}
          />
        </BlockContent>
      ) : (
        <BlockContent title={pageTitle} variant="data-table" actions={actions}>
          <DataTable
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
            enableFiltering={true}
            enableViews={true}
            emptyMessage={t('proposal.noProposals')}
          />
        </BlockContent>
      )}

      {data.error && (
        <div className={cn(
          'flex items-center gap-3 p-4 rounded-xl border',
          'bg-gradient-to-r from-destructive/10 to-destructive/5 border-destructive/30'
        )}>
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <span className="text-sm text-destructive">{t('proposal.loadError')}</span>
        </div>
      )}

      {/* Lock Modal - Enhanced design */}
      <ModalDialog
        open={showLockModal}
        onOpenChange={setShowLockModal}
        title={t('proposal.submissionNotAllowed')}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <div className="p-2 rounded-full bg-amber-500/20">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                {t('proposal.submissionLocked')}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                {t('proposal.submissionLockedMessage')}
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {t('proposal.submissionLockedDescription')}
          </p>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowLockModal(false)}
            >
              {t('common.close')}
            </Button>
            <Button
              onClick={() => {
                setShowLockModal(false)
                navigate(ROUTES.SUPERVISOR.PROPOSALS_EDIT)
              }}
              className="gap-2"
            >
              <Edit className="size-4" />
              {t('proposal.editProposals')}
            </Button>
          </div>
        </div>
      </ModalDialog>

      {/* Resubmit Confirmation Dialog - Enhanced design */}
      <ModalDialog
        open={state.showResubmitDialog}
        onOpenChange={(open) =>
          setState((prev) => ({ ...prev, showResubmitDialog: open }))
        }
        title={t('proposal.resubmitTitle')}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="p-2 rounded-full bg-primary/20">
              <RotateCcw className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t('proposal.resubmitMessage')}
            </p>
          </div>

          <div className="flex gap-3 justify-end">
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
              className="gap-2"
            >
              {resubmitProposal.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('common.processing')}
                </>
              ) : (
                <>
                  <RotateCcw className="size-4" />
                  {t('proposal.resubmit')}
                </>
              )}
            </Button>
          </div>
        </div>
      </ModalDialog>

      {/* Assignment Dialog */}
      <AssignmentDialog
        open={!!assignmentProposal}
        onOpenChange={(open) => !open && setAssignmentProposal(null)}
        proposal={assignmentProposal}
        onSuccess={() => {
          setAssignmentProposal(null)
          // Refresh will be handled by query invalidation
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!proposalToDelete}
        onClose={() => setProposalToDelete(null)}
        onConfirm={async () => {
          if (!proposalToDelete) return
          try {
            await deleteProposal.mutateAsync(proposalToDelete.id)
            toastSuccess('committee.proposal.deleteSuccess')
          } catch (error: any) {
            toastError(error?.message || 'committee.proposal.deleteError')
          } finally {
            setProposalToDelete(null)
          }
        }}
        title={t('committee.proposal.confirmDelete')}
        description={
          proposalToDelete
            ? t('committee.proposal.confirmDeleteDescription', { title: proposalToDelete.title })
            : ''
        }
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="destructive"
      />
    </div>
  )
}

