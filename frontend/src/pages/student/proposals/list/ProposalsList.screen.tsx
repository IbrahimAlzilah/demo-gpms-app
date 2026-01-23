import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DataTable, Button } from '@/components/ui'
import { BlockContent, ModalDialog } from '@/components/common'
import { useToast } from '@/components/common'
import { AlertCircle, PlusCircle, RotateCcw, Loader2, Edit } from 'lucide-react'
import { createProposalColumns } from '../components/table'
import { StatisticsCards } from '../components/StatisticsCards'
import { useProposalsList } from './ProposalsList.hook'
import { useResubmitProposal } from '../hooks/useProposalOperations'
import { useMyGroup } from '@/pages/student/groups/hooks/useGroups'
import { useAuthStore } from '@/pages/auth/login'
import { ROUTES } from '@/lib/constants'

export function ProposalsList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toastSuccess, toastError } = useToast()
  const { user } = useAuthStore()
  const { data: studentGroup } = useMyGroup()
  const [showLockModal, setShowLockModal] = useState(false)

  const resubmitProposal = useResubmitProposal()
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

  // ENFORCE: Only group leaders can submit (block solo students and non-leaders)
  const isLeader = studentGroup ? studentGroup.leaderId === user?.id : false
  const canSubmit = studentGroup && isLeader
  const isGroupMember = studentGroup ? !isLeader : false // Group member (non-leader)
  const isReadOnly = isGroupMember // Read-only access for group members

  const columns = useMemo(
    () =>
      createProposalColumns({
        onView: (proposal) => {
          navigate(`${ROUTES.STUDENT.PROPOSALS_VIEW}/${proposal.id}`)
        },
        onEdit: (proposal) => {
          // Only allow edit if user is leader and status allows editing
          if (!canSubmit) {
            toastError('proposal.onlyLeaderCanEdit')
            return
          }
          if (proposal.status === 'pending_review' || proposal.status === 'requires_modification') {
            // Navigate to edit page - it will load all proposals for the group
            navigate(ROUTES.STUDENT.PROPOSALS_EDIT)
          } else {
            toastError('proposal.cannotEdit')
          }
        },
        t,
        readOnly: isReadOnly,
      }),
    [t, navigate, canSubmit, toastError, isReadOnly]
  )

  const handleSubmitClick = async () => {
    if (!canSubmit) {
      toastError('proposal.onlyLeaderCanSubmit')
      return
    }

    // Check if locked from group data
    if (studentGroup && isLeader) {
      const isLocked = !!(studentGroup.proposalsInitialSubmittedAt || studentGroup.proposals_initial_submitted_at)
      if (isLocked) {
        setShowLockModal(true)
        return
      }
    }

    navigate(ROUTES.STUDENT.PROPOSALS_SUBMIT)
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

  // Check if proposals have been submitted (lock status)
  const hasSubmittedProposals = studentGroup && isLeader &&
    !!(studentGroup.proposalsInitialSubmittedAt || studentGroup.proposals_initial_submitted_at)

  const actions = useMemo(
    () => {
      if (!canSubmit) {
        return null // Non-leader group members can't submit
      }

      // Show either Submit or Edit button based on lock status
      if (hasSubmittedProposals) {
        // Already submitted - show Edit button to allow adding new proposals
        return (
          <Button onClick={() => navigate(ROUTES.STUDENT.PROPOSALS_EDIT)}>
            <Edit className="size-4" />
            {t('proposal.editProposals')}
          </Button>
        )
      }

      // Not yet submitted - show Submit button
      return (
        <Button onClick={handleSubmitClick}>
          <PlusCircle className="size-4" />
          {t('proposal.submitNew')}
        </Button>
      )
    },
    [t, canSubmit, hasSubmittedProposals, handleSubmitClick, navigate]
  )

  const pageTitle = isMyProposals
    ? t('nav.myProposals')
    : isApprovedProposals
      ? t('nav.approvedProposals')
      : t('nav.proposals')

  return (
    <>
      {/* Read-only access indicator for group members */}
      {isReadOnly && (
        <BlockContent variant="container" className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {t('proposal.readOnlyAccess')}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                {t('proposal.readOnlyDescription')}
              </p>
            </div>
          </div>
        </BlockContent>
      )}

      {/* Statistics Cards - Only show for "My Proposals" and leaders */}
      {isMyProposals && canSubmit && <StatisticsCards statistics={data.statistics} t={t} />}

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

      {/* Lock Modal */}
      <ModalDialog
        open={showLockModal}
        onOpenChange={setShowLockModal}
        title={t('proposal.submissionNotAllowed')}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('proposal.submissionLockedMessage')}
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowLockModal(false)}
            >
              {t('common.close')}
            </Button>
          </div>
        </div>
      </ModalDialog>

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
