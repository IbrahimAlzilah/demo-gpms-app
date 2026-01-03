import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useApproveRequest, useRejectRequest } from '../hooks/useRequestOperations'
import { requiresSupervisorApproval } from '@/features/common/utils/requestRouting'
import { createRequestColumns } from '../components/table'
import { DataTable } from '@/components/ui'
import { BlockContent, ConfirmDialog } from '@/components/common'
import { AlertCircle, User, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Textarea, Label } from '@/components/ui'
import { useToast } from '@/components/common'
import { useRequestsList } from './RequestsList.hook'

export function RequestsList() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const approveRequest = useApproveRequest()
  const rejectRequest = useRejectRequest()
  
  const {
    data,
    state,
    setState,
    pageCount,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
  } = useRequestsList()

  const handleApprove = async () => {
    if (!state.selectedRequest) return
    try {
      await approveRequest.mutateAsync({ id: state.selectedRequest.id, comments: state.comments || undefined })
      showToast(t('committee.requests.approveSuccess'), 'success')
      setState((prev) => ({
        ...prev,
        comments: '',
        selectedRequest: null,
        action: null,
        showConfirmDialog: false,
      }))
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t('committee.requests.processingError'),
        'error'
      )
    }
  }

  const handleReject = async () => {
    if (!state.selectedRequest) return
    try {
      await rejectRequest.mutateAsync({ id: state.selectedRequest.id, comments: state.comments || undefined })
      showToast(t('committee.requests.rejectSuccess'), 'success')
      setState((prev) => ({
        ...prev,
        comments: '',
        selectedRequest: null,
        action: null,
        showConfirmDialog: false,
      }))
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t('committee.requests.processingError'),
        'error'
      )
    }
  }

  const handleApproveClick = (request: typeof state.selectedRequest) => {
    if (!request) return
    setState((prev) => ({
      ...prev,
      selectedRequest: request,
      action: 'approve',
      showConfirmDialog: true,
    }))
  }

  const handleRejectClick = (request: typeof state.selectedRequest) => {
    if (!request) return
    setState((prev) => ({
      ...prev,
      selectedRequest: request,
      action: 'reject',
      showConfirmDialog: true,
    }))
  }

  const columns = useMemo(
    () =>
      createRequestColumns({
        onApprove: handleApproveClick,
        onReject: handleRejectClick,
        t,
      }),
    [t]
  )

  return (
    <>
      <BlockContent title={t('nav.processRequests')}>
        <DataTable
          columns={columns}
          data={data.requests}
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
          searchPlaceholder={t('committee.requests.searchPlaceholder')}
          enableFiltering={true}
          enableViews={true}
          emptyMessage={t('committee.requests.noRequests')}
        />
      </BlockContent>

      {data.error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('committee.requests.loadError')}</span>
          </div>
        </BlockContent>
      )}

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
            ? t('committee.requests.confirmApprove')
            : t('committee.requests.confirmReject')
        }
        description={
          state.action === 'approve'
            ? t('committee.requests.confirmApproveDescription')
            : t('committee.requests.confirmRejectDescription')
        }
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        variant={state.action === 'reject' ? 'destructive' : 'default'}
      >
        {state.selectedRequest && (
          <div className="space-y-4">
            <div className="text-sm space-y-2">
              {state.selectedRequest.student && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <span className="font-medium">{t('committee.requests.student')}:</span> {state.selectedRequest.student.name}
                  </span>
                </div>
              )}
              {state.selectedRequest.supervisorApproval && (
                <div className="mt-2 p-3 bg-info/10 rounded-lg border border-info/20">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-info" />
                    <p className="font-medium text-info">
                      {t('committee.requests.supervisorDecision')}:{' '}
                      <span className={state.selectedRequest.supervisorApproval.approved ? 'text-success' : 'text-destructive'}>
                        {state.selectedRequest.supervisorApproval.approved 
                          ? t('common.approved')
                          : t('common.rejected')
                        }
                      </span>
                    </p>
                  </div>
                  {state.selectedRequest.supervisorApproval.comments && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {state.selectedRequest.supervisorApproval.comments}
                    </p>
                  )}
                </div>
              )}
              {requiresSupervisorApproval(state.selectedRequest.type) && state.selectedRequest.status === 'pending' && (
                <div className="flex items-start gap-2 p-2 bg-warning/10 rounded border border-warning/20">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                  <p className="text-xs text-warning-foreground">
                    {t('committee.requests.needsSupervisorApproval')}
                  </p>
                </div>
              )}
              {state.selectedRequest.status === 'supervisor_approved' && (
                <div className="flex items-start gap-2 p-2 bg-info/10 rounded border border-info/20">
                  <CheckCircle2 className="h-4 w-4 text-info mt-0.5 shrink-0" />
                  <p className="text-xs text-info-foreground">
                    {t('committee.requests.supervisorApproved')}
                  </p>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {t('request.reason')}
              </p>
              <p className="text-sm whitespace-pre-wrap">{state.selectedRequest.reason}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comments">
                {t('committee.requests.comments')} ({t('common.optional')})
              </Label>
              <Textarea
                id="comments"
                value={state.comments}
                onChange={(e) => setState((prev) => ({ ...prev, comments: e.target.value }))}
                placeholder={t('committee.requests.commentsPlaceholder')}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        )}
      </ConfirmDialog>
    </>
  )
}
