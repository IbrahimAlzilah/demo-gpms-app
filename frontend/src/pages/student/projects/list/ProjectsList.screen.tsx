import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui'
import { BlockContent, LoadingSpinner } from '@/components/common'
import { Calendar } from 'lucide-react'
import { ProjectBrowser } from '../components/ProjectBrowser'
import { ProjectsView } from '../view/ProjectsView.screen'
import { RejectionDetailsModal } from '../components/RejectionDetailsModal'
import { useProjectsList } from './ProjectsList.hook'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'

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
      // Navigate to dedicated registration page
      navigate(ROUTES.STUDENT.REGISTER_PROJECT_WITH_ID(state.selectedProject.id))
    }
  }

  // Note: Registration is now handled via dedicated route
  // Navigation to /projects/register/:projectId handles the registration page

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
