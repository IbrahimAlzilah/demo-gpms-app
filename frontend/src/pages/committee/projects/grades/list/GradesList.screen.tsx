import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useApproveGrade } from '../hooks/useGradeOperations'
import { createGradeColumns } from '../components/table'
import { DataTable, Button, Alert, AlertDescription } from '@/components/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner, ConfirmDialog } from '@/components/common'
import { AlertCircle, Info } from 'lucide-react'
import type { Grade } from '@/types/evaluation.types'
import { useGradesList } from './GradesList.hook'
import { useToast } from '@/components/common'

export function GradesList() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const approveGrade = useApproveGrade()
  
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
    isPeriodActive,
    periodLoading,
  } = useGradesList()

  const handleApprove = async () => {
    if (!state.selectedGrade) return
    try {
      await approveGrade.mutateAsync({
        gradeId: state.selectedGrade.id,
      })
      showToast(t('grades.approveSuccess'), 'success')
      setState((prev) => ({
        ...prev,
        showDialog: false,
        selectedGrade: null,
        action: null,
      }))
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t('grades.approveError'),
        'error'
      )
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

  const columns = useMemo(
    () =>
      createGradeColumns({
        onView: (grade) => {
          setState((prev) => ({ ...prev, gradeToViewId: grade.id }))
        },
        onApprove: (grade) => handleActionClick(grade, 'approve'),
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
    <div className="space-y-4">
      {!periodLoading && !isPeriodActive && (
        <Alert variant="default" className="border-warning bg-warning/10">
          <Info className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning-foreground">
            {t('grades.periodInactiveWarning')}
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>{t('grades.management')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              variant={state.approvalFilter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setState((prev) => ({ ...prev, approvalFilter: 'pending' }))}
            >
              {t('grades.pending')}
            </Button>
            <Button
              variant={state.approvalFilter === 'approved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setState((prev) => ({ ...prev, approvalFilter: 'approved' }))}
            >
              {t('grades.approved')}
            </Button>
            <Button
              variant={state.approvalFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setState((prev) => ({ ...prev, approvalFilter: 'all' }))}
            >
              {t('common.all')}
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={data.grades}
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
            emptyMessage={t('grades.noGrades')}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={state.showDialog}
        onOpenChange={(open) => setState((prev) => ({ ...prev, showDialog: open }))}
        title={t('grades.approveTitle')}
        description={t('grades.approveDescription')}
        confirmText={t('common.approve')}
        cancelText={t('common.cancel')}
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
    </div>
  )
}
