import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApproveProposal, useRejectProposal, useRequestModification, useDeleteProposal } from '../hooks/useProposalOperations'
import { DataTable, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button, Input } from '@/components/ui'
import { BlockContent, ConfirmDialog, LoadingSpinner } from '@/components/common'
import { createProposalColumns } from '../components/table'
import { ProposalReviewDialog } from '../components/ProposalReviewDialog'
import { ProposalsNew } from '../new/ProposalsNew.screen'
import { ProposalsEdit } from '../edit/ProposalsEdit.screen'
import { ProposalsView } from '../view/ProposalsView.screen'
import { GroupedSubmissionCard } from '../components/GroupedSubmissionCard'
import { useProposalsList } from './ProposalsList.hook'
import { AlertCircle, PlusCircle, LayoutGrid, List, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react'
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

  const isGroupedView = state.viewMode === 'grouped'

  return (
    <>
      <BlockContent
        variant="data-table"
        title={t('committee.proposal.reviewPanel')}
        actions={
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
              <Button
                variant={isGroupedView ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setState((prev) => ({ ...prev, viewMode: 'grouped' }))}
                className="h-8 px-3"
              >
                <LayoutGrid className="h-3.5 w-3.5 me-1.5" />
                {t('committee.proposal.groupedView') || 'Grouped'}
              </Button>
              <Button
                variant={!isGroupedView ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setState((prev) => ({ ...prev, viewMode: 'individual' }))}
                className="h-8 px-3"
              >
                <List className="h-3.5 w-3.5 me-1.5" />
                {t('committee.proposal.individualView') || 'Individual'}
              </Button>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <PlusCircle className="size-4" />
              {t('committee.proposal.create', { defaultValue: 'New Proposal' })}
            </Button>
          </div>
        }
      >
        {/* Filters */}
        <div className="mb-4 flex items-center gap-2 flex-wrap">
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

          {/* Search for Grouped View */}
          {isGroupedView && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('committee.proposal.searchPlaceholder') || 'Search proposals...'}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="h-9 ps-9"
              />
            </div>
          )}
        </div>

        {/* Grouped View */}
        {isGroupedView ? (
          <>
            <div className="space-y-4">
              {data.isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <LoadingSpinner />
                  <p className="mt-4 text-sm text-muted-foreground">{t('common.loading')}</p>
                </div>
              ) : data.submissions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-base font-medium text-foreground mb-1">
                    {t('committee.proposal.noSubmissions') || 'No submissions found'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {globalFilter 
                      ? t('committee.proposal.noResultsForSearch') || 'Try adjusting your search criteria'
                      : t('committee.proposal.noSubmissionsDescription') || 'There are no proposal submissions to review at this time.'
                    }
                  </p>
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
            </div>

            {/* Pagination Controls for Grouped View */}
            {!data.isLoading && data.submissions.length > 0 && pageCount > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="flex-1 text-sm text-muted-foreground">
                  {totalCount > 0 ? (
                    <span>
                      {t('dataTable.rowsInfo', {
                        start: pagination.pageIndex * pagination.pageSize + 1,
                        end: Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalCount),
                        total: totalCount,
                      })}
                    </span>
                  ) : (
                    <span>{t('dataTable.noResults')}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Select
                      value={`${pagination.pageSize}`}
                      onValueChange={(value) => {
                        setPagination((prev) => ({ ...prev, pageSize: Number(value), pageIndex: 0 }))
                      }}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[10, 20, 30, 40, 50].map((size) => (
                          <SelectItem key={size} value={`${size}`}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    {t('dataTable.pageInfo', { page: pagination.pageIndex + 1, total: pageCount || 1 })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 0 }))}
                      disabled={pagination.pageIndex === 0}
                    >
                      <span className="sr-only">{t('dataTable.goToFirstPage')}</span>
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => setPagination((prev) => ({ ...prev, pageIndex: Math.max(0, prev.pageIndex - 1) }))}
                      disabled={pagination.pageIndex === 0}
                    >
                      <span className="sr-only">{t('dataTable.goToPreviousPage')}</span>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => setPagination((prev) => ({ ...prev, pageIndex: Math.min(pageCount - 1, prev.pageIndex + 1) }))}
                      disabled={pagination.pageIndex >= pageCount - 1}
                    >
                      <span className="sr-only">{t('dataTable.goToNextPage')}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => setPagination((prev) => ({ ...prev, pageIndex: pageCount - 1 }))}
                      disabled={pagination.pageIndex >= pageCount - 1}
                    >
                      <span className="sr-only">{t('dataTable.goToLastPage')}</span>
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Individual View - Table */
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
            searchPlaceholder={t('committee.proposal.searchPlaceholder')}
            enableFiltering={true}
            enableViews={true}
            emptyMessage={t('committee.proposal.noProposals')}
          />
        )}
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
        open={!!state.proposalToDelete && !state.showRegistrationWarning}
        onClose={() => {
          setState((prev) => ({ ...prev, proposalToDelete: null, registrationDetails: [], showRegistrationWarning: false }))
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
              {state.registrationDetails.map((detail, index) => (
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
