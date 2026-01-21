import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAssignSupervisor } from '../hooks/useSupervisorOperations'
import { Card, CardContent, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { LoadingSpinner, EmptyState } from '@/components/common'
import { useToast } from '@/components/common'
import { Briefcase, UserCheck, Loader2, AlertCircle, ListChecks } from 'lucide-react'
import { useSupervisorsList } from './SupervisorsList.hook'
import { SupervisorAssignmentDialog } from '../components/SupervisorAssignmentDialog'
import { AssignmentRequestsList } from '../components/AssignmentRequestsList'
import { supervisorAssignmentService } from '../api/supervisor.service'

export function SupervisorsList() {
  const { t } = useTranslation()
  const { success, error } = useToast()
  const assignSupervisor = useAssignSupervisor()
  const [tab, setTab] = useState<'projects' | 'requests'>('projects')

  const {
    data,
    state,
    setState,
    pagination
  } = useSupervisorsList()

  const handleAssign = async (
    projectId: string,
    supervisorId: string,
    requiresApproval: boolean,
    notes?: string
  ) => {
    try {
      if (requiresApproval) {
        // Send request for approval
        await supervisorAssignmentService.requestAssignment(projectId, supervisorId, notes)
        success('supervisor.requestSent')
      } else {
        // Direct assignment
        await assignSupervisor.mutateAsync({
          projectId,
          supervisorId,
        })
        success('committee.supervisors.assignmentSuccess')
      }
      setState((prev) => ({ ...prev, selectedProject: null, selectedSupervisor: '' }))
    } catch (err) {
      error(err instanceof Error ? err.message : 'committee.supervisors.assignmentError')
    }
  }

  const handleCloseModal = (open: boolean) => {
    if (!open) {
      setState(prev => ({ ...prev, selectedProject: null, selectedSupervisor: '' }))
    }
  }

  if (data.isLoading && data.projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (!data.isLoading && data.projects.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title={t('committee.supervisors.noProjects')}
        description={t('committee.supervisors.noProjectsDescription')}
        className="animate-in fade-in zoom-in-50 duration-500"
      />
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <AlertCircle className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-lg tracking-tight text-foreground">
            {t('committee.supervisors.projectsWithoutSupervisor')}
          </h3>
        </div>
        <Badge variant="secondary" className="w-fit px-3 py-1 text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80">
          {pagination.totalProjects} {t('project.label')}
        </Badge>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'projects' | 'requests')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="projects">
            <Briefcase className="w-4 h-4 mr-2" />
            {t('supervisor.projectsNeedingSupervisor', { defaultValue: 'Projects' })}
          </TabsTrigger>
          <TabsTrigger value="requests">
            <ListChecks className="w-4 h-4 mr-2" />
            {t('supervisor.assignmentRequests', { defaultValue: 'Requests' })}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="projects" className="space-y-4 mt-6">
          <div className="grid gap-4">
            {data.projects.map((project) => (
              <Card key={project.id} className="group overflow-hidden border-border bg-card/50 hover:bg-card hover:shadow-md hover:border-primary/20 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-3 flex-1">
                      <div>
                        <h4 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                          {project.title}
                        </h4>
                        {project.specialization && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5">
                            <Badge variant="outline" className="text-xs font-normal bg-background/50">
                              {project.specialization}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 max-w-3xl leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <Button
                      onClick={() => setState(prev => ({ ...prev, selectedProject: project, selectedSupervisor: '' }))}
                      className="shrink-0 md:w-auto w-full shadow-sm hover:-translate-y-px transition-all"
                    >
                      <UserCheck className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                      {t('committee.supervisors.assignSupervisor')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination.hasNextPage && (
            <div className="flex justify-center pt-8">
              <Button
                variant="outline"
                onClick={() => pagination.fetchNextPage()}
                disabled={pagination.isFetchingNextPage}
                className="w-full md:w-auto min-w-[150px]"
              >
                {pagination.isFetchingNextPage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  t('common.loadMore')
                )}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <AssignmentRequestsList />
        </TabsContent>
      </Tabs>

      <SupervisorAssignmentDialog
        open={!!state.selectedProject}
        onOpenChange={handleCloseModal}
        project={state.selectedProject}
        supervisors={data.supervisors}
        onAssign={handleAssign}
        loading={assignSupervisor.isPending}
      />
    </div>
  )
}
