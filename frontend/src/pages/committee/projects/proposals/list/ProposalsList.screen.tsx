import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApproveProposal, useRejectProposal, useRequestModification, useDeleteProposal } from '../hooks/useProposalOperations'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button, Input, Card, CardContent } from '@/components/ui'
import { BlockContent, ConfirmDialog, LoadingSpinner } from '@/components/common'
import { ProposalReviewDialog } from '../components/ProposalReviewDialog'
import { ProposalsNew } from '../new/ProposalsNew.screen'
import { ProposalsEdit } from '../edit/ProposalsEdit.screen'
import { ProposalsView } from '../view/ProposalsView.screen'
import { GroupedSubmissionCard } from '../components/GroupedSubmissionCard'
import { useProposalsList } from './ProposalsList.hook'
import { AlertCircle, PlusCircle, Search, FileText } from 'lucide-react'
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
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
  } = useProposalsList()

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

  const handleDelete = async (force = false) => {
    if (!state.proposalToDelete) return
    try {
      const result = await deleteProposal.mutateAsync({ id: state.proposalToDelete.id, force })

      // Check if deletion requires confirmation due to registrations
      if (result.requiresConfirmation && !force) {
        setState((prev) => ({
          ...prev,
          registrationDetails: result.registrationDetails || [],
          showRegistrationWarning: true,
        }))
        return
      }

      toastSuccess(t('committee.proposal.deleteSuccess'))
      setState((prev) => ({
        ...prev,
        proposalToDelete: null,
        registrationDetails: [],
        showRegistrationWarning: false,
      }))
    } catch (err: any) {
      // Check if error is due to registration requirement
      if (err?.response?.data?.requires_confirmation && !force) {
        setState((prev) => ({
          ...prev,
          registrationDetails: err.response.data.registration_details || [],
          showRegistrationWarning: true,
        }))
        return
      }
      toastError(err instanceof Error ? err.message : t('committee.proposal.deleteError'))
    }
  }

  const handleForceDelete = () => {
    handleDelete(true)
  }

  const isLoadingAction =
    approveProposal.isPending || rejectProposal.isPending || requestModification.isPending

  // Loading state - match Registration pattern
  if (data.isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <BlockContent
        variant="card"
        title={t('committee.proposal.reviewPanel')}
        actions={
          <Button onClick={() => setShowCreateDialog(true)}>
            <PlusCircle className="size-4" />
            {t('committee.proposal.create', { defaultValue: 'New Proposal' })}
          </Button>
        }
      >
        {/* Filters */}
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          {/* Search - Left side */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('committee.proposal.searchPlaceholder') || 'Search proposals...'}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-9 ps-9"
            />
          </div>

          {/* Status Filter - Right side */}
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
        </div>

        {/* Grouped View */}
        <div className="space-y-4">
          {data.error ? (
            <div className="text-center py-8">
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm font-medium text-destructive">
                  {t('committee.proposal.loadError')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.error instanceof Error ? data.error.message : String(data.error)}
                </p>
              </div>
            </div>
          ) : data.submissions.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <FileText className="h-12 w-12 text-muted-foreground/50" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t('committee.proposal.noSubmissions') || 'No submissions found'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {globalFilter
                      ? t('committee.proposal.noResultsForSearch') || 'Try adjusting your search criteria'
                      : t('committee.proposal.noSubmissionsDescription') || 'There are no proposal submissions to review at this time.'
                    }
                  </p>
                </div>
              </div>
            </div>
          ) : (
            data.submissions.map((submission) => (
              <GroupedSubmissionCard
                key={submission.id}
                submission={submission}
                onViewProposal={(proposal) => {
                  setState((prev) => ({ ...prev, proposalToViewId: proposal.id }))
                }}
                onApproveProposal={(proposal) => {
                  setState((prev) => ({ ...prev, selectedProposal: proposal, action: 'approve' }))
                }}
                onRejectProposal={(proposal) => {
                  setState((prev) => ({ ...prev, selectedProposal: proposal, action: 'reject' }))
                }}
                onRequestModification={(proposal) => {
                  setState((prev) => ({ ...prev, selectedProposal: proposal, action: 'modify' }))
                }}
                onEditProposal={(proposal) => {
                  setEditingProposalId(proposal.id)
                }}
                onDeleteProposal={(proposal) => {
                  setState((prev) => ({ ...prev, proposalToDelete: proposal }))
                }}
                isLoadingAction={(proposalId) => {
                  return (
                    (approveProposal.isPending && state.selectedProposal?.id === proposalId && state.action === 'approve') ||
                    (rejectProposal.isPending && state.selectedProposal?.id === proposalId && state.action === 'reject') ||
                    (requestModification.isPending && state.selectedProposal?.id === proposalId && state.action === 'modify')
                  )
                }}
                t={t}
              />
            ))
          )}

          {/* Pagination Controls for Grouped View - Match Registration pattern */}
          {!data.isLoading && data.submissions.length > 0 && pageCount > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                {(() => {
                  const from = (pagination.pageIndex * pagination.pageSize) + 1
                  const to = Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalCount)
                  return `Showing ${from}-${to} of ${totalCount}`
                })()}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.pageIndex === 0}
                  onClick={() => setPagination((prev) => ({
                    ...prev,
                    pageIndex: prev.pageIndex - 1
                  }))}
                >
                  {t('common.previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.pageIndex >= pageCount - 1}
                  onClick={() => setPagination((prev) => ({
                    ...prev,
                    pageIndex: prev.pageIndex + 1
                  }))}
                >
                  {t('common.next')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </BlockContent>

      <ProposalsNew
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => setShowCreateDialog(false)}
      />

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
          open={true}
          onClose={() => setEditingProposalId(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      <ConfirmDialog
        open={!!state.proposalToDelete && !state.showRegistrationWarning}
        onClose={() => {
          setState((prev) => ({ ...prev, proposalToDelete: null, registrationDetails: [], showRegistrationWarning: false }))
        }}
        onConfirm={handleDelete}
        title={t('committee.proposal.confirmDelete')}
        description={
          state.proposalToDelete
            ? t('committee.proposal.confirmDeleteDescription', { title: state.proposalToDelete.title || '' })
            : ''
        }
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="destructive"
      />

      {/* Registration Warning Dialog */}
      <ConfirmDialog
        open={!!state.proposalToDelete && !!state.showRegistrationWarning}
        onClose={() => {
          setState((prev) => ({ ...prev, proposalToDelete: null, registrationDetails: [], showRegistrationWarning: false }))
        }}
        onConfirm={handleForceDelete}
        title={t('committee.proposal.deleteWithRegistrations')}
        description={t('committee.proposal.deleteWithRegistrationsDescription')}
        confirmLabel={t('committee.proposal.deleteAnyway')}
        cancelLabel={t('common.cancel')}
        variant="destructive"
      >
        {state.registrationDetails && state.registrationDetails.length > 0 && (
          <div className="space-y-3 py-2">
            <p className="text-sm font-medium">{t('committee.proposal.registrationDetails')}:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {(state.registrationDetails || []).map((detail, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">•</span>
                  <span>
                    {detail.type === 'assigned_group' && (
                      <>
                        {t('committee.proposal.projectHasAssignedGroup')}: <strong>{detail.project_title}</strong> ({t('committee.proposal.group')}: {detail.group_name})
                      </>
                    )}
                    {detail.type === 'registrations' && (
                      <>
                        {t('committee.proposal.projectHasRegistrations')}: <strong>{detail.project_title}</strong> ({detail.count} {t('committee.proposal.registrations')})
                      </>
                    )}
                    {detail.type === 'assigned_students' && (
                      <>
                        {t('committee.proposal.projectHasAssignedStudents')}: <strong>{detail.project_title}</strong> ({detail.count} {t('common.students')})
                      </>
                    )}
                    {detail.type === 'group_registrations' && (
                      <>
                        {t('committee.proposal.groupHasRegistrations')}: <strong>{detail.group_name}</strong>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </ConfirmDialog>

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
