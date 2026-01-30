import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useApproveGrade, usePublishGrades } from '../hooks/useGradeOperations'
import { createGradeColumns } from '../components/table/columns'
import { DataTable, Button, Alert, AlertDescription, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner, ConfirmDialog, BlockContent } from '@/components/common'
import { Info, Send } from 'lucide-react'
import type { Grade } from '@/types/evaluation.types'
import { useGradesList } from './GradesList.hook'
import { useToast } from '@/components/common'
import { committeeGradeService } from '../api/grade.service'

export function GradesList() {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()
  const approveGrade = useApproveGrade()
  const publishGrades = usePublishGrades()

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
    isPeriodActive,
    periodLoading,
  } = useGradesList()

  const handleApprove = async () => {
    if (!state.selectedGrade) return
    try {
      await approveGrade.mutateAsync({
        gradeId: state.selectedGrade.id,
      })
      toastSuccess('grades.approveSuccess')
      setState((prev) => ({
        ...prev,
        showDialog: false,
        selectedGrade: null,
        action: null,
      }))
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'grades.approveError')
    }
  }

  const handleActionClick = (grade: Grade, actionType: 'approve') => {
    setState((prev) => ({
      ...prev,
      selectedGrade: grade,
      action: actionType,
      showDialog: true,
    }))
  }

  const handlePublishToStudents = async () => {
    try {
      const { data } = await committeeGradeService.getAll({ is_approved: true, pageSize: 1000 })
      const ids = (data || []).map((g: Grade) => g.id)
      if (ids.length === 0) {
        toastError(t('committee.grades.noApprovedToPublish'))
        return
      }
      await publishGrades.mutateAsync(ids)
      toastSuccess(t('committee.grades.publishSuccess', { count: ids.length }))
    } catch (err) {
      toastError(err instanceof Error ? err.message : t('committee.grades.publishError'))
    }
  }

  const columns = useMemo(
    () =>
      createGradeColumns({
        onView: (grade: Grade) => {
          setState((prev) => ({ ...prev, gradeToViewId: grade.id }))
        },
        onApprove: (grade: Grade) => handleActionClick(grade, 'approve'),
        t,
      }),
    [setState, t]
  )

  if (data.isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  return (
    <BlockContent title={t('grades.management')} variant="data-table">
      {!periodLoading && !isPeriodActive && (
        <Alert variant="default" className="border-warning bg-warning/10">
          <Info className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning-foreground">
            {t('grades.periodInactiveWarning')}
          </AlertDescription>
        </Alert>
      )}

      <DataTable
        toolbarContent={
          <>
            <Select
              value={state.approvalFilter}
              onValueChange={(value) =>
                setState((prev) => ({ ...prev, approvalFilter: value as 'pending' | 'approved' | 'all' }))
              }
            >
              <SelectTrigger id="approval-filter" className="w-[200px]">
                <SelectValue placeholder={t('common.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">{t('grades.pending')}</SelectItem>
                <SelectItem value="approved">{t('grades.approved')}</SelectItem>
                <SelectItem value="all">{t('common.all')}</SelectItem>
              </SelectContent>
            </Select>
            {state.approvalFilter === 'approved' && (
              <Button
                size="sm"
                variant="secondary"
                onClick={handlePublishToStudents}
                disabled={publishGrades.isPending}
                className="gap-1"
              >
                <Send className="h-4 w-4" />
                {t('committee.grades.publishToStudents')}
              </Button>
            )}
          </>
        }
        columns={columns}
        data={data.grades}
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
        searchPlaceholder={t('committee.grades.searchPlaceholder')}
        enableFiltering={true}
        enableViews={true}
        emptyMessage={t('grades.noGrades')}
      />

      <ConfirmDialog
        open={state.showDialog}
        onOpenChange={(open) => setState((prev) => ({ ...prev, showDialog: open }))}
        title={t('grades.approveTitle')}
        description={t('grades.approveDescription')}
        confirmLabel={t('committee.grades.approveGrade')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleApprove}
        variant="default"
      >
        {state.selectedGrade && (
          <div className="space-y-4 mt-4">
            <div>
              <p className="text-sm font-medium mb-2">{t('grades.student')}</p>
              <p className="text-sm">{state.selectedGrade.student?.name || state.selectedGrade.studentId}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">{t('grades.project')}</p>
              <p className="text-sm">{state.selectedGrade.project?.title || state.selectedGrade.projectId}</p>
            </div>
            {state.selectedGrade.supervisorGrade && (
              <div>
                <p className="text-sm font-medium mb-2">{t('grades.supervisorGrade')}</p>
                <p className="text-sm">
                  {state.selectedGrade.supervisorGrade.score} / {state.selectedGrade.supervisorGrade.maxScore}
                </p>
              </div>
            )}
            {state.selectedGrade.committeeGrade && (
              <div>
                <p className="text-sm font-medium mb-2">{t('grades.committeeGrade')}</p>
                <p className="text-sm">
                  {state.selectedGrade.committeeGrade.score} / {state.selectedGrade.committeeGrade.maxScore}
                </p>
              </div>
            )}
            {state.selectedGrade.finalGrade && (
              <div>
                <p className="text-sm font-medium mb-2">{t('grades.finalGrade')}</p>
                <p className="text-sm font-bold text-lg">{state.selectedGrade.finalGrade.toFixed(2)}</p>
              </div>
            )}
          </div>
        )}
      </ConfirmDialog>
    </BlockContent>
  )
}
