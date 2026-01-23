import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DataTable, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button } from '@/components/ui'
import { BlockContent, ConfirmDialog } from '@/components/common'
import { createSubmissionColumns } from '../components/table/submission-columns'
import { SubmissionReviewDialog } from '../components/SubmissionReviewDialog'
import { SubmissionDetailsView } from '../components/SubmissionDetailsView/SubmissionDetailsView'
import { useProposalsList } from './ProposalsList.hook'
import { committeeSubmissionService } from '../api/submission.service'
import { AlertCircle } from 'lucide-react'
import { useToast } from '@/components/common'

export function ProposalsList() {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()
  const queryClient = useQueryClient()

  const approveSubmission = useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId?: string }) =>
      committeeSubmissionService.approve(id, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committee-submissions-table'] })
      toastSuccess('committee.proposal.approveSuccess')
      setState((prev) => ({ ...prev, selectedSubmission: null, action: null }))
    },
    onError: (error: any) => {
      toastError(error?.response?.data?.message || 'committee.proposal.processError')
    },
  })

  const rejectSubmission = useMutation({
    mutationFn: ({ id, reviewNotes }: { id: string; reviewNotes?: string }) =>
      committeeSubmissionService.reject(id, reviewNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committee-submissions-table'] })
      toastSuccess('committee.proposal.rejectSuccess')
      setState((prev) => ({ ...prev, selectedSubmission: null, action: null }))
    },
    onError: (error: any) => {
      toastError(error?.response?.data?.message || 'committee.proposal.processError')
    },
  })

  const requestModification = useMutation({
    mutationFn: ({ id, reviewNotes }: { id: string; reviewNotes: string }) =>
      committeeSubmissionService.requestModification(id, reviewNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committee-submissions-table'] })
      toastSuccess('committee.proposal.modifySuccess')
      setState((prev) => ({ ...prev, selectedSubmission: null, action: null }))
    },
    onError: (error: any) => {
      toastError(error?.response?.data?.message || 'committee.proposal.processError')
    },
  })

  const deleteSubmission = useMutation({
    mutationFn: (id: string) => committeeSubmissionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committee-submissions-table'] })
      toastSuccess('committee.proposal.deleteSuccess')
      setState((prev) => ({ ...prev, submissionToDelete: null }))
    },
    onError: (error: any) => {
      toastError(error?.response?.data?.message || 'committee.proposal.deleteError')
    },
  })

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
      createSubmissionColumns({
        onView: (submission) => {
          setState((prev) => ({ ...prev, submissionToViewId: submission.id }))
        },
        onApprove: (submission) => {
          setState((prev) => ({ ...prev, selectedSubmission: submission, action: 'approve' }))
        },
        onReject: (submission) => {
          setState((prev) => ({ ...prev, selectedSubmission: submission, action: 'reject' }))
        },
        onRequestModification: (submission) => {
          setState((prev) => ({ ...prev, selectedSubmission: submission, action: 'modify' }))
        },
        onEdit: (submission) => {
          // TODO: Implement edit submission
          toastError('committee.proposal.editNotImplemented')
        },
        onDelete: (submission) => {
          setState((prev) => ({ ...prev, submissionToDelete: submission }))
        },
        t,
      }),
    [setState, t, toastError]
  )

  const handleConfirm = async (
    submissionId: string,
    actionType: 'approve' | 'reject' | 'modify',
    notes?: string,
    projectId?: string
  ) => {
    try {
      if (actionType === 'approve') {
        await approveSubmission.mutateAsync({ id: submissionId, projectId })
      } else if (actionType === 'reject') {
        await rejectSubmission.mutateAsync({ id: submissionId, reviewNotes: notes })
      } else if (actionType === 'modify') {
        if (!notes) {
          toastError('committee.proposal.modificationsRequired')
          return
        }
        await requestModification.mutateAsync({ id: submissionId, reviewNotes: notes })
      }
    } catch (err) {
      // Error handling is done in mutation onError
    }
  }

  const handleDelete = async () => {
    if (!state.submissionToDelete) return
    if (state.submissionToDelete.id) {
      await deleteSubmission.mutateAsync(state.submissionToDelete.id)
    }
  }

  const isLoadingAction =
    approveSubmission.isPending || rejectSubmission.isPending || requestModification.isPending

  return (
    <>

      <BlockContent
        variant="data-table"
        title={t('committee.proposal.reviewPanel')}
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
                <SelectItem value="all">{t('committee.proposal.allSubmissions')}</SelectItem>
                <SelectItem value="draft">{t('proposal.status.draft')}</SelectItem>
                <SelectItem value="submitted">{t('proposal.status.submitted')}</SelectItem>
                <SelectItem value="under_review">{t('proposal.status.underReview')}</SelectItem>
                <SelectItem value="approved">{t('proposal.status.approved')}</SelectItem>
                <SelectItem value="rejected">{t('proposal.status.rejected')}</SelectItem>
                <SelectItem value="requires_modification">{t('proposal.status.requiresModification')}</SelectItem>
              </SelectContent>
            </Select>
          }
          columns={columns}
          data={data.submissions}
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
          emptyMessage={t('committee.proposal.noSubmissions')}
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

      <SubmissionReviewDialog
        submission={state.selectedSubmission}
        action={state.action}
        onClose={() => {
          setState((prev) => ({ ...prev, selectedSubmission: null, action: null }))
        }}
        onConfirm={handleConfirm}
        isLoading={isLoadingAction}
      />

      <SubmissionDetailsView
        submissionId={state.submissionToViewId || ''}
        open={!!state.submissionToViewId}
        onClose={() => {
          setState((prev) => ({ ...prev, submissionToViewId: null }))
        }}
      />

      <ConfirmDialog
        open={!!state.submissionToDelete}
        onClose={() => {
          setState((prev) => ({ ...prev, submissionToDelete: null }))
        }}
        onConfirm={handleDelete}
        title={t('committee.proposal.confirmDelete')}
        description={
          state.submissionToDelete
            ? t('committee.proposal.confirmDeleteSubmissionDescription')
            : ''
        }
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="destructive"
      />
    </>
  )
}
