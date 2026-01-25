import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MainLayout } from '@/layouts/MainLayout'
import { EvaluationList } from './list/EvaluationList.screen'
import { ProjectsList } from '../projects/list/ProjectsList.screen'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { AlertCircle, ArrowLeft, User } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useSupervisorProject } from '../projects/hooks/useProjects'

export function EvaluationPage() {
  const { projectId, studentId } = useParams<{ projectId?: string; studentId?: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data: project, isLoading: projectLoading } = useSupervisorProject(projectId || '')

  // If both projectId and studentId are provided, show evaluation form
  if (projectId && studentId) {
    return (
      <MainLayout>
        <EvaluationList projectId={projectId} studentId={studentId} />
      </MainLayout>
    )
  }

  // If projectId is provided but not studentId, show students list
  if (projectId) {
    if (projectLoading) {
      return (
        <MainLayout>
          <Card>
            <CardContent className="pt-6">
              <LoadingSpinner />
            </CardContent>
          </Card>
        </MainLayout>
      )
    }

    if (!project || !project.students || project.students.length === 0) {
      return (
        <MainLayout>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                {t('supervisor.studentIdRequired')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {t('supervisor.studentIdRequiredMessage')}
              </p>
              <Button
                onClick={() => navigate(ROUTES.SUPERVISOR.PROJECTS)}
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('supervisor.backToProjects')}
              </Button>
            </CardContent>
          </Card>
        </MainLayout>
      )
    }

    return (
      <MainLayout>
        <Card>
          <CardHeader>
            <CardTitle>{t('nav.evaluation')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t('supervisor.evaluationDescription')}
            </p>
            <div className="space-y-2">
              {project.students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`${ROUTES.SUPERVISOR.EVALUATION}/${projectId}/${student.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{student.name}</p>
                      {student.email && (
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    {t('nav.evaluation')}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </MainLayout>
    )
  }

  // Otherwise, show projects list
  return (
    <MainLayout>
      <ProjectsList onProjectSelect={(project) => {
        if (project.students && project.students.length > 0) {
          // If project has students, navigate to first student evaluation
          navigate(`${ROUTES.SUPERVISOR.EVALUATION}/${project.id}/${project.students[0].id}`)
        } else {
          // Otherwise, navigate to project evaluation page (will show students list)
          navigate(`${ROUTES.SUPERVISOR.EVALUATION}/${project.id}`)
        }
      }} />
    </MainLayout>
  )
}
