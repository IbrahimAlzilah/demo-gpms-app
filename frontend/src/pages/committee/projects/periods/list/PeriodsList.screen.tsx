import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useCreatePeriod, useUpdatePeriod, useDeletePeriod } from '../hooks/usePeriodOperations'
import { Button, DataTable } from '@/components/ui'
import { BlockContent, ModalDialog, useToast } from '@/components/common'
import { AlertCircle, Loader2, PlusCircle } from 'lucide-react'
import { createPeriodColumns } from '../components/table'
import { PeriodForm } from '../components/PeriodForm'
import { usePeriodsList } from './PeriodsList.hook'
import type { TimePeriodSchema } from '../schema'

export function PeriodsList() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const createPeriod = useCreatePeriod()
  const updatePeriod = useUpdatePeriod()
  const deletePeriod = useDeletePeriod()
  
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
  } = usePeriodsList()

  const columns = useMemo(
    () =>
      createPeriodColumns({
        onEdit: (period) => {
          setState((prev) => ({ ...prev, selectedPeriod: period, showForm: true }))
        },
        onDelete: (period) => {
          setState((prev) => ({ ...prev, selectedPeriod: period, showDeleteDialog: true }))
        },
        t,
      }),
    [t, setState]
  )

  const handleFormSubmit = async (data: TimePeriodSchema) => {
    setState((prev) => ({ ...prev, success: false }))

    try {
      if (state.selectedPeriod) {
        await updatePeriod.mutateAsync({
          id: state.selectedPeriod.id.toString(),
          data: {
            ...data,
            isActive: state.selectedPeriod.isActive,
          },
        })
        showToast(t('committee.periods.periodUpdated') || 'Period updated successfully', 'success')
        setState((prev) => ({ ...prev, selectedPeriod: null, showForm: false }))
      } else {
        await createPeriod.mutateAsync({
          ...data,
          isActive: true,
        })
        setState((prev) => ({ ...prev, success: true, showForm: false }))
        showToast(t('committee.periods.periodCreated'), 'success')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : (state.selectedPeriod ? t('committee.periods.updateError') || 'Failed to update period' : t('committee.periods.createError'))
      showToast(errorMsg, 'error')
    }
  }

  const handleDelete = async () => {
    if (!state.selectedPeriod) return

    try {
      await deletePeriod.mutateAsync(state.selectedPeriod.id.toString())
      showToast(t('committee.periods.periodDeleted') || 'Period deleted successfully', 'success')
      setState((prev) => ({ ...prev, showDeleteDialog: false, selectedPeriod: null }))
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('committee.periods.deleteError') || 'Failed to delete period'
      showToast(errorMsg, 'error')
    }
  }

  const handleFormClose = () => {
    setState((prev) => ({ ...prev, showForm: false, selectedPeriod: null }))
    reset()
  }

  const actions = useMemo(() => (
    <Button onClick={() => setState((prev) => ({ ...prev, showForm: true }))}>
      <PlusCircle className="mr-2 h-4 w-4" />
      {t('committee.periods.createNew')}
    </Button>
  ), [t, setState])

  const periodTypeOptions = [
    { value: 'proposal_submission', label: t('committee.periods.types.proposalSubmission') },
    { value: 'project_registration', label: t('committee.periods.types.projectRegistration') },
    { value: 'document_submission', label: t('committee.periods.types.documentSubmission') },
    { value: 'supervisor_evaluation', label: t('committee.periods.types.supervisorEvaluation') },
    { value: 'committee_evaluation', label: t('committee.periods.types.committeeEvaluation') },
    { value: 'final_discussion', label: t('committee.periods.types.finalDiscussion') },
  ]

  return (
    <div className="space-y-6">
      <BlockContent title={t('committee.periods.currentPeriods')} actions={actions}>
        <DataTable
          columns={columns}
          data={data.periods}
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
          searchPlaceholder={t('common.search')}
          enableFiltering={true}
          enableViews={true}
          emptyMessage={t('committee.periods.noPeriods') || 'No periods found'}
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
        title={t('common.confirmDelete') || 'Confirm Delete'}
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
                  {t('common.deleting') || 'Deleting...'}
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
