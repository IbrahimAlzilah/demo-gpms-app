import { useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, Label } from '@/components/ui'
import { BlockContent, ConfirmDialog } from '@/components/common'
import { useToast } from '@/components/common'
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react'
import { useSupervisionRequestsList } from './SupervisionRequestsList.hook'
import { useApproveSupervisionRequest, useRejectSupervisionRequest } from '../hooks/useSupervisionRequestOperations'
import { SupervisionRequestDetailsView } from '../components/SupervisionRequestDetailsView'
import { createSupervisionRequestColumns } from '../components/table'
import type { Project } from '@/types/project.types'

export function SupervisionRequestsList() {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()

  const approveRequest = useApproveSupervisionRequest()
  const rejectRequest = useRejectSupervisionRequest()
  const {
    data,
    state,
    setState,
    canAcceptMore,
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
  } = useSupervisionRequestsList()

  const handleApprove = async () => {
    if (!state.selectedRequest) return

    // Validate request status
    if (state.selectedRequest.supervisorApprovalStatus !== 'pending') {
      toastError('supervision.requestNotPending')
      setState((prev) => ({
        ...prev,
        showConfirmDialog: false,
        selectedRequest: null,
        action: null,
        comments: '',
      }))
      return
    }

    if (data.currentProjectCount >= data.maxProjectsPerSupervisor) {
      toastError('supervision.maxProjectsReached')
      return
    }

    try {
      await approveRequest.mutateAsync(state.selectedRequest.id)
      toastSuccess('supervision.approveSuccess')
      setState((prev) => ({
        ...prev,
        comments: '',
        selectedRequest: null,
        action: null,
        showConfirmDialog: false,
      }))
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        t('supervision.approveError')
      toastError(errorMessage)
    }
  }

  const handleReject = async () => {
    if (!state.selectedRequest) return

    // Validate request status
    if (state.selectedRequest.supervisorApprovalStatus !== 'pending') {
      toastError('supervision.requestNotPending')
      setState((prev) => ({
        ...prev,
        showConfirmDialog: false,
        selectedRequest: null,
        action: null,
        comments: '',
      }))
      return
    }

    try {
      await rejectRequest.mutateAsync({
        requestId: state.selectedRequest.id,
        comments: state.comments || undefined
      })
      toastSuccess('supervision.rejectSuccess')
      setState((prev) => ({
        ...prev,
        comments: '',
        selectedRequest: null,
        action: null,
        showConfirmDialog: false,
      }))
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        t('supervision.rejectError')
      toastError(errorMessage)
    }
  }

  const handleApproveClick = useCallback((project: Project) => {
    setState((prev) => ({
      ...prev,
      selectedRequest: project,
      action: 'approve',
      showConfirmDialog: true,
    }))
  }, [setState])

  const handleRejectClick = useCallback((project: Project) => {
    setState((prev) => ({
      ...prev,
      selectedRequest: project,
      action: 'reject',
      showConfirmDialog: true,
    }))
  }, [setState])

  const handleViewClick = useCallback((project: Project) => {
    setState((prev) => ({
      ...prev,
      viewingRequest: project,
    }))
  }, [setState])

  const columns = useMemo(
    () =>
      createSupervisionRequestColumns({
        onView: handleViewClick,
        onApprove: handleApproveClick,
        onReject: handleRejectClick,
        canAcceptMore,
        t,
      }),
    [handleViewClick, handleApproveClick, handleRejectClick, canAcceptMore, t]
  )

  return (
    <>
      <BlockContent 
        title={
          <div className="flex items-center gap-4">
            <span>{t('nav.supervisionRequests')}</span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-xs">{t('supervision.currentProjects')}:</span>
              <span className="font-semibold text-foreground">
                {data.currentProjectCount} / {data.maxProjectsPerSupervisor}
              </span>
              {canAcceptMore ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-warning" />
              )}
            </div>
          </div>
        }
        variant="data-table"
      >
        <DataTable
          toolbarContent={
            <Select
              value={state.statusFilter}
              onValueChange={(value) => {
                setState((prev) => ({ ...prev, statusFilter: value as typeof prev.statusFilter }))
                // Reset to first page when filter changes
                setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('common.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="pending">{t('common.pending')}</SelectItem>
                <SelectItem value="approved">{t('common.approved')}</SelectItem>
                <SelectItem value="rejected">{t('common.rejected')}</SelectItem>
              </SelectContent>
            </Select>
          }
          columns={columns}
          data={data.requests}
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
          emptyMessage={t('supervision.noRequests', { defaultValue: 'No supervision requests found' })}
        />
      </BlockContent>

      {data.error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('supervision.loadError', { defaultValue: 'Failed to load supervision requests' })}</span>
          </div>
        </BlockContent>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={state.showConfirmDialog}
        onClose={() => {
          setState((prev) => ({
            ...prev,
            showConfirmDialog: false,
            selectedRequest: null,
            action: null,
            comments: '',
          }))
        }}
        onConfirm={() => {
          if (state.action === 'approve') {
            handleApprove()
          } else if (state.action === 'reject') {
            handleReject()
          }
        }}
        title={
          state.action === 'approve'
            ? t('supervision.confirmApprove', { defaultValue: 'Approve Supervision Request' })
            : t('supervision.confirmReject', { defaultValue: 'Reject Supervision Request' })
        }
        description={
          state.action === 'approve'
            ? t('supervision.confirmApproveDescription', { defaultValue: 'Are you sure you want to approve this supervision request?' })
            : t('supervision.confirmRejectDescription', { defaultValue: 'Are you sure you want to reject this supervision request? A comment is required.' })
        }
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        variant={state.action === 'reject' ? 'destructive' : 'default'}
      >
        {state.selectedRequest && (
          <div className="space-y-4 py-2">
            <div className="text-sm space-y-2">
              {state.selectedRequest.supervisorApprovalStatus === 'pending' && (
                <div className="flex items-start gap-2 p-2 bg-info/10 rounded border border-info/20">
                  <AlertCircle className="h-4 w-4 text-info mt-0.5 shrink-0" />
                  <p className="text-xs text-info-foreground">
                    {t('supervision.awaitingYourResponse', { defaultValue: 'This request is awaiting your response' })}
                  </p>
                </div>
              )}
            </div>
            {state.action === 'reject' && (
              <div className="space-y-2">
                <Label htmlFor="reject-comments" className="text-sm font-medium">
                  {t('supervision.comments')} ({t('common.required')})
                </Label>
                <Textarea
                  id="reject-comments"
                  value={state.comments}
                  onChange={(e) => setState((prev) => ({ ...prev, comments: e.target.value }))}
                  placeholder={t('supervision.commentsPlaceholder', { defaultValue: 'Please provide a reason for rejection...' })}
                  rows={3}
                  required
                />
              </div>
            )}
          </div>
        )}
      </ConfirmDialog>

      {/* Request Details View */}
      {state.viewingRequest && (
        <SupervisionRequestDetailsView
          request={state.viewingRequest}
          open={!!state.viewingRequest}
          onClose={() => setState((prev) => ({ ...prev, viewingRequest: null }))}
        />
      )}
    </>
  )
}
