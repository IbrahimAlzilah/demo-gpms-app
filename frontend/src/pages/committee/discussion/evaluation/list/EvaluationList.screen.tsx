import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable } from '@/components/ui'
import { BlockContent, ModalDialog } from '@/components/common'
import { AlertCircle } from 'lucide-react'
import { createEvaluationColumns } from '../components/table'
import { UnifiedEvaluationModal } from '../components/UnifiedEvaluationModal'
import { useEvaluationList } from './EvaluationList.hook'

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

  return (
    <>
      <BlockContent title={t('nav.evaluation') || 'Evaluations'} variant="data-table">
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
          searchPlaceholder={t('discussion.searchPlaceholder') || 'Search evaluations...'}
          enableFiltering={true}
          enableViews={true}
          emptyMessage={t('evaluation.noEvaluations') || 'No evaluations found'}
        />
      </BlockContent>

      {data.error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('evaluation.loadError') || 'Error loading evaluations'}</span>
          </div>
        </BlockContent>
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
          title={t('evaluation.evaluate') || 'Evaluate Project'}
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
