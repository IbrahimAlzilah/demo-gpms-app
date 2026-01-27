import { useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useCreatePeriod, useUpdatePeriod, useDeletePeriod, useActivatePeriod, useDeactivatePeriod } from '../hooks/usePeriodOperations'
import { Button, DataTable } from '@/components/ui'
import { BlockContent, ModalDialog } from '@/components/common'
import { useToast } from '@/components/common'
import { AlertCircle, Loader2, PlusCircle } from 'lucide-react'
import { createPeriodColumns } from '../components/table'
import { PeriodForm } from '../components/PeriodForm'
import { usePeriodsList } from './PeriodsList.hook'
import type { TimePeriodSchema } from '../schema'

export function PeriodsList() {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()

  const createPeriod = useCreatePeriod()
  const updatePeriod = useUpdatePeriod()
  const deletePeriod = useDeletePeriod()
  const activatePeriod = useActivatePeriod()
  const deactivatePeriod = useDeactivatePeriod()

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
  } = usePeriodsList()

  const handleActivate = useCallback(
    async (period: any) => {
      try {
        await activatePeriod.mutateAsync(period.id.toString())
        toastSuccess('committee.periods.periodActivated')
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err?.message || 'committee.periods.activateError'
        toastError(errorMsg)
      }
    },
    [activatePeriod, toastSuccess, toastError]
  )

  const handleDeactivate = useCallback(
    async (period: any) => {
      try {
        await deactivatePeriod.mutateAsync(period.id.toString())
        toastSuccess('committee.periods.periodDeactivated')
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err?.message || 'committee.periods.deactivateError'
        toastError(errorMsg)
      }
    },
    [deactivatePeriod, toastSuccess, toastError]
  )

  const columns = useMemo(
    () =>
      createPeriodColumns({
        onEdit: (period) => {
          setState((prev) => ({ ...prev, selectedPeriod: period, showForm: true }))
        },
        onDelete: (period) => {
          setState((prev) => ({ ...prev, selectedPeriod: period, showDeleteDialog: true }))
        },
        onActivate: handleActivate,
        onDeactivate: handleDeactivate,
        t,
      }),
    [t, setState, handleActivate, handleDeactivate]
  )

  const handleFormSubmit = async (data: TimePeriodSchema) => {
    setState((prev) => ({ ...prev, success: false }))

    try {
      if (state.selectedPeriod) {
        await updatePeriod.mutateAsync({
          id: state.selectedPeriod.id.toString(),
          data: {
            ...data,
            // Include isActive from form data if present (edit mode)
            isActive: 'isActive' in data ? (data as any).isActive : undefined,
          },
        })
        toastSuccess('committee.periods.periodUpdated')
        setState((prev) => ({ ...prev, selectedPeriod: null, showForm: false }))
      } else {
        await createPeriod.mutateAsync({
          ...data,
          // Periods are created as inactive by default - they will be activated
          // automatically when start date is reached or manually by the committee
          isActive: false,
        })
        setState((prev) => ({ ...prev, success: true, showForm: false }))
        toastSuccess('committee.periods.periodCreated')
      }
    } catch (err: any) {
      // Extract error message from API response
      let errorMsg: string = state.selectedPeriod ? 'committee.periods.updateError' : 'committee.periods.createError'

      if (err?.response?.data) {
        const errorData = err.response.data

        // Check for validation errors - prioritize specific field errors
        if (errorData.errors) {
          // Check for type field errors (duplicate period type)
          if (errorData.errors.type) {
            errorMsg = Array.isArray(errorData.errors.type)
              ? errorData.errors.type[0]
              : errorData.errors.type
          }
          // Check for start_date field errors (overlapping dates)
          else if (errorData.errors.start_date) {
            errorMsg = Array.isArray(errorData.errors.start_date)
              ? errorData.errors.start_date[0]
              : errorData.errors.start_date
          }
          // Check for end_date field errors
          else if (errorData.errors.end_date) {
            errorMsg = Array.isArray(errorData.errors.end_date)
              ? errorData.errors.end_date[0]
              : errorData.errors.end_date
          }
          // Check for general validation errors
          else if (errorData.errors.message) {
            errorMsg = Array.isArray(errorData.errors.message)
              ? errorData.errors.message[0]
              : errorData.errors.message
          }
        }
        // Fallback to message field
        else if (errorData.message) {
          errorMsg = errorData.message
        }
        // Fallback to error field
        else if (errorData.error) {
          errorMsg = errorData.error
        }
      } else if (err instanceof Error) {
        errorMsg = err.message
      }

      // Display error message in toast
      // The message from backend is already user-friendly and explains the issue
      toastError(errorMsg)
    }
  }

  const handleDelete = async () => {
    if (!state.selectedPeriod) return

    try {
      await deletePeriod.mutateAsync(state.selectedPeriod.id.toString())
      toastSuccess('committee.periods.periodDeleted')
      setState((prev) => ({ ...prev, showDeleteDialog: false, selectedPeriod: null }))
    } catch (err: any) {
      let errorMsg: string = 'committee.periods.deleteError'

      if (err?.response?.data) {
        const errorData = err.response.data
        if (errorData.message) {
          errorMsg = errorData.message
        } else if (errorData.error) {
          errorMsg = errorData.error
        }
      } else if (err instanceof Error) {
        errorMsg = err.message
      }

      // useToast hook will try to translate, and if not found, will use the message as-is
      toastError(errorMsg)
    }
  }

  const handleFormClose = () => {
    setState((prev) => ({ ...prev, showForm: false, selectedPeriod: null }))
  }

  const actions = useMemo(() => (
    <Button onClick={() => setState((prev) => ({ ...prev, showForm: true }))}>
      <PlusCircle className="size-4" />
      {t('committee.periods.createNew')}
    </Button>
  ), [t, setState])



  return (
    <div className="space-y-6">
      <BlockContent title={t('committee.periods.currentPeriods')} actions={actions} variant="data-table">
        <DataTable
          columns={columns}
          data={data.periods}
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
          searchPlaceholder={t('common.search')}
          enableFiltering={true}
          enableViews={true}
          emptyMessage={t('committee.periods.noPeriods')}
        />
      </BlockContent>

      {data.error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('common.error')}</span>
          </div>
        </BlockContent>
      )}

      <PeriodForm
        open={state.showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        period={state.selectedPeriod}
        isPending={createPeriod.isPending || updatePeriod.isPending}
        success={state.success}
      />

      <ModalDialog
        open={state.showDeleteDialog}
        onOpenChange={(open) => setState((prev) => ({ ...prev, showDeleteDialog: open }))}
        title={t('common.confirmDelete')}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {state.selectedPeriod && (
              <>
                {t('committee.periods.confirmDelete')} <strong>"{state.selectedPeriod.name}"</strong>
              </>
            )}
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setState((prev) => ({ ...prev, showDeleteDialog: false, selectedPeriod: null }))
              }}
              disabled={deletePeriod.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePeriod.isPending}
            >
              {deletePeriod.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.deleting')}
                </>
              ) : (
                t('common.delete')
              )}
            </Button>
          </div>
        </div>
      </ModalDialog>
    </div>
  )
}
