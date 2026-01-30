import { useMemo, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DataTable } from '@/components/ui'
import { BlockContent, ModalDialog } from '@/components/common'
import { AlertCircle } from 'lucide-react'
import { evaluationService } from '../api/evaluation.service'
import { projectService } from '../../projects/api/project.service'
import { UnifiedEvaluationModal } from '../../../committee/discussion/evaluation/components/UnifiedEvaluationModal'
import { createSupervisorEvaluationColumns } from '../components/table'
import { useSupervisorEvaluationList } from './EvaluationList.hook'
import type { Grade } from '@/types/evaluation.types'
import type { Project } from '@/types/project.types'

export function EvaluationList() {
  const { projectId: projectIdFromUrl } = useParams<{ projectId?: string }>()
  const { t } = useTranslation()
  const hasAutoOpenedRef = useRef(false)

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
    refetch,
  } = useSupervisorEvaluationList()

  const columns = useMemo(
    () =>
      createSupervisorEvaluationColumns({
        onEvaluate: (item) => {
          setState((prev) => ({
            ...prev,
            selectedProjectId: item.project.id,
            showEvaluationModal: true,
          }))
        },
        t,
      }),
    [t, setState]
  )

  // Auto-open modal when navigating to evaluation/:projectId (e.g. from Projects list)
  useEffect(() => {
    if (projectIdFromUrl && !hasAutoOpenedRef.current) {
      hasAutoOpenedRef.current = true
      setState((prev) => ({
        ...prev,
        selectedProjectId: projectIdFromUrl,
        showEvaluationModal: true,
      }))
    }
    if (!projectIdFromUrl) hasAutoOpenedRef.current = false
  }, [projectIdFromUrl, setState])

  const handleEvaluationSuccess = () => {
    refetch()
    setState((prev) => ({
      ...prev,
      showEvaluationModal: false,
      selectedProjectId: null,
    }))
  }

  const handleFetchProject = async (id: string): Promise<Project | null> => {
    return projectService.getById(id)
  }

  const handleFetchGrades = async (projectId: string): Promise<Grade[]> => {
    return evaluationService.getGrades(projectId)
  }

  const handleSubmitGrade = async (params: {
    projectId: string
    studentId: string
    grade: {
      score: number
      maxScore: number
      criteria: Record<string, unknown>
      comments?: string
    }
  }): Promise<unknown> => {
    return evaluationService.submitGrade(
      params.projectId,
      params.studentId,
      {
        score: params.grade.score,
        maxScore: params.grade.maxScore,
        criteria: (params.grade.criteria || {}) as Record<string, number>,
        comments: params.grade.comments,
      },
      ''
    )
  }

  return (
    <>
      <BlockContent title={t('nav.evaluation')} variant="data-table">
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
            setPagination((prev) => ({ ...prev, pageIndex, pageSize }))
          }}
          sorting={sorting}
          onSortingChange={setSorting}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          searchValue={globalFilter}
          onSearchChange={setGlobalFilter}
          searchPlaceholder={t('supervisor.searchPlaceholder')}
          enableFiltering={true}
          enableViews={true}
          emptyMessage={t('supervisor.noProjects')}
        />
      </BlockContent>

      {data.error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('supervisor.loadError')}</span>
          </div>
        </BlockContent>
      )}

      {state.selectedProjectId && (
        <ModalDialog
          open={state.showEvaluationModal}
          onOpenChange={(open) =>
            setState((prev) => ({
              ...prev,
              showEvaluationModal: open,
              selectedProjectId: open ? prev.selectedProjectId : null,
            }))
          }
          title={t('evaluation.evaluate')}
          size="xl"
        >
          <UnifiedEvaluationModal
            open={state.showEvaluationModal}
            onOpenChange={(open) =>
              setState((prev) => ({
                ...prev,
                showEvaluationModal: open,
                selectedProjectId: open ? prev.selectedProjectId : null,
              }))
            }
            projectId={state.selectedProjectId}
            role="supervisor"
            onSuccess={handleEvaluationSuccess}
            fetchProject={handleFetchProject}
            fetchGrades={handleFetchGrades}
            submitGrade={handleSubmitGrade}
          />
        </ModalDialog>
      )}
    </>
  )
}
