import { useTranslation } from 'react-i18next'
import { Card, CardContent, Button } from '@/components/ui'
import { BlockContent, LoadingSpinner } from '@/components/common'
import { Calendar, ArrowRight, ArrowLeft } from 'lucide-react'
import { ProjectBrowser } from '../components/ProjectBrowser'
import { ProjectsView } from '../view/ProjectsView.screen'
import { ProjectsRegister } from '../register/ProjectsRegister.screen'
import { RejectionDetailsModal } from '../components/RejectionDetailsModal'
import { useProjectsList } from './ProjectsList.hook'
import { useNavigate } from 'react-router-dom'

export function ProjectsList() {
  const { t } = useTranslation()
  const {
    data,
    state,
    setState,
    isPeriodActive,
    periodLoading,
    registrations,
    studentGroup,
    groupLoading,
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
  } = useProjectsList()
  const navigate = useNavigate()  
  const handleSelectProject = (project: any) => {
    // Allow viewing project details even if rejected
    setState((prev) => ({
      ...prev,
      selectedProject: project,
      showDetails: true,
    }))
  }

  const handleViewRejection = (_project: any, registration: any) => {
    setState((prev) => ({
      ...prev,
      rejectionRegistration: registration,
      showRejectionDetails: true,
    }))
  }

  const handleRegisterClick = () => {
    if (state.selectedProject) {
      // Per specification: Registration requires a group
      if (!studentGroup) {
        return
      }

      // Check if project was rejected - prevent registration
      const registration = registrations?.find((r) => r.projectId === state.selectedProject?.id)
      if (registration?.status === 'rejected') {
        // Don't allow registration for rejected project
        return
      }
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
      <BlockContent title={t('project.register')} actions={
        <Button variant="outline" onClick={handleRegistrationCancel} className="shrink-0">
          <ArrowLeft className="size-4 ltr:rotate-180" />
          {t('common.back')}
        </Button>
      }>
        <ProjectsRegister
          project={state.selectedProject}
          open={true}
          onClose={handleRegistrationCancel}
          onSuccess={handleRegistrationSuccess}
          onCancel={handleRegistrationCancel}
        />
      </BlockContent>
    )
  }

  return (
    <>
      <BlockContent title={t('nav.projects')} variant="data-table">
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

        <ProjectBrowser
          onSelectProject={handleSelectProject}
          onViewRejection={handleViewRejection}
          studentGroup={studentGroup}
          groupLoading={groupLoading}
        />

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

      {/* Rejection Details Modal */}
      <RejectionDetailsModal
        registration={state.rejectionRegistration}
        open={state.showRejectionDetails}
        onClose={() => {
          setState((prev) => ({
            ...prev,
            rejectionRegistration: null,
            showRejectionDetails: false,
          }))
        }}
      />
    </>
  )
}
