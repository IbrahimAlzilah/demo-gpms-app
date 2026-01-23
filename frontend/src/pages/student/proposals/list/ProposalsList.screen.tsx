import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable, Button } from '@/components/ui'
import { BlockContent, ModalDialog } from '@/components/common'
import { useToast } from '@/components/common'
import { AlertCircle, PlusCircle, RotateCcw, Loader2, Eye } from 'lucide-react'
import { createProposalColumns } from '../components/table'
import { StatisticsCards } from '../components/StatisticsCards'
import { ProposalSubmissionForm } from '../components/ProposalSubmissionForm/ProposalSubmissionForm'
import { ProposalSubmissionView } from '../components/ProposalSubmissionView/ProposalSubmissionView'
import { ProposalsView } from '../view/ProposalsView.screen'
import { ProposalsEdit } from '../edit/ProposalsEdit.screen'
import { useProposalsList } from './ProposalsList.hook'
import { useMyGroup } from '@/pages/student/groups/hooks/useGroups'
import { useAuthStore } from '@/pages/auth/login'
import { useResubmitProposal } from '../hooks/useProposalOperations'
import { usePeriodCheck } from '@/hooks/usePeriodCheck'

export function ProposalsList() {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()
  const { user } = useAuthStore()
  const { data: studentGroup, isLoading: groupLoading } = useMyGroup()

  const resubmitProposal = useResubmitProposal()
  const {
    data,
    state,
    setState,
    isMyProposals,
    isApprovedProposals,
    submission,
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

  // Check if user is a group leader
  const isGroupLeader = useMemo(() => {
    if (!studentGroup || !user) return false
    return studentGroup.leaderId === user.id
  }, [studentGroup, user])

  // Check which period is active
  const { isPeriodActive: isProposalSubmissionActive } = usePeriodCheck('proposal_submission')
  const { isPeriodActive: isRegistrationActive } = usePeriodCheck('project_registration')

  // During Project Registration: groups are required (only group leaders)
  // During Proposal Submission: groups are optional (any student can submit)
  const groupRequired = isRegistrationActive && !isProposalSubmissionActive
  const canSubmit = isProposalSubmissionActive || (isRegistrationActive && isGroupLeader)

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
            toastError('proposal.cannotEdit')
          }
        },
        t,
      }),
    [t, setState, toastError]
  )

  const handleFormSuccess = () => {
    setState((prev) => ({ ...prev, showSubmissionForm: false }))
    toastSuccess('proposal.submitSuccess')
  }

  const handleEditSuccess = () => {
    setState((prev) => ({ ...prev, editingProposalId: null }))
    toastSuccess('proposal.updateSuccess')
  }

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

  const actions = useMemo(
    () => (
      <div className="flex gap-2">
        {isMyProposals && submission && (
          <Button
            variant="outline"
            onClick={() => setState((prev) => ({ ...prev, selectedSubmission: submission }))}
          >
            <Eye className="size-4 mr-2" />
            {t('proposal.viewSubmission')}
          </Button>
        )}
        <Button
          onClick={() => setState((prev) => ({ ...prev, showSubmissionForm: true }))}
          disabled={!canSubmit && !submission}
        >
          <PlusCircle className="size-4" />
          {submission ? t('proposal.editSubmission') : t('proposal.submitNew')}
        </Button>
      </div>
    ),
    [t, setState, canSubmit, isMyProposals, submission]
  )

  const pageTitle = isMyProposals
    ? t('nav.myProposals')
    : isApprovedProposals
      ? t('nav.approvedProposals')
      : t('nav.proposals')

  // Show message for non-leaders during Project Registration period
  if (isMyProposals && !groupLoading && groupRequired && !isGroupLeader) {
    return (
      <BlockContent title={pageTitle} variant="container">
        <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
          <AlertCircle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-warning-foreground">
              {t('proposal.onlyGroupLeaderCanSubmit')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('proposal.onlyGroupLeaderCanSubmitDescription')}
            </p>
          </div>
        </div>
      </BlockContent>
    )
  }

  return (
    <>
      {/* Statistics Cards - Only show for "My Proposals" */}
      {isMyProposals && <StatisticsCards statistics={data.statistics} t={t} />}

      <BlockContent title={pageTitle} actions={actions} variant="data-table">
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

      {data.error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('proposal.loadError')}</span>
          </div>
        </BlockContent>
      )}

      {/* Proposal Submission Form Modal */}
      <ProposalSubmissionForm
        open={state.showSubmissionForm}
        onClose={() => setState((prev) => ({ ...prev, showSubmissionForm: false }))}
        onSuccess={handleFormSuccess}
      />

      {/* Proposal Submission View Modal */}
      {state.selectedSubmission && (
        <ProposalSubmissionView
          submission={state.selectedSubmission}
          open={!!state.selectedSubmission}
          onClose={() => setState((prev) => ({ ...prev, selectedSubmission: null }))}
        />
      )}

      {/* View Proposal Modal (for individual proposals) */}
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
                  <RotateCcw className="size-4" />
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
