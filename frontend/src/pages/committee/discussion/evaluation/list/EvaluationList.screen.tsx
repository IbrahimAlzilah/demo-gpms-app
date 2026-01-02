import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable } from '@/components/ui'
import { BlockContent, ModalDialog } from '@/components/common'
import { AlertCircle } from 'lucide-react'
import { createEvaluationColumns } from '../components/EvaluationTableColumns'
import { EvaluationNew } from '../new/EvaluationNew.screen'
import { useEvaluationList } from './EvaluationList.hook'

export function EvaluationList() {
  const { t } = useTranslation()
  const {
    data,
    state,
    setState,
  } = useEvaluationList()

  const columns = useMemo(
    () =>
      createEvaluationColumns({
        onEvaluate: (item) => {
          setState((prev) => ({
            ...prev,
            selectedProjectId: item.project.id,
            selectedStudentId: item.student.id,
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
      selectedStudentId: null,
    }))
  }

  return (
    <>
      <BlockContent title={t('nav.evaluation') || 'Evaluations'}>
        <DataTable
          columns={columns}
          data={data.items}
          isLoading={data.isLoading}
          error={data.error}
          pageCount={data.pageCount}
          pageIndex={0}
          pageSize={10}
          onPaginationChange={() => {}}
          sorting={[]}
          onSortingChange={() => {}}
          columnFilters={[]}
          onColumnFiltersChange={() => {}}
          searchValue=""
          onSearchChange={() => {}}
          enableFiltering={false}
          enableViews={false}
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

      {/* Evaluation Form Modal */}
      {state.selectedProjectId && state.selectedStudentId && (
        <ModalDialog
          open={state.showEvaluationForm}
          onOpenChange={(open) =>
            setState((prev) => ({
              ...prev,
              showEvaluationForm: open,
              selectedProjectId: open ? prev.selectedProjectId : null,
              selectedStudentId: open ? prev.selectedStudentId : null,
            }))
          }
          title={t('evaluation.evaluate') || 'Evaluate Student'}
        >
          <EvaluationNew
            projectId={state.selectedProjectId}
            studentId={state.selectedStudentId}
            onSuccess={handleEvaluationSuccess}
          />
        </ModalDialog>
      )}
    </>
  )
}
