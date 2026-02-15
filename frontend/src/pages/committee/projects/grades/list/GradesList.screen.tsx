import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useApproveGrade, usePublishGrades } from '../hooks/useGradeOperations'
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { Card, CardContent } from '@/components/ui'
import { LoadingSpinner, ConfirmDialog, BlockContent, EmptyState } from '@/components/common'
import { Send, FileX, GraduationCap } from 'lucide-react'
import type { Grade } from '@/types/evaluation.types'
import { useGradesList } from './GradesList.hook'
import { useToast } from '@/components/common'
import { committeeGradeService } from '../api/grade.service'
import { EditGradeModal } from '../components/EditGradeModal'
import { ProjectGradeCard } from './ProjectGradeCard'

export function GradesList() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { toastSuccess, toastError } = useToast()
  const approveGrade = useApproveGrade()
  const publishGrades = usePublishGrades()

  const refetchGrades = () => {
    queryClient.invalidateQueries({ queryKey: ['committee-grades-table'] })
  }

  const {
    data,
    state,
    setState,
    setPagination,
    pagination,
    pageCount,
    refetch,
  } = useGradesList()

  const [activeStage, setActiveStage] = useState<'fd1' | 'fd2'>('fd1')
  // Group grades by project
  const groupedGrades = useMemo(() => {
    if (!data?.grades) return {}

    return data.grades.reduce((acc, grade) => {
      const projectId = grade.projectId
      if (!acc[projectId]) {
        acc[projectId] = {
          project: grade.project,
          grades: []
        }
      }
      acc[projectId].grades.push(grade)
      return acc
    }, {} as Record<string, { project: Grade['project'], grades: Grade[] }>)
  }, [data?.grades])

  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({})

  const handleExpandAll = () => {
    const allExpanded = Object.keys(groupedGrades).reduce((acc, id) => {
      acc[id] = true
      return acc
    }, {} as Record<string, boolean>)
    setExpandedProjects(allExpanded)
  }

  const handleCollapseAll = () => {
    setExpandedProjects({})
  }

  const handleApprove = async () => {
    if (!state.selectedGrade) return

    // Check validation before approving
    if (state.selectedGrade.validationErrors && state.selectedGrade.validationErrors.length > 0) {
      toastError(state.selectedGrade.validationErrors.join(', '))
      setState((prev) => ({ ...prev, showDialog: false, selectedGrade: null, action: null }))
      return
    }

    try {
      await approveGrade.mutateAsync({
        gradeId: state.selectedGrade.id,
      })
      toastSuccess(t('committee.grades.approveSuccess'))
      setState((prev) => ({
        ...prev,
        showDialog: false,
        selectedGrade: null,
        action: null,
      }))
    } catch (err) {
      toastError(err instanceof Error ? err.message : t('committee.grades.approveError'))
    }
  }

  const handleActionClick = (grade: Grade, actionType: 'approve' | 'edit' | 'view') => {
    setState((prev) => ({
      ...prev,
      selectedGrade: grade,
      action: actionType,
      showDialog: true,
    }))
  }

  const handlePublishToStudents = async () => {
    try {
      // Logic for publishing specific stage
      // This assumes we want to publish ALL approved projects for the current stage
      // But usually publishing is per project or batch. 
      // Existing code publishes by grade IDs.
      // New requirement is "Publish Defense Results".
      // Let's implement per-project publish in ProjectGradeCard, or batch here.
      // For now, let's keep the existing batch publish as a general "Publish pending grades" 
      // or update it to use publishDefenseResults if we want batch stage publishing.

      // We will focus on ProjectGradeCard actions first.

      // Legacy batch publish (maybe keep for now or comment out if unused)
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

  const handleStageAction = async (projectId: string, action: 'approve' | 'publish') => {
    try {
      if (action === 'approve') {
        await committeeGradeService.approveDefenseStage(projectId, activeStage)
        toastSuccess(t('committee.grades.approveSuccess'))
      } else {
        await committeeGradeService.publishDefenseResults(projectId, activeStage)
        toastSuccess(t('committee.grades.publishSuccess'))
      }
      await queryClient.refetchQueries({ queryKey: ['committee-grades-table'] })
    } catch (err: any) {

      // Check for validation errors (422)
      if (err.response?.status === 422) {
        const errors = err.response?.data?.errors
        const message = err.response?.data?.message

        if (errors) {
          // Format errors for display
          const errorMessage = Array.isArray(errors)
            ? errors.join('\n')
            : typeof errors === 'object'
              ? Object.values(errors).flat().join('\n')
              : String(errors)
          toastError(`${t('committee.grades.validationError') || 'Validation Error'}:\n${errorMessage}`)
        } else if (message) {
          toastError(message)
        } else {
          toastError(t('committee.grades.validationError') || 'Validation failed')
        }
      } else if (err.response?.status === 400) {
        const message = err.response?.data?.message || err.message
        toastError(message || t('committee.grades.actionError'))
      } else if (err.response?.status === 403) {
        toastError(t('common.unauthorized') || 'You do not have permission to perform this action')
      } else {
        const message = err.response?.data?.message || err.message
        toastError(message || t('committee.grades.actionError') || 'An error occurred')
      }
    }
  }

  if (data.isLoading) {
    return (
      <BlockContent title={t('committee.grades.management')}>
        <Card>
          <CardContent className="pt-6">
            <LoadingSpinner />
          </CardContent>
        </Card>
      </BlockContent>
    )
  }

  if (data.error) {
    return (
      <BlockContent title={t('committee.grades.management')}>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm font-medium text-destructive">
                {t('committee.grades.loadError') || t('common.error')}
              </p>
              <p className="text-sm text-muted-foreground">
                {data.error?.message ?? t('committee.grades.loadError')}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
              >
                {t('common.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </BlockContent>
    )
  }

  return (
    <BlockContent
      title={t('committee.grades.management')}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExpandAll}>{t('common.expandAll')}</Button>
          <Button variant="outline" size="sm" onClick={handleCollapseAll}>{t('common.collapseAll')}</Button>
        </div>
      }
    >
      <Tabs value={activeStage} onValueChange={(v) => setActiveStage(v as 'fd1' | 'fd2')}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="fd1" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              {t('evaluation.fd1') || t('committee.grades.fd1')}
            </TabsTrigger>
            <TabsTrigger value="fd2" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              {t('evaluation.fd2') || t('committee.grades.fd2')}
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
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
                <SelectItem value="pending">{t('committee.grades.pending')}</SelectItem>
                <SelectItem value="approved">{t('committee.grades.approved')}</SelectItem>
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
          </div>
        </div>

        <TabsContent value="fd1" className="space-y-4">
          {Object.entries(groupedGrades).length === 0 ? (
            <EmptyState
              icon={FileX}
              title={t('committee.grades.noGrades')}
              description={t('committee.grades.noGradesDescription')}
            />
          ) : (
            Object.entries(groupedGrades).map(([projectId, group]) => (
              <ProjectGradeCard
                key={projectId}
                project={group.project}
                grades={group.grades}
                onAction={handleActionClick}
                onStageAction={(action) => handleStageAction(projectId, action)}
                stage="fd1"
                isOpen={!!expandedProjects[projectId]}
                onToggle={(open) => setExpandedProjects(prev => ({ ...prev, [projectId]: open }))}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="fd2" className="space-y-4">
          {Object.entries(groupedGrades).length === 0 ? (
            <EmptyState
              icon={FileX}
              title={t('committee.grades.noGrades')}
              description={t('committee.grades.noGradesDescription')}
            />
          ) : (
            Object.entries(groupedGrades).map(([projectId, group]) => (
              <ProjectGradeCard
                key={projectId}
                project={group.project}
                grades={group.grades}
                onAction={handleActionClick}
                onStageAction={(action) => handleStageAction(projectId, action)}
                stage="fd2"
                isOpen={!!expandedProjects[projectId]}
                onToggle={(open) => setExpandedProjects(prev => ({ ...prev, [projectId]: open }))}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Pagination controls */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
          disabled={pagination.pageIndex <= 0}
        >
          {t('common.previous')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
          disabled={pagination.pageIndex + 1 >= pageCount}
        >
          {t('common.next')}
        </Button>
      </div>

      <ConfirmDialog
        open={state.showDialog && state.action === 'approve'}
        onOpenChange={(open) => setState((prev) => ({ ...prev, showDialog: open }))}
        title={t('committee.grades.approveTitle')}
        description={t('committee.grades.approveDescription')}
        confirmLabel={t('committee.grades.approveGrade')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleApprove}
        variant="default"
      >
        {state.selectedGrade && (
          <div className="space-y-4 mt-4">
            {state.selectedGrade.validationErrors && state.selectedGrade.validationErrors.length > 0 && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                <p className="font-medium mb-1">{t('committee.grades.validationIssues')}:</p>
                <ul className="list-disc list-inside">
                  {state.selectedGrade.validationErrors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <p className="text-sm font-medium mb-2">{t('committee.grades.student')}</p>
              <p className="text-sm">{state.selectedGrade.student?.name || state.selectedGrade.studentId}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">{t('committee.grades.project')}</p>
              <p className="text-sm">{state.selectedGrade.project?.title || state.selectedGrade.projectId}</p>
            </div>
            {(() => {
              const score = state.selectedGrade.supervisorScore ?? state.selectedGrade.supervisorGrade?.score ?? state.selectedGrade.displaySupervisorGrade?.score
              const max = state.selectedGrade.supervisorGrade?.maxScore ?? state.selectedGrade.displaySupervisorGrade?.maxScore ?? 100
              if (score == null) return null
              return (
                <div>
                  <p className="text-sm font-medium mb-2">{t('committee.grades.supervisorGrade')}</p>
                  <p className="text-sm">{Number(score).toFixed(2)} / {max}</p>
                </div>
              )
            })()}
            {(() => {
              const score = state.selectedGrade.committeeScore ?? state.selectedGrade.committeeGrade?.score ?? state.selectedGrade.displayCommitteeGrade?.score
              const max = state.selectedGrade.committeeGrade?.maxScore ?? state.selectedGrade.displayCommitteeGrade?.maxScore ?? 100
              if (score == null) return null
              return (
                <div>
                  <p className="text-sm font-medium mb-2">{t('committee.grades.committeeGrade')}</p>
                  <p className="text-sm">{Number(score).toFixed(2)} / {max}</p>
                </div>
              )
            })()}
            {state.selectedGrade.finalGrade && (
              <div>
                <p className="text-sm font-medium mb-2">{t('committee.grades.finalGrade')}</p>
                <p className="text-sm font-bold">{state.selectedGrade.finalGrade.toFixed(2)}</p>
              </div>
            )}
          </div>
        )}
      </ConfirmDialog>

      {state.showDialog && (state.action === 'edit' || state.action === 'view') && (
        <EditGradeModal
          open={state.showDialog}
          onOpenChange={(open) => setState((prev) => ({ ...prev, showDialog: open }))}
          grade={state.selectedGrade}
          mode={state.action === 'view' ? 'view' : 'edit'}
          stage={activeStage}
          onSuccess={refetchGrades}
          onApprove={() => {
            setState((prev) => ({ ...prev, action: 'approve' }))
          }}
        />
      )}
    </BlockContent>
  )
}


