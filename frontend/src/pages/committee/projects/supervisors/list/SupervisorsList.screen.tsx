import { useTranslation } from 'react-i18next'
import { useAssignSupervisor } from '../hooks/useSupervisorOperations'
import { Card, CardContent, Button } from '@/components/ui'
import { LoadingSpinner, EmptyState, useToast } from '@/components/common'
import { Briefcase, UserCheck, User, Loader2, CheckCircle2 } from 'lucide-react'
import { useSupervisorsList } from './SupervisorsList.hook'

export function SupervisorsList() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const assignSupervisor = useAssignSupervisor()
  
  const {
    data,
    state,
    setState,
  } = useSupervisorsList()

  const handleAssign = async () => {
    if (!state.selectedProject || !state.selectedSupervisor) {
      showToast(t('committee.supervisors.selectBoth'), 'warning')
      return
    }

    try {
      await assignSupervisor.mutateAsync({
        projectId: state.selectedProject.id,
        supervisorId: state.selectedSupervisor,
      })
      showToast(t('committee.supervisors.assignmentSuccess'), 'success')
      setState((prev) => ({ ...prev, selectedProject: null, selectedSupervisor: '' }))
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t('committee.supervisors.assignmentError'),
        'error'
      )
    }
  }

  if (data.isLoading) {
    return <LoadingSpinner />
  }

  if (!data.projects || data.projects.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title={t('committee.supervisors.noProjects')}
        description={t('committee.supervisors.noProjectsDescription')}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            {t('committee.supervisors.projectsWithoutSupervisor')}
          </h3>
          <div className="space-y-3">
            {data.projects.map((project) => (
              <Card
                key={project.id}
                className={`cursor-pointer transition-all ${
                  state.selectedProject?.id === project.id
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'hover:bg-muted hover:shadow-sm'
                }`}
                onClick={() => {
                  setState((prev) => ({ ...prev, selectedProject: project, selectedSupervisor: '' }))
                }}
              >
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-1">{project.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            {t('committee.supervisors.availableSupervisors')}
          </h3>
          {state.selectedProject ? (
            <div className="space-y-4">
              <Card className="bg-muted">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    {t('committee.supervisors.selectedProject')}
                  </p>
                  <p className="font-medium">{state.selectedProject.title}</p>
                </CardContent>
              </Card>

              <div className="space-y-2">
                {data.supervisors.map((supervisor) => (
                  <Card
                    key={supervisor.id}
                    className={`cursor-pointer transition-all ${
                      state.selectedSupervisor === supervisor.id
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'hover:bg-muted hover:shadow-sm'
                    }`}
                    onClick={() => {
                      setState((prev) => ({ ...prev, selectedSupervisor: supervisor.id }))
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{supervisor.name}</p>
                        </div>
                        {state.selectedSupervisor === supervisor.id && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                onClick={handleAssign}
                disabled={!state.selectedSupervisor || assignSupervisor.isPending}
                className="w-full"
              >
                {assignSupervisor.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.assigning')}
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    {t('committee.supervisors.assignSupervisor')}
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  {t('committee.supervisors.selectProjectFirst')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
