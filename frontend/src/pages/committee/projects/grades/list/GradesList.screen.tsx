import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApproveGrade, usePublishGrades } from '../hooks/useGradeOperations'
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { Card, CardContent, Badge, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui'
import { LoadingSpinner, ConfirmDialog, BlockContent, EmptyState, ActionsDropdown, type TableAction } from '@/components/common'
import { Send, ChevronDown, User, Eye, Edit2, Check, Menu, ChevronUp, FileX } from 'lucide-react'
import type { Grade } from '@/types/evaluation.types'
import { useGradesList } from './GradesList.hook'
import { useToast } from '@/components/common'
import { committeeGradeService } from '../api/grade.service'
import { EditGradeModal } from '../components/EditGradeModal'

export function GradesList() {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()
  const approveGrade = useApproveGrade()
  const publishGrades = usePublishGrades()

  const {
    data,
    state,
    setState,
    setPagination,
    pagination,
    pageCount,
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
      // Refresh list
      // setState... or refetch
      // For now force reload or invalidate query (if we had access to queryClient)
      window.location.reload()
    } catch (err) {
      toastError(err instanceof Error ? err.message : t('committee.grades.actionError'))
    }
  }

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
    <BlockContent title={t('committee.grades.management')}>
      <Tabs value={activeStage} onValueChange={(v) => setActiveStage(v as 'fd1' | 'fd2')}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="fd1">{t('committee.grades.fd1')}</TabsTrigger>
            <TabsTrigger value="fd2">{t('committee.grades.fd2')}</TabsTrigger>
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
                t={t}
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
                t={t}
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
                <p className="font-medium mb-1">Validation Issues:</p>
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
          onSuccess={() => {
            window.location.reload()
          }}
        />
      )}
    </BlockContent>
  )
}

function ProjectGradeCard({ project, grades, onAction, onStageAction, stage, t }: {
  project: Grade['project'],
  grades: Grade[],
  onAction: (grade: Grade, action: 'approve' | 'edit' | 'view') => void,
  onStageAction: (action: 'approve' | 'publish') => void,
  stage: 'fd1' | 'fd2',
  t: (key: string) => string
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg bg-card">
      <div className="flex items-center justify-between p-4 bg-muted/10">
        <div className="flex items-center gap-2 flex-1">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="inline-flex h-8 w-8 items-center justify-center rounded-2xl font-extrabold bg-slate-100 text-slate-700">
              <Menu className="h-4 w-4" />
              {/* #{project?.id} */}
            </Button>
          </CollapsibleTrigger>
          <div>
            <h3 className="font-semibold text-base">{project?.title || 'Unknown Project'}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{project?.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline">{grades.length} {t('committee.grades.student')}</Badge>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); onStageAction('approve'); }}>
              {t('common.approve')} {stage.toUpperCase()}
            </Button>
            <Button size="sm" variant="default" onClick={(e) => { e.stopPropagation(); onStageAction('publish'); }}>
              {t('common.publish')}
            </Button>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-slate-700 ring-1 ring-slate-200 transition group-open:rotate-180">
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[25%] text-right">{t('committee.grades.student')}</TableHead>
              <TableHead className="text-center">{t('committee.grades.supervisorGrade')}</TableHead>
              <TableHead className="text-center">{t('committee.grades.committeeGrade')}</TableHead>
              <TableHead className="text-center">{t('committee.grades.finalGrade')}</TableHead>
              <TableHead className="text-center">{t('common.status')}</TableHead>
              <TableHead className="text-center">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grades.map(grade => (
              <StudentGradeRow key={grade.id} grade={grade} onAction={onAction} stage={stage} t={t} />
            ))}
          </TableBody>
        </Table>
      </CollapsibleContent>
    </Collapsible>
  )
}

function StudentGradeRow({ grade, onAction, stage, t }: {
  grade: Grade,
  onAction: (grade: Grade, action: 'approve' | 'edit' | 'view') => void,
  stage: 'fd1' | 'fd2',
  t: (key: string) => string
}) {
  // Use stage specific grades if available
  let supervisorScore, committeeScore, finalGrade

  if (stage === 'fd1') {
    // Fallback to legacy fields if FD1 specific fields are null (migration support)
    // The legacy fields (supervisorScore/committeeScore) are computed from supervisor_grade/committee_grade JSON columns
    supervisorScore = grade.fd1SupervisorScore ?? grade.supervisorScore ?? grade.supervisorGrade?.score
    committeeScore = grade.fd1CommitteeScore ?? grade.committeeScore ?? grade.committeeGrade?.score
    finalGrade = grade.fd1FinalGrade ?? grade.finalGrade
  } else if (stage === 'fd2') {
    supervisorScore = grade.fd2SupervisorScore
    committeeScore = grade.fd2CommitteeScore
    finalGrade = grade.fd2FinalGrade
  } else {
    supervisorScore = grade.supervisorScore ?? grade.supervisorGrade?.score
    committeeScore = grade.committeeScore ?? grade.committeeGrade?.score
    finalGrade = grade.finalGrade
  }

  // Fallback to legacy finalGrade if stage specific is missing (during migration)
  const displayFinal = finalGrade // ?? grade.finalGrade

  const actions: TableAction<Grade>[] = [
    {
      id: 'view',
      label: t('common.view'),
      icon: Eye,
      onClick: (row) => onAction(row, 'view'),
    },
    {
      id: 'edit',
      label: t('common.edit'),
      icon: Edit2,
      onClick: (row) => onAction(row, 'edit'),
      hidden: (row) => !!row.isApproved,
    },
    {
      id: 'approve',
      label: t('common.approve'),
      icon: Check,
      onClick: (row) => onAction(row, 'approve'),
      hidden: (row) => !!row.isApproved,
      disabled: (row) => !row.isReadyForApproval,
      variant: 'success',
    }
  ]

  return (
    <TableRow className="hover:bg-muted/5">
      <TableCell className="text-start">
        <div className="flex items-center justify-start gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-medium text-sm">{grade.student?.name}</span>
            <span className="text-xs text-muted-foreground">{grade.student?.department}</span>
          </div>
        </div>
      </TableCell>

      <TableCell className="text-center font-medium">
        {supervisorScore != null ? Number(supervisorScore).toFixed(2) : '-'}
      </TableCell>

      <TableCell className="text-center font-medium">
        {committeeScore != null ? Number(committeeScore).toFixed(2) : '-'}
      </TableCell>

      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-1 font-bold">
          {displayFinal != null ? (
            <>
              <span>{Number(displayFinal).toFixed(2)}</span>
            </>
          ) : '-'}
        </div>
      </TableCell>

      <TableCell className="text-center">
        {grade.isApproved ? (
          <Badge variant="outline" className="gap-1 border-green-600 text-green-600 bg-green-50">
            {t('committee.grades.approved')}
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            {t('committee.grades.pending')}
          </Badge>
        )}
      </TableCell>

      <TableCell className="text-center">
        <div className="flex items-center justify-center">
          <ActionsDropdown row={grade} actions={actions} />
        </div>
      </TableCell>
    </TableRow>
  )
}
