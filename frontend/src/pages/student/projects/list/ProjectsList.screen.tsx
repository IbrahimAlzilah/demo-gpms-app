import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, Button } from '@/components/ui'
import { BlockContent, LoadingSpinner, ModalDialog } from '@/components/common'
import { Calendar, ArrowRight } from 'lucide-react'
import { ProjectBrowser } from '../components/ProjectBrowser'
import { ProjectsView } from '../view/ProjectsView.screen'
import { ProjectsRegister } from '../register/ProjectsRegister.screen'
import { useProjectsList } from './ProjectsList.hook'

export function ProjectsList() {
  const { t } = useTranslation()
  const {
    data,
    state,
    setState,
    isPeriodActive,
    periodLoading,
    pageCount,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
  } = useProjectsList()

  const handleSelectProject = (project: any) => {
    setState((prev) => ({
      ...prev,
      selectedProject: project,
      showDetails: true,
    }))
  }

  const handleRegisterClick = () => {
    if (state.selectedProject) {
      setState((prev) => ({
        ...prev,
        showDetails: false,
        showRegistrationForm: true,
      }))
    }
  }

  const handleRegistrationSuccess = () => {
    setState((prev) => ({
      ...prev,
      selectedProject: null,
      showRegistrationForm: false,
    }))
  }

  const handleRegistrationCancel = () => {
    setState((prev) => ({
      ...prev,
      showRegistrationForm: false,
    }))
  }

  // If registration form is shown, render it as full page
  if (state.selectedProject && state.showRegistrationForm) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => {
            setState((prev) => ({
              ...prev,
              selectedProject: null,
              showRegistrationForm: false,
            }))
          }}
          className="mb-4"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          {t('project.backToProjects')}
        </Button>
        <ProjectsRegister
          project={state.selectedProject}
          open={true}
          onClose={handleRegistrationCancel}
          onSuccess={handleRegistrationSuccess}
          onCancel={handleRegistrationCancel}
        />
      </div>
    )
  }

  return (
    <>
      <BlockContent title={t('nav.projects')}>
        {periodLoading ? (
          <Card>
            <CardContent className="pt-6">
              <LoadingSpinner />
            </CardContent>
          </Card>
        ) : !isPeriodActive ? (
          <Card className="border-warning p-0 shadow-none mb-4">
            <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <Calendar className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning-foreground">
                  {t('project.periodClosedMessage')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('project.periodClosedDescription')}
                </p>
              </div>
            </div>
          </Card>
        ) : null}

        <ProjectBrowser onSelectProject={handleSelectProject} />

        {data.error && (
          <BlockContent variant="container" className="border-destructive mt-4">
            <div className="flex items-center gap-2 text-destructive">
              <span>{t('project.loadError')}</span>
            </div>
          </BlockContent>
        )}
      </BlockContent>

      {/* View Project Details Modal */}
      {state.selectedProject && state.showDetails && (
        <ProjectsView
          projectId={String(state.selectedProject.id)}
          open={state.showDetails}
          onClose={() => {
            setState((prev) => ({
              ...prev,
              selectedProject: null,
              showDetails: false,
            }))
          }}
          onRegister={handleRegisterClick}
        />
      )}
    </>
  )
}
