import { useMemo, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DataTable, Card, CardContent } from '@/components/ui'
import { BlockContent, ModalDialog } from '@/components/common'
import { AlertCircle, ShieldCheck } from 'lucide-react'
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
        onEvaluate: (item, stage) => {
          setState((prev) => ({
            ...prev,
            selectedProjectId: item.project.id,
            selectedStage: stage,
            showEvaluationModal: true,
          }))
        },
        t,
      }),
    [t, setState]
  )

  // Auto-open modal when navigating to evaluation/:projectId (e.g. from Projects list) with default FD1
  useEffect(() => {
    if (projectIdFromUrl && !hasAutoOpenedRef.current) {
      hasAutoOpenedRef.current = true
      setState((prev) => ({
        ...prev,
        selectedProjectId: projectIdFromUrl,
        selectedStage: 'fd1',
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
      selectedStage: null,
    }))
  }

  const handleFetchProject = async (id: string): Promise<Project | null> => {
    return projectService.getById(id)
  }

  const selectedStage = state.selectedStage ?? 'fd1'

  const handleFetchGrades = async (projectId: string): Promise<Grade[]> => {
    return evaluationService.getDefenseEvaluations(projectId, selectedStage)
  }

  const handleSubmitGrade = async (params: {
    projectId: string
    studentId: string
    defenseStage?: 'fd1' | 'fd2'
    grade: {
      score: number
      maxScore: number
      criteria: Record<string, unknown>
      comments?: string
    }
  }): Promise<unknown> => {
    const stage = params.defenseStage ?? selectedStage
    return evaluationService.submitDefenseEvaluation({
      projectId: params.projectId,
      studentId: params.studentId,
      defenseStage: stage,
      grade: {
        score: params.grade.score,
        maxScore: params.grade.maxScore,
        criteria: params.grade.criteria ?? {},
        comments: params.grade.comments,
      },
    })
  }

  const handleGetLocked = state.selectedProjectId && state.selectedStage
    ? (projectId: string) => evaluationService.isDefenseLocked(projectId, state.selectedStage!)
    : undefined

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

      {state.selectedProjectId && state.selectedStage && (
        <ModalDialog
          open={state.showEvaluationModal}
          onOpenChange={(open) =>
            setState((prev) => ({
              ...prev,
              showEvaluationModal: open,
              selectedProjectId: open ? prev.selectedProjectId : null,
              selectedStage: open ? prev.selectedStage : null,
            }))
          }
          title={`${t('evaluation.evaluate')} – ${state.selectedStage === 'fd1' ? t('evaluation.fd1') : t('evaluation.fd2')}`}
          className="lg:max-w-3xl"
        >
          <UnifiedEvaluationModal
            open={state.showEvaluationModal}
            onOpenChange={(open) =>
              setState((prev) => ({
                ...prev,
                showEvaluationModal: open,
                selectedProjectId: open ? prev.selectedProjectId : null,
                selectedStage: open ? prev.selectedStage : null,
              }))
            }
            projectId={state.selectedProjectId}
            role="supervisor"
            defenseStage={state.selectedStage}
            onSuccess={handleEvaluationSuccess}
            fetchProject={handleFetchProject}
            fetchGrades={handleFetchGrades}
            submitGrade={handleSubmitGrade}
            getLocked={handleGetLocked}
          />
        </ModalDialog>
      )}
    </>
  )
}
