import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable, Button } from '@/components/ui'
import { BlockContent, ModalDialog, ConfirmDialog, useToast } from '@/components/common'
import { AlertCircle, PlusCircle } from 'lucide-react'
import { createRequestColumns } from '../components/table'
import { StatisticsCards } from '../components/StatisticsCards'
import { RequestsNew } from '../new/RequestsNew.screen'
import { RequestsView } from '../view/RequestsView.screen'
import { useRequestsList } from './RequestsList.hook'
import { useCancelRequest } from '../hooks/useRequestOperations'

export function RequestsList() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const cancelRequest = useCancelRequest()
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

  const handleCancel = async () => {
    if (!state.requestToCancel) return
    try {
      await cancelRequest.mutateAsync(state.requestToCancel.id)
      showToast(t('request.cancelSuccess'), 'success')
      setState((prev) => ({
        ...prev,
        requestToCancel: null,
        showCancelDialog: false,
      }))
    } catch {
      showToast(t('request.cancelError'), 'error')
    }
  }

  const columns = useMemo(
    () =>
      createRequestColumns({
        onView: (request) => {
          setState((prev) => ({ ...prev, selectedRequest: request }))
        },
        onCancel: (request) => {
          setState((prev) => ({
            ...prev,
            requestToCancel: request,
            showCancelDialog: true,
          }))
        },
        t,
      }),
    [t, setState]
  )

  const handleFormSuccess = () => {
    setState((prev) => ({ ...prev, showForm: false }))
    showToast(t('request.submitSuccess'), 'success')
  }

  const actions = useMemo(
    () => (
      <Button onClick={() => setState((prev) => ({ ...prev, showForm: true }))}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {t('request.newRequest')}
      </Button>
    ),
    [t, setState]
  )

  return (
    <>
      {/* Statistics Cards */}
      <StatisticsCards statistics={data.statistics} t={t} />

      <BlockContent title={t('nav.requests')} actions={actions}>
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
          emptyMessage={t('request.noRequests')}
        />
      </BlockContent>

      {data.error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('request.loadError')}</span>
          </div>
        </BlockContent>
      )}

      {/* New Request Modal */}
      <RequestsNew
        open={state.showForm}
        onClose={() => setState((prev) => ({ ...prev, showForm: false }))}
        onSuccess={handleFormSuccess}
      />

      {/* View Request Modal */}
      {state.selectedRequest && (
        <RequestsView
          requestId={state.selectedRequest.id}
          open={!!state.selectedRequest}
          onClose={() => setState((prev) => ({ ...prev, selectedRequest: null }))}
        />
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={state.showCancelDialog}
        onClose={() => {
          setState((prev) => ({
            ...prev,
            showCancelDialog: false,
            requestToCancel: null,
          }))
        }}
        onConfirm={handleCancel}
        title={t('request.cancelTitle')}
        description={t('request.cancelDescription')}
        confirmLabel={t('request.cancel')}
        cancelLabel={t('common.cancel')}
        variant="destructive"
      />
    </>
  )
}
