import { useTranslation } from 'react-i18next'
import { useAssignSupervisor } from '../hooks/useSupervisorOperations'
import { Card, CardContent, Button, Badge } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner, EmptyState, ModalDialog } from '@/components/common'
import { toast } from 'sonner'
import { Briefcase, UserCheck, Loader2, AlertCircle } from 'lucide-react'
import { useSupervisorsList } from './SupervisorsList.hook'

export function SupervisorsList() {
  const { t } = useTranslation()
  const assignSupervisor = useAssignSupervisor()

  const {
    data,
    state,
    setState,
    pagination
  } = useSupervisorsList()

  const handleAssign = async () => {
    if (!state.selectedProject || !state.selectedSupervisor) {
      toast.warning(t('committee.supervisors.selectSupervisor'))
      return
    }

    try {
      await assignSupervisor.mutateAsync({
        projectId: state.selectedProject.id,
        supervisorId: state.selectedSupervisor,
      })
      toast.success(t('committee.supervisors.assignmentSuccess'))
      setState((prev) => ({ ...prev, selectedProject: null, selectedSupervisor: '' }))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('committee.supervisors.assignmentError'))
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
                  className="shrink-0 md:w-auto w-full shadow-sm hover:translate-y-[-1px] transition-all"
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

      <ModalDialog
        open={!!state.selectedProject}
        onOpenChange={handleCloseModal}
        title={t('committee.supervisors.assignSupervisor')}
        className="sm:max-w-[500px]"
      >
        <div className="space-y-6 pt-4">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('project.title')}</h4>
            <p className="text-sm font-semibold text-foreground leading-relaxed">
              {state.selectedProject?.title}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium leading-none flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              {t('committee.supervisors.selectSupervisor')}
            </h4>
            <Select
              value={state.selectedSupervisor}
              onValueChange={(value) => setState(prev => ({ ...prev, selectedSupervisor: value }))}
            >
              <SelectTrigger className="w-full h-11 bg-background">
                <SelectValue placeholder={t('committee.supervisors.selectSupervisorPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {data.supervisors.map((supervisor) => (
                  <SelectItem key={supervisor.id} value={supervisor.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {supervisor.name.charAt(0)}
                      </div>
                      <span className="font-medium">{supervisor.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button variant="ghost" onClick={() => handleCloseModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!state.selectedSupervisor || assignSupervisor.isPending}
            >
              {assignSupervisor.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.confirm')}
            </Button>
          </div>
        </div>
      </ModalDialog>
    </div>
  )
}
