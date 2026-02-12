import { useTranslation } from 'react-i18next'
import { BlockContent } from '@/components/common'
import { Calendar, AlertCircle } from 'lucide-react'
import { ProjectBrowser } from '../components/ProjectBrowser'
import { ProjectsView } from '../view/ProjectsView.screen'
import { RejectionDetailsModal } from '../components/RejectionDetailsModal'
import { useProjectsList } from './ProjectsList.hook'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/lib/constants/constants'
import { cn } from '@/lib/utils'

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
    <div className="space-y-6">
      {/* Period Closed Message */}
      {!periodLoading && !isPeriodActive && (
        <div className="flex items-start gap-3 p-4 rounded-xl border bg-warning/10 border-warning/20">
          <Calendar className="h-5 w-5 text-warning mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-warning-foreground">
              {t('project.periodClosedMessage')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('project.periodClosedDescription')}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <BlockContent title={t('nav.projects')} variant="data-table">
        <ProjectBrowser
          onSelectProject={handleSelectProject}
          onViewRejection={handleViewRejection}
          studentGroup={studentGroup}
          groupLoading={groupLoading}
        />
      </BlockContent>

      {/* Error Display */}
      {data.error && (
        <div className={cn(
          'flex items-center gap-3 p-4 rounded-xl border',
          'bg-gradient-to-r from-destructive/10 to-destructive/5 border-destructive/30'
        )}>
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <span className="text-sm text-destructive">{t('project.loadError')}</span>
        </div>
      )}

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
    </div>
  )
}
