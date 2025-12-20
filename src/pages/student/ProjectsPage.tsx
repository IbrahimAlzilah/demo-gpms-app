import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MainLayout } from '@/layouts/MainLayout'
import { ProjectBrowser } from '@/features/student/components/ProjectBrowser'
import { ProjectRegistrationForm } from '@/features/student/components/ProjectRegistrationForm'
import { Card, CardContent, CardHeader, CardTitle, Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui'
import { usePeriodCheck } from '@/hooks/usePeriodCheck'
import { AlertTriangle, ArrowRight, Briefcase, Calendar, Users, User, Building2 } from 'lucide-react'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import type { Project } from '@/types/project.types'

export function ProjectsPage() {
  const { t } = useTranslation()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const { isPeriodActive, isLoading: periodLoading } = usePeriodCheck('project_registration')

  if (selectedProject && !showDetails) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedProject(null)
              setShowDetails(false)
            }}
            className="mb-4"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            {t('project.backToProjects')}
          </Button>
          <ProjectRegistrationForm
            project={selectedProject}
            onSuccess={() => {
              setSelectedProject(null)
              setShowDetails(false)
            }}
            onCancel={() => {
              setSelectedProject(null)
              setShowDetails(false)
            }}
          />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {periodLoading ? (
          <Card>
            <CardContent className="pt-6">
              <LoadingSpinner />
            </CardContent>
          </Card>
        ) : !isPeriodActive ? (
          <Card className="border-warning">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <CardTitle>{t('project.periodClosed')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        ) : null}

        <ProjectBrowser
          onSelectProject={(project) => {
            setSelectedProject(project)
            setShowDetails(true)
          }}
        />

        {selectedProject && showDetails && (
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  {selectedProject.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">{t('project.description')}</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedProject.description}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t('project.supervisor')}</p>
                      <p className="text-sm font-medium">
                        {selectedProject.supervisor?.name || t('project.noSupervisor')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t('project.students')}</p>
                      <p className="text-sm font-medium">
                        {selectedProject.currentStudents}/{selectedProject.maxStudents}
                      </p>
                    </div>
                  </div>
                  {selectedProject.specialization && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t('project.specialization')}</p>
                        <p className="text-sm font-medium">{selectedProject.specialization}</p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedProject.keywords && selectedProject.keywords.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t('project.keywords')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => {
                      setShowDetails(false)
                      // Small delay to show registration form
                      setTimeout(() => {
                        setSelectedProject(selectedProject)
                      }, 100)
                    }}
                    className="flex-1"
                    disabled={!isPeriodActive}
                  >
                    {t('project.register')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDetails(false)
                      setSelectedProject(null)
                    }}
                  >
                    {t('common.close')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  )
}

