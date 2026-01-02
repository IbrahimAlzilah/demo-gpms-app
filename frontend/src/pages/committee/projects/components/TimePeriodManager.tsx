import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreatePeriod, useUpdatePeriod, useDeletePeriod } from '../hooks/usePeriods'
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, DataTable } from '@/components/ui'
import { BlockContent, ModalDialog } from '@/components/common'
import { useToast } from '@/components/common'
import { AlertCircle, CheckCircle2, Calendar, Loader2, PlusCircle } from 'lucide-react'
import { timePeriodSchema, type TimePeriodSchema } from '../schema'
import type { PeriodType } from '@/types/period.types'
import { useDataTable } from '@/hooks/useDataTable'
import { periodService } from '../api/period.service'
import { createPeriodColumns } from './PeriodTableColumns'
import type { TimePeriod } from '@/types/period.types'

export function TimePeriodManager() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const createPeriod = useCreatePeriod()
  const updatePeriod = useUpdatePeriod()
  const deletePeriod = useDeletePeriod()
  const [showForm, setShowForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod | null>(null)
  const isEditMode = !!selectedPeriod
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<TimePeriodSchema>({
    resolver: zodResolver(timePeriodSchema(t)),
    defaultValues: {
      name: '',
      type: undefined as PeriodType | undefined,
      startDate: '',
      endDate: '',
      academicYear: '',
      semester: '',
    },
  })
  const [success, setSuccess] = useState(false)

  const {
    data: periods,
    pageCount,
    isLoading,
    error,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
  } = useDataTable({
    queryKey: ['committee-periods-table'],
    queryFn: (params) => periodService.getTableData(params),
    initialPageSize: 10,
    enableServerSide: true,
  })

  const columns = useMemo(
    () =>
      createPeriodColumns({
        onEdit: (period) => {
          setSelectedPeriod(period)
          // Populate form with period data
          setValue('name', period.name)
          setValue('type', period.type)
          setValue('startDate', period.startDate)
          setValue('endDate', period.endDate)
          setValue('academicYear', period.academicYear || '')
          setValue('semester', period.semester || '')
          setShowForm(true)
        },
        onDelete: (period) => {
          setSelectedPeriod(period)
          setShowDeleteDialog(true)
        },
        t,
      }),
    [t, setValue]
  )

  const onSubmit = async (data: TimePeriodSchema) => {
    setSuccess(false)

    try {
      if (isEditMode && selectedPeriod) {
        await updatePeriod.mutateAsync({
          id: selectedPeriod.id.toString(),
          data: {
            ...data,
            isActive: selectedPeriod.isActive,
          },
        })
        showToast(t('committee.periods.periodUpdated') || 'Period updated successfully', 'success')
      } else {
        await createPeriod.mutateAsync({
          ...data,
          isActive: true,
        })
        setSuccess(true)
        showToast(t('committee.periods.periodCreated'), 'success')
      }
      reset()
      setSelectedPeriod(null)
      setShowForm(false)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : (isEditMode ? t('committee.periods.updateError') || 'Failed to update period' : t('committee.periods.createError'))
      showToast(errorMsg, 'error')
    }
  }

  const handleDelete = async () => {
    if (!selectedPeriod) return

    try {
      await deletePeriod.mutateAsync(selectedPeriod.id.toString())
      showToast(t('committee.periods.periodDeleted') || 'Period deleted successfully', 'success')
      setShowDeleteDialog(false)
      setSelectedPeriod(null)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('committee.periods.deleteError') || 'Failed to delete period'
      showToast(errorMsg, 'error')
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedPeriod(null)
    reset()
  }

  const actions = useMemo(() => (
    <Button onClick={() => setShowForm(true)}>
      <PlusCircle className="mr-2 h-4 w-4" />
      {t('committee.periods.createNew')}
    </Button>
  ), [t])

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
          data={periods}
          isLoading={isLoading}
          error={error}
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

      {error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('common.error')}</span>
          </div>
        </BlockContent>
      )}

      <ModalDialog 
        open={showForm} 
        onOpenChange={handleFormClose} 
        title={isEditMode ? t('committee.periods.editPeriod') || 'Edit Period' : t('committee.periods.createNew')}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {success && !isEditMode && (
              <div className="flex items-start gap-2 p-3 text-sm text-success bg-success/10 border border-success/20 rounded-md">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{t('committee.periods.periodCreated')}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">{t('committee.periods.name')} *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder={t('committee.periods.namePlaceholder')}
                className={errors.name ? 'border-destructive' : ''}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">{t('committee.periods.type')} *</Label>
              <Select
                value={watch('type') || ''}
                onValueChange={(value) => setValue('type', value as TimePeriodSchema['type'])}
              >
                <SelectTrigger
                  id="type"
                  className={errors.type ? 'border-destructive' : ''}
                >
                  <SelectValue placeholder={t('committee.periods.selectType')} />
                </SelectTrigger>
                <SelectContent>
                  {periodTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.type.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">{t('committee.periods.startDate')} *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                  className={errors.startDate ? 'border-destructive' : ''}
                  aria-invalid={!!errors.startDate}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">{t('committee.periods.endDate')} *</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate')}
                  className={errors.endDate ? 'border-destructive' : ''}
                  aria-invalid={!!errors.endDate}
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleFormClose}
              disabled={createPeriod.isPending || updatePeriod.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={createPeriod.isPending || updatePeriod.isPending}
            >
              {(createPeriod.isPending || updatePeriod.isPending) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                isEditMode ? t('common.update') : t('committee.periods.announcePeriod')
              )}
            </Button>
          </div>
        </form>
      </ModalDialog>

      {/* Delete Confirmation Dialog */}
      <ModalDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={t('common.confirmDelete') || 'Confirm Delete'}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {selectedPeriod && (
              <>
                {t('committee.periods.confirmDelete')} <strong>"{selectedPeriod.name}"</strong>
              </>
            )}
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setSelectedPeriod(null)
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
