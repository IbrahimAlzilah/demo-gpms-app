import { useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { DataTable, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui'
import { BlockContent, ConfirmDialog } from '@/components/common'
import { useToast } from '@/components/common'
import { Textarea, Label } from '@/components/ui'
import { AlertCircle } from 'lucide-react'
import { createAssignmentRequestColumns } from '../components/table'
import { useAssignmentRequestsList } from './AssignmentRequestsList.hook'
import { supervisionService } from '../api/supervision.service'
import type { SupervisorAssignmentRequest } from '../types/SupervisionRequests.types'
import type { AssignmentRequestStatusFilter } from './AssignmentRequestsList.types'

export function AssignmentRequestsList() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { toastSuccess, toastError } = useToast()

  const {
    data,
    state,
    setState,
    setStatusFilter,
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
  } = useAssignmentRequestsList()

  const handleApproveClick = useCallback((request: SupervisorAssignmentRequest) => {
    setState((prev) => ({
      ...prev,
      selectedRequest: request,
      action: 'approve',
      showConfirmDialog: true,
      response: '',
    }))
  }, [setState])

  const handleRejectClick = useCallback((request: SupervisorAssignmentRequest) => {
    setState((prev) => ({
      ...prev,
      selectedRequest: request,
      action: 'reject',
      showConfirmDialog: true,
      response: '',
    }))
  }, [setState])

  const columns = useMemo(
    () =>
      createAssignmentRequestColumns({
        onApprove: handleApproveClick,
        onReject: handleRejectClick,
        t,
      }),
    [handleApproveClick, handleRejectClick, t],
  )

  const handleConfirm = useCallback(async () => {
    if (!state.selectedRequest) return
    try {
      if (state.action === 'approve') {
        await supervisionService.approveAssignmentRequest(
          state.selectedRequest.id,
          state.response || undefined,
        )
        toastSuccess('supervisor.requestApproved', {
          description: 'Assignment request approved',
        })
      } else {
        if (!state.response.trim()) {
          toastError('supervisor.responseRequired', {
            description: 'Response is required for rejection',
          })
          return
        }
        await supervisionService.rejectAssignmentRequest(
          state.selectedRequest.id,
          state.response,
        )
        toastSuccess('supervisor.requestRejected', {
          description: 'Assignment request rejected',
        })
      }
      queryClient.invalidateQueries({ queryKey: ['supervisor-assignment-requests-table'] })
      queryClient.invalidateQueries({ queryKey: ['supervisor-dashboard'] })
      setState((prev) => ({
        ...prev,
        showConfirmDialog: false,
        selectedRequest: null,
        action: null,
        response: '',
      }))
    } catch (err: unknown) {
      toastError(
        err instanceof Error ? err.message : t('common.error', { defaultValue: 'An error occurred' }),
      )
    }
  }, [state.selectedRequest, state.action, state.response, setState, queryClient, toastSuccess, toastError, t])

  const statusOptions: { value: AssignmentRequestStatusFilter; labelKey: string }[] = [
    { value: 'all', labelKey: 'common.all' },
    { value: 'pending', labelKey: 'status.pending' },
    { value: 'approved', labelKey: 'status.approved' },
    { value: 'rejected', labelKey: 'status.rejected' },
    { value: 'canceled', labelKey: 'status.canceled' },
  ]

  return (
    <>
      <BlockContent
        title={t('supervisor.committeeRequests', {
          defaultValue: 'Committee Assignment Requests',
        })}
        variant="data-table"
      >
        <DataTable
          toolbarContent={
            <Select
              value={state.statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as AssignmentRequestStatusFilter)
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('common.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </SelectItem>
                ))}
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
          emptyMessage={t('supervisor.noCommitteeRequests', {
            defaultValue: 'No assignment requests from project committee',
          })}
        />
      </BlockContent>

      {data.error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('common.error', { defaultValue: 'Error loading data' })}</span>
          </div>
        </BlockContent>
      )}

      <ConfirmDialog
        open={state.showConfirmDialog}
        onOpenChange={(open) => {
          if (!open)
            setState((prev) => ({
              ...prev,
              showConfirmDialog: false,
              selectedRequest: null,
              action: null,
              response: '',
            }))
        }}
        title={
          state.action === 'approve'
            ? t('supervisor.approveRequest', { defaultValue: 'Approve Request' })
            : t('supervisor.rejectRequest', { defaultValue: 'Reject Request' })
        }
        description=""
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        variant={state.action === 'reject' ? 'destructive' : 'default'}
        onConfirm={handleConfirm}
      >
        {state.selectedRequest && (
          <div className="space-y-4 py-2">
            <p className="text-sm">
              {state.action === 'approve'
                ? t('supervisor.approveRequestConfirm', {
                  title: state.selectedRequest.project?.title,
                  defaultValue: `Are you sure you want to approve being a supervisor for "${state.selectedRequest.project?.title ?? ''}"?`,
                })
                : t('supervisor.rejectRequestConfirm', {
                  title: state.selectedRequest.project?.title,
                  defaultValue: `Are you sure you want to reject being a supervisor for "${state.selectedRequest.project?.title ?? ''}"?`,
                })}
            </p>
            <div className="space-y-2">
              <Label htmlFor="response">
                {t('supervisor.response', { defaultValue: 'Response/Comments' })}{' '}
                {state.action === 'reject' && (
                  <span className="text-destructive">*</span>
                )}
              </Label>
              <Textarea
                id="response"
                value={state.response}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, response: e.target.value }))
                }
                placeholder={t('supervisor.addResponse', {
                  defaultValue: 'Add a response...',
                })}
                required={state.action === 'reject'}
              />
            </div>
          </div>
        )}
      </ConfirmDialog>
    </>
  )
}
