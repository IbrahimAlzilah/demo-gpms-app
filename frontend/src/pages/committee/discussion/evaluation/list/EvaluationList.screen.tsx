import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BlockContent, ModalDialog } from '@/components/common'
import { Card, CardContent, Tabs, TabsContent, TabsList, TabsTrigger, Badge, Button } from '@/components/ui'
import { AlertCircle, Award, TrendingUp, Users, FileText, GraduationCap, Lock, CheckCircle2, ClipboardCheck, Info } from 'lucide-react'
import { useEvaluationList } from './EvaluationList.hook'
import { LoadingSpinner } from '@/components/common'
import { UnifiedEvaluationModal } from '../components/UnifiedEvaluationModal'

export function EvaluationList() {
  const { t } = useTranslation()
  const {
    state,
    setState,
    projects,
    isLoading,
    error,
    refetch,
  } = useEvaluationList()

  // Calculate statistics for current stage
  const stats = useMemo(() => {
    const total = projects.length
    const myProgress = projects.reduce((acc, p) => {
      const progress = (p as any).myProgress || {}
      return {
        evaluated: acc.evaluated + (progress.evaluatedCount || 0),
        total: acc.total + (progress.totalStudents || 0),
      }
    }, { evaluated: 0, total: 0 })

    return {
      totalProjects: total,
      totalStudents: myProgress.total,
      evaluatedStudents: myProgress.evaluated,
      pendingStudents: myProgress.total - myProgress.evaluated,
      progressPercentage: myProgress.total > 0
        ? Math.round((myProgress.evaluated / myProgress.total) * 100)
        : 0,
    }
  }, [projects])

  const handleStageChange = (stage: 'fd1' | 'fd2') => {
    setState((prev) => ({ ...prev, defenseStage: stage }))
  }

  const handleEvaluateProject = (projectId: string) => {
    setState((prev) => ({
      ...prev,
      selectedProjectId: projectId,
      showEvaluationForm: true,
    }))
  }

  return (
    <>
      <BlockContent title={t('nav.evaluations')} variant="data-table">
        {/* Info Banner */}
        <Card className="mb-6 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {t('evaluation.committeeInfo.title')}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {t('evaluation.committeeInfo.description')}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  <strong>{t('evaluation.committeeInfo.formula')}</strong>{' '}
                  {t('evaluation.committeeInfo.formulaDescription')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Defense Stage Tabs */}
        <Tabs
          value={state.defenseStage}
          onValueChange={(value) => handleStageChange(value as 'fd1' | 'fd2')}
          className="w-full px-4"
        >
          <TabsList className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-muted p-1 text-muted-foreground">
            <TabsTrigger value="fd1" className="gap-2">
              {t('evaluation.fd1') || 'Final Defense 1'}
            </TabsTrigger>
            <TabsTrigger value="fd2" className="gap-2">
              {t('evaluation.fd2') || 'Final Defense 2'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={state.defenseStage} className="space-y-6">
            {/* Statistics Cards */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 border-border/60 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('evaluation.totalProjects')}
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stats.totalProjects}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-border/60 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('evaluation.totalStudents')}
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stats.totalStudents}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-border/60 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('evaluation.evaluated')}
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stats.evaluatedStudents}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-border/60 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('evaluation.pending')}
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stats.pendingStudents}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </Card>
            </div> */}

            {/* Progress Overview */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    {t('evaluation.myProgress')}
                  </h3>
                  <Badge variant="secondary" className="font-mono">
                    {stats.progressPercentage}%
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 rounded-full"
                    style={{ width: `${stats.progressPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.evaluatedStudents} {t('common.of')} {stats.totalStudents} {t('common.students')} {t('common.evaluated')}
                </p>
              </CardContent>
            </Card>

            {/* Projects List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <Card className="border-destructive/50 bg-destructive/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">{t('evaluation.loadError') || 'Failed to load projects'}</span>
                  </div>
                  <p className="text-sm text-destructive/80 mt-1 ml-7">
                    {error.message || 'Please try again later'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    className="mt-4 ml-7"
                  >
                    {t('common.retry')}
                  </Button>
                </CardContent>
              </Card>
            ) : projects.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {t('evaluation.noProjects')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {projects.map((project: any) => {
                  const myProgress = project.myProgress || {}
                  const overallStatus = project.overallStatus || {}
                  const isLocked = overallStatus.isLocked || false
                  const isComplete = myProgress.evaluatedCount === myProgress.totalStudents
                  const progressPercent = myProgress.percentage || 0

                  return (
                    <Card
                      key={project.project.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg truncate">
                                {project.project.title}
                              </h3>
                              {isLocked && (
                                <Badge variant="secondary" className="gap-1.5 shrink-0">
                                  <Lock className="h-3 w-3" />
                                  {t('common.locked')}
                                </Badge>
                              )}
                              {isComplete && !isLocked && (
                                <Badge className="gap-1.5 bg-green-500 hover:bg-green-600 shrink-0">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {t('common.completed')}
                                </Badge>
                              )}
                            </div>

                            {project.project.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {project.project.description}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              {project.project.supervisor && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Award className="h-4 w-4" />
                                  <span>{project.project.supervisor.name}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>{myProgress.totalStudents || 0} {t('common.students')}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <ClipboardCheck className="h-4 w-4 text-primary" />
                                <span className="font-medium">
                                  {myProgress.evaluatedCount || 0} / {myProgress.totalStudents || 0} {t('common.evaluated')}
                                </span>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-3">
                              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 rounded-full ${isComplete
                                    ? 'bg-green-500'
                                    : 'bg-gradient-to-r from-primary to-primary/80'
                                    }`}
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 shrink-0">
                            <Button
                              onClick={() => handleEvaluateProject(project.project.id)}
                              variant={isLocked ? "outline" : isComplete ? "outline" : "default"}
                              size="sm"
                              className="gap-2"
                            >
                              {isLocked ? (
                                <>
                                  <Lock className="h-4 w-4" />
                                  {t('common.view')}
                                </>
                              ) : isComplete ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4" />
                                  {t('common.review')}
                                </>
                              ) : (
                                <>
                                  <ClipboardCheck className="h-4 w-4" />
                                  {t('common.evaluate')}
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </BlockContent>

      {/* Evaluation Modal */}
      {state.selectedProjectId && (
        <ModalDialog
          open={state.showEvaluationForm}
          onOpenChange={(open) => {
            setState((prev) => ({
              ...prev,
              showEvaluationForm: open,
              selectedProjectId: open ? prev.selectedProjectId : null,
            }))
            if (!open) refetch()
          }}
          title={`${t('evaluation.evaluate')} - ${state.defenseStage.toUpperCase()}`}
          size="xl"
        >
          <UnifiedEvaluationModal
            open={state.showEvaluationForm}
            onOpenChange={(open) => {
              setState((prev) => ({
                ...prev,
                showEvaluationForm: open,
                selectedProjectId: open ? prev.selectedProjectId : null,
              }))
              if (!open) refetch()
            }}
            projectId={state.selectedProjectId}
            role="discussion_committee"
            defenseStage={state.defenseStage}
          />
        </ModalDialog>
      )}
    </>
  )
}
