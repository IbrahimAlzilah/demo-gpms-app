import { useMemo, useCallback } from 'react'
import { DataTable, Card, CardContent, Label, Textarea } from '@/components/ui'
import { BlockContent, ConfirmDialog, useToast } from '@/components/common'
import { AlertCircle, CheckCircle2, AlertTriangle, User, Briefcase, MessageSquare } from 'lucide-react'
import { createSupervisionRequestColumns } from '../components/table'
import { useSupervisionRequestsList } from './SupervisionRequestsList.hook'
import { useApproveSupervisionRequest, useRejectSupervisionRequest } from '../hooks/useSupervisionRequestOperations'

export function SupervisionRequestsList() {
  const { showToast } = useToast()
  const approveRequest = useApproveSupervisionRequest()
  const rejectRequest = useRejectSupervisionRequest()
  const {
    data,
    state,
    setState,
    canAcceptMore,
    pageCount,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
    t,
  } = useSupervisionRequestsList()

  const handleApprove = async () => {
    if (!state.selectedRequest) return
    if (data.currentProjectCount >= data.maxProjectsPerSupervisor) {
      showToast(t('supervision.maxProjectsReached'), 'error')
      return
    }

    try {
      await approveRequest.mutateAsync(state.selectedRequest.id)
      showToast(t('supervision.approveSuccess'), 'success')
      setState((prev) => ({
        ...prev,
        comments: '',
        selectedRequest: null,
        action: null,
        showConfirmDialog: false,
      }))
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('supervision.approveError'), 'error')
    }
  }

  const handleReject = async () => {
    if (!state.selectedRequest) return
    try {
      await rejectRequest.mutateAsync({ 
        requestId: state.selectedRequest.id, 
        comments: state.comments || undefined 
      })
      showToast(t('supervision.rejectSuccess'), 'success')
      setState((prev) => ({
        ...prev,
        comments: '',
        selectedRequest: null,
        action: null,
        showConfirmDialog: false,
      }))
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('supervision.rejectError'), 'error')
    }
  }

  const handleApproveClick = useCallback((request: any) => {
    if (data.currentProjectCount >= data.maxProjectsPerSupervisor) {
      showToast(t('supervision.maxProjectsReached'), 'error')
      return
    }
    setState((prev) => ({
      ...prev,
      selectedRequest: request,
      action: 'approve',
      showConfirmDialog: true,
    }))
  }, [data.currentProjectCount, data.maxProjectsPerSupervisor, showToast, t, setState])

  const handleRejectClick = useCallback((request: any) => {
    setState((prev) => ({
      ...prev,
      selectedRequest: request,
      action: 'reject',
      showConfirmDialog: true,
    }))
  }, [setState])

  const columns = useMemo(
    () =>
      createSupervisionRequestColumns({
        onApprove: handleApproveClick,
        onReject: handleRejectClick,
        canAcceptMore,
        t,
      }),
    [handleApproveClick, handleRejectClick, canAcceptMore, t]
  )

  return (
    <>
      {/* Project Count Info */}
      <Card className={canAcceptMore ? 'border-info mb-6' : 'border-warning mb-6'}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {t('supervision.currentProjects')}
              </p>
              <p className="text-2xl font-bold">
                {data.currentProjectCount} / {data.maxProjectsPerSupervisor}
              </p>
            </div>
            {canAcceptMore ? (
              <CheckCircle2 className="h-8 w-8 text-success" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-warning" />
            )}
          </div>
          {!canAcceptMore && (
            <p className="text-xs text-warning mt-2">
              {t('supervision.maxProjectsReached')}
            </p>
          )}
        </CardContent>
      </Card>

      <BlockContent title={t('nav.supervisionRequests')}>
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
          enableFiltering={true}
          enableViews={true}
          emptyMessage={t('supervision.noRequests')}
        />
      </BlockContent>

      {data.error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('supervision.loadError')}</span>
          </div>
        </BlockContent>
      )}

      {/* Confirm Dialog with Comments */}
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
          state.action === 'approve' ? t('supervision.confirmApprove') : t('supervision.confirmReject')
        }
        description={
          state.action === 'approve' ? t('supervision.confirmApproveDescription') : t('supervision.confirmRejectDescription')
        }
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        variant={state.action === 'reject' ? 'destructive' : 'default'}
      >
        {state.selectedRequest && (
          <div className="space-y-4">
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>
                  <span className="font-medium">{t('supervision.projectTitle')}:</span> {state.selectedRequest.title}
                </span>
              </div>
              {state.selectedRequest.specialization && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <span className="font-medium">{t('supervision.specialization')}:</span> {state.selectedRequest.specialization}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {t('supervision.description')}
              </p>
              <p className="text-sm whitespace-pre-wrap">{state.selectedRequest.description}</p>
            </div>
            {(state.action === 'approve' || state.action === 'reject') && (
              <div className="space-y-2">
                <Label htmlFor="comments">
                  {t('supervision.comments')} ({t('common.optional')})
                </Label>
                <Textarea
                  id="comments"
                  value={state.comments}
                  onChange={(e) => setState((prev) => ({ ...prev, comments: e.target.value }))}
                  placeholder={t('supervision.commentsPlaceholder')}
                  rows={3}
                  className="resize-none"
                />
              </div>
            )}
          </div>
        )}
      </ConfirmDialog>
    </>
  )
}
