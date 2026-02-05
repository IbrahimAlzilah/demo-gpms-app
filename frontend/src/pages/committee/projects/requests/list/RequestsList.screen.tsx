import { useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useApproveRequest, useRejectRequest } from '../hooks/useRequestOperations'
import { createRequestColumns } from '../components/table'
import { DataTable, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { BlockContent } from '@/components/common'
import { AlertCircle } from 'lucide-react'
import { useToast } from '@/components/common'
import { useRequestsList } from './RequestsList.hook'
import { RequestDetailsView } from '../view/RequestDetailsView.screen'
import { ProcessRequestModal } from '../components/ProcessRequestModal'
import type { Request } from '@/types/request.types'

export function RequestsList() {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()

  const approveRequest = useApproveRequest()
  const rejectRequest = useRejectRequest()
  const [viewingRequestId, setViewingRequestId] = useState<string | null>(null)
  const [processingRequest, setProcessingRequest] = useState<Request | null>(null)

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
  } = useRequestsList()

  const handleApprove = async (comments: string) => {
    if (!processingRequest) return
    try {
      await approveRequest.mutateAsync({ id: processingRequest.id, comments: comments || undefined })
      toastSuccess('committee.requests.approveSuccess')
      setProcessingRequest(null)
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'committee.requests.processingError')
      throw err
    }
  }

  const handleReject = async (comments: string) => {
    if (!processingRequest) return
    try {
      await rejectRequest.mutateAsync({ id: processingRequest.id, comments: comments || undefined })
      toastSuccess('committee.requests.rejectSuccess')
      setProcessingRequest(null)
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'committee.requests.processingError')
      throw err
    }
  }

  const handleProcessClick = useCallback((request: Request) => {
    setProcessingRequest(request)
  }, [])

  const handleViewClick = useCallback((request: Request) => {
    setViewingRequestId(request.id)
  }, [setViewingRequestId])

  const columns = useMemo(
    () =>
      createRequestColumns({
        onView: handleViewClick,
        onProcess: handleProcessClick,
        t,
      }),
    [handleViewClick, handleProcessClick, t]
  )

  return (
    <>
      <BlockContent title={t('nav.processRequests')} variant="data-table">
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
                <SelectItem value="supervisor_approved">{t('status.supervisor_approved')}</SelectItem>
                <SelectItem value="committee_approved">{t('common.approved')}</SelectItem>
                <SelectItem value="committee_rejected">{t('common.rejected')}</SelectItem>
                <SelectItem value="cancelled">{t('common.cancelled')}</SelectItem>
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

      {/* Process Request Modal */}
      {processingRequest && (
        <ProcessRequestModal
          requestId={processingRequest.id}
          open={!!processingRequest}
          onClose={() => setProcessingRequest(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          isProcessing={approveRequest.isPending || rejectRequest.isPending}
          onViewFullDetails={() => {
            if (processingRequest) {
              setViewingRequestId(processingRequest.id)
              setProcessingRequest(null)
            }
          }}
        />
      )}

      {/* Request Details View */}
      {viewingRequestId && (
        <RequestDetailsView
          requestId={viewingRequestId}
          open={!!viewingRequestId}
          onClose={() => setViewingRequestId(null)}
        />
      )}
    </>
  )
}
