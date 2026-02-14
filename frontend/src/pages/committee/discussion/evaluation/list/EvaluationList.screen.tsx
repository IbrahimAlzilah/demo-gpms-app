import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable } from '@/components/ui'
import { BlockContent, ModalDialog } from '@/components/common'
import { AlertCircle, Award, TrendingUp } from 'lucide-react'
import { createEvaluationColumns } from '../components/table'
import { UnifiedEvaluationModal } from '../components/UnifiedEvaluationModal'
import { useEvaluationList } from './EvaluationList.hook'
import { Card } from '@/components/ui/card'

export function EvaluationList() {
  const { t } = useTranslation()
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
  } = useEvaluationList()

  const columns = useMemo(
    () =>
      createEvaluationColumns({
        onEvaluate: (item) => {
          setState((prev) => ({
            ...prev,
            selectedProjectId: item.project.id,
            showEvaluationForm: true,
          }))
        },
        t,
      }),
    [t, setState]
  )

  const handleEvaluationSuccess = () => {
    setState((prev) => ({
      ...prev,
      showEvaluationForm: false,
      selectedProjectId: null,
    }))
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const total = data.items.length
    const evaluated = data.items.filter(item => item.hasEvaluation).length
    const approved = data.items.filter(item => item.evaluation?.isApproved).length
    const pending = total - evaluated

    return { total, evaluated, approved, pending }
  }, [data.items])

  return (
    <>
      <BlockContent title={t('nav.evaluations')} variant="data-table">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 border-border/60 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('evaluation.total') || 'Total Students'}
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-border/60 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('evaluation.evaluated') || 'Evaluated'}
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.evaluated}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-border/60 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('evaluation.approved') || 'Approved'}
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.approved}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-border/60 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('evaluation.pending') || 'Pending'}
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={data.items}
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
          searchPlaceholder={t('evaluation.searchPlaceholder') || 'Search by student, project...'}
          enableFiltering={true}
          enableViews={true}
          emptyMessage={t('evaluation.noEvaluations') || 'No evaluations found'}
        />
      </BlockContent>

      {data.error && (
        <div className="mt-4 p-4 border border-destructive/50 bg-destructive/10 rounded-lg">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">{t('evaluation.loadError') || 'Failed to load evaluations'}</span>
          </div>
          <p className="text-sm text-destructive/80 mt-1 ml-7">
            {data.error.message || 'Please try again later'}
          </p>
        </div>
      )}

      {/* Unified Evaluation Modal – project group + individual/group grades */}
      {state.selectedProjectId && (
        <ModalDialog
          open={state.showEvaluationForm}
          onOpenChange={(open) =>
            setState((prev) => ({
              ...prev,
              showEvaluationForm: open,
              selectedProjectId: open ? prev.selectedProjectId : null,
            }))
          }
          title={t('evaluation.evaluate') || 'Evaluate Student'}
          size="xl"
        >
          <UnifiedEvaluationModal
            open={state.showEvaluationForm}
            onOpenChange={(open) =>
              setState((prev) => ({ ...prev, showEvaluationForm: open, selectedProjectId: open ? prev.selectedProjectId : null }))
            }
            projectId={state.selectedProjectId}
            role="discussion_committee"
            onSuccess={handleEvaluationSuccess}
          />
        </ModalDialog>
      )}
    </>
  )
}
