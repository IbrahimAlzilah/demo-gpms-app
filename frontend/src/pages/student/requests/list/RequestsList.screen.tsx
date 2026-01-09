import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable, Button } from '@/components/ui'
import { BlockContent, ModalDialog, ConfirmDialog, useToast } from '@/components/common'
import { AlertCircle, PlusCircle } from 'lucide-react'
import { createRequestColumns } from '../components/table'
import { StatisticsCards } from '../components/StatisticsCards'
import { RequestsNew } from '../new/RequestsNew.screen'
import { RequestsEdit } from '../edit/RequestsEdit.screen'
import { RequestsView } from '../view/RequestsView.screen'
import { useRequestsList } from './RequestsList.hook'
import { useCancelRequest, useDeleteRequest } from '../hooks/useRequestOperations'

export function RequestsList() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const cancelRequest = useCancelRequest()
  const deleteRequest = useDeleteRequest()
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

  const handleDelete = async () => {
    if (!state.requestToDelete) return
    try {
      await deleteRequest.mutateAsync(state.requestToDelete.id)
      showToast(t('request.deleteSuccess'), 'success')
      setState((prev) => ({
        ...prev,
        requestToDelete: null,
        showDeleteDialog: false,
      }))
    } catch {
      showToast(t('request.deleteError'), 'error')
    }
  }

  const handleEditSuccess = () => {
    setState((prev) => ({ ...prev, requestToEdit: null, showEditForm: false }))
    showToast(t('request.updateSuccess'), 'success')
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
        onEdit: (request) => {
          setState((prev) => ({
            ...prev,
            requestToEdit: request,
            showEditForm: true,
          }))
        },
        onDelete: (request) => {
          setState((prev) => ({
            ...prev,
            requestToDelete: request,
            showDeleteDialog: true,
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

      {/* Edit Request Modal */}
      <RequestsEdit
        open={state.showEditForm}
        onClose={() => {
          setState((prev) => ({
            ...prev,
            showEditForm: false,
            requestToEdit: null,
          }))
        }}
        onSuccess={handleEditSuccess}
        request={state.requestToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={state.showDeleteDialog}
        onClose={() => {
          setState((prev) => ({
            ...prev,
            showDeleteDialog: false,
            requestToDelete: null,
          }))
        }}
        onConfirm={handleDelete}
        title={t('request.deleteTitle')}
        description={
          state.requestToDelete
            ? t('request.deleteDescription')
            : ''
        }
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="destructive"
      />

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
