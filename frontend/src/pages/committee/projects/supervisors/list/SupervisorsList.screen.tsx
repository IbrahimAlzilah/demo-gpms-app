import { useTranslation } from 'react-i18next'
import { useAssignSupervisor } from '../hooks/useSupervisorOperations'
import { Card, CardContent, Button, Badge } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner, EmptyState, ModalDialog } from '@/components/common'
import { toast } from 'sonner'
import { Briefcase, UserCheck, User, Loader2 } from 'lucide-react'
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
    return <LoadingSpinner />
  }

  if (!data.isLoading && data.projects.length === 0) {
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
      <div className="flex items-center justify-between bg-orange-50/50 p-4 rounded-lg border border-orange-100">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          {t('committee.supervisors.projectsWithoutSupervisor')}
        </h3>
        <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none px-3 py-1">
          {pagination.totalProjects} {t('project.label')}
        </Badge>
      </div>

      <div className="grid gap-4">
        {data.projects.map((project) => (
          <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow border-muted p-0">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <h4 className="text-xl font-bold text-gray-900 leading-tight">
                    {project.title}
                  </h4>
                  <p className="text-sm text-gray-500 line-clamp-2 max-w-3xl">
                    {project.description}
                  </p>
                  {project.specialization && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 pt-1">
                      <span className="font-medium text-gray-700">{t('project.specialization')}:</span>
                      {project.specialization}
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => setState(prev => ({ ...prev, selectedProject: project, selectedSupervisor: '' }))}
                  className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm shrink-0 md:w-auto w-full"
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
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => pagination.fetchNextPage()}
            disabled={pagination.isFetchingNextPage}
            className="w-full md:w-auto"
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
          <div className="grid gap-2">
            <h4 className="text-sm font-medium text-muted-foreground">{t('project.title')}</h4>
            <div className="p-3 bg-muted/40 rounded-md border text-sm font-medium">
              {state.selectedProject?.title}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t('committee.supervisors.selectSupervisor')}
            </h4>
            <Select
              value={state.selectedSupervisor}
              onValueChange={(value) => setState(prev => ({ ...prev, selectedSupervisor: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('committee.supervisors.selectSupervisorPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {data.supervisors.map((supervisor) => (
                  <SelectItem key={supervisor.id} value={supervisor.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{supervisor.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => handleCloseModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!state.selectedSupervisor || assignSupervisor.isPending}
              className="bg-primary hover:bg-primary/90"
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
