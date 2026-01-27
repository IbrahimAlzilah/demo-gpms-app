import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DataTable, Button } from '@/components/ui'
import { BlockContent, ModalDialog } from '@/components/common'
import { useToast } from '@/components/common'
import {
  AlertCircle,
  RotateCcw,
  Loader2,
  Edit,
  Eye,
  PlusCircle,
  ArrowRight
} from 'lucide-react'
import { createProposalColumns } from '../components/table'
// import { StatisticsCards } from '../components/StatisticsCards'
import { EmptyProposalsState } from '../components/EmptyProposalsState'
import { useProposalsList } from './ProposalsList.hook'
import { useResubmitProposal } from '../hooks/useProposalOperations'
import { useMyGroup } from '@/pages/student/groups/hooks/useGroups'
import { useAuthStore } from '@/pages/auth/login'
import { usePeriodCheck } from '@/hooks/usePeriodCheck'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { proposalService } from '../api/proposal.service'

export function ProposalsList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toastSuccess, toastError } = useToast()
  const { user } = useAuthStore()
  const { data: studentGroup } = useMyGroup()
  const { isPeriodActive: isSubmissionPeriodActive, isLoading: isPeriodLoading } = usePeriodCheck('proposal_submission')
  const [showLockModal, setShowLockModal] = useState(false)
  const [showReadOnlyModal, setShowReadOnlyModal] = useState(false)

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

  // Check if proposals have been submitted (lock status)
  const hasSubmittedProposals = studentGroup && isLeader &&
    !!(studentGroup.proposalsInitialSubmittedAt || studentGroup.proposals_initial_submitted_at)

  const columns = useMemo(
    () =>
      createProposalColumns({
        onView: (proposal) => {
          navigate(`${ROUTES.STUDENT.PROPOSALS_VIEW}/${proposal.id}`)
        },
        onEdit: async (proposal) => {
          // First check if student has a group at all
          if (!studentGroup) {
            setShowNoGroupModal(true)
            return
          }

          // Only allow edit if user is leader and status allows editing
          if (!canSubmit) {
            // Show read-only modal ONLY for group members (non-leaders who are in a group)
            // Note: We already checked !studentGroup above, so at this point studentGroup exists
            setShowReadOnlyModal(true)
            return
          }

          // Check if proposal status allows editing (individual proposal check)
          if (proposal.status !== 'pending_review' && proposal.status !== 'requires_modification') {
            toastError('proposal.cannotEdit')
            return
          }

          // Use getSubmissionContext API to validate ALL proposals in the group
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
            navigate(ROUTES.STUDENT.PROPOSALS_EDIT)
          } catch (error: any) {
            // Handle API errors
            const errorMessage = error.response?.data?.message ||
              error.message ||
              'proposal.loadError'
            toastError(errorMessage)
          }
        },
        t,
        readOnly: isReadOnly,
      }),
    [t, navigate, canSubmit, toastError, isReadOnly, setShowReadOnlyModal, studentGroup]
  )

  const [showNoGroupModal, setShowNoGroupModal] = useState(false)

  const handleSubmitClick = async () => {
    // First check if proposal submission period is active
    if (!isSubmissionPeriodActive) {
      toastError('proposal.submissionPeriodClosed')
      return
    }

    // Then check if student has a group at all
    if (!studentGroup) {
      setShowNoGroupModal(true)
      return
    }

    // Then check if user is a leader
    if (!canSubmit) {
      toastError('proposal.onlyLeaderCanSubmit')
      return
    }

    // Then check if proposal submission period is active
    if (!isSubmissionPeriodActive) {
      toastError('proposal.submissionPeriodClosed')
      return
    }

    // Then check if locked from group data
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

  // Enhanced action buttons with better visual design
  const actions = useMemo(
    () => {
      // Show button for all students, but handle click differently based on role
      const handleButtonClick = () => {
        if (!canSubmit) {
          // Non-leader group member - show read-only modal
          setShowReadOnlyModal(true)
          return
        }

        // Leader - proceed with normal flow
        if (hasSubmittedProposals) {
          navigate(ROUTES.STUDENT.PROPOSALS_EDIT)
        } else {
          handleSubmitClick()
        }
      }

      // Show either Submit or Edit button based on lock status
      if (hasSubmittedProposals) {
        // Already submitted - show Edit button to allow adding new proposals
        return (
          <Button
            variant="default"
            onClick={handleButtonClick}
          >
            <Edit className="size-4" />
            {t('proposal.editProposals')}
          </Button>
        )
      }

      // Not yet submitted - show Submit button
      return (
        <Button
          variant="default"
          onClick={handleSubmitClick}
          // disabled={!isSubmissionPeriodActive || isPeriodLoading}
          disabled={isPeriodLoading}
          title={!isSubmissionPeriodActive ? t('proposal.submissionPeriodClosed') : undefined}
        >
          <PlusCircle className="size-4" />
          {t('proposal.submitNew')}
        </Button>
      )
    },
    [t, canSubmit, hasSubmittedProposals, handleSubmitClick, navigate, isSubmissionPeriodActive, isPeriodLoading]
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
      {/* Statistics Cards - Only show for "My Proposals" and leaders */}
      {/* {isMyProposals && canSubmit && <StatisticsCards statistics={data.statistics} t={t} />} */}

      {/* Main Content */}
      {isEmpty && !data.isLoading && !isApprovedProposals ? (
        <BlockContent title={pageTitle} variant="data-table" actions={actions} className="border-dashed">
          <EmptyProposalsState
            t={t}
            canSubmit={canSubmit || false}
            isReadOnly={isReadOnly}
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
                navigate(ROUTES.STUDENT.PROPOSALS_EDIT)
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

      {/* Read-Only Access Modal - ONLY for non-leader group members (not for students without a group) */}
      <ModalDialog
        open={showReadOnlyModal && !!studentGroup}
        onOpenChange={(open) => {
          if (!open) setShowReadOnlyModal(false)
        }}
        title={t('proposal.readOnlyAccess') || 'Read-Only Access'}
      >
        <div className="space-y-6">
          <div className={cn(
            'flex items-center gap-3 p-4 rounded-lg border',
            'bg-gradient-to-r from-blue-50 to-blue-50/50 border-blue-200',
            'dark:from-blue-950/30 dark:to-blue-950/10 dark:border-blue-800'
          )}>
            <div className="p-2 rounded-lg bg-blue-500/10 shrink-0">
              <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {t('proposal.readOnlyAccess') || 'Read-Only Access'}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                {t('proposal.readOnlyModalDescription') ||
                  'You are viewing proposals submitted by your group leader. You can view but cannot modify proposals.'}
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowReadOnlyModal(false)}
            >
              {t('common.close')}
            </Button>
          </div>
        </div>
      </ModalDialog>

      {/* No Group Modal - For students without a group */}
      <ModalDialog
        open={showNoGroupModal}
        onOpenChange={setShowNoGroupModal}
        title={t('proposal.groupRequired')}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-warning/10 border border-warning/20">
            <div className="p-2 rounded-full bg-warning/20">
              <AlertCircle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm font-medium text-warning-foreground">
                {t('proposal.groupRequiredTitle')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('proposal.groupRequiredMessage')}
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {t('proposal.groupRequiredDescription')}
          </p>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowNoGroupModal(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={() => {
                setShowNoGroupModal(false)
                navigate(ROUTES.STUDENT.GROUPS)
              }}
            >
              {t('groups.management') || t('groups.title') || t('groups.createGroup')}
            </Button>
          </div>
        </div>
      </ModalDialog>
    </div>
  )
}
