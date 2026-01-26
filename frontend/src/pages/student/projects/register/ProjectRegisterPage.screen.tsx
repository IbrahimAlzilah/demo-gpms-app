import { useTranslation } from 'react-i18next'
import { useProjectRegisterPage } from './ProjectRegisterPage.hook'
import { ProjectRegistrationForm } from '../components/ProjectRegistrationForm'
import { BlockContent } from '@/components/common'
import { LoadingSpinner } from '@/components/common'
import { Button } from '@/components/ui'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'

export function ProjectRegisterPageScreen() {
  const { t } = useTranslation()
  const {
    project,
    studentGroup,
    allRegistrations,
    isPeriodActive,
    isLoading,
    error,
    handleBack,
    handleSuccess,
  } = useProjectRegisterPage()

  if (isLoading) {
    return (
      <BlockContent title={t('project.registerInProject', { defaultValue: 'Register in Project' })}>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      </BlockContent>
    )
  }

  if (error || !project) {
    return (
      <BlockContent
        title={t('project.registerInProject', { defaultValue: 'Register in Project' })}
        actions={
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
        }
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {t('project.loadError', { defaultValue: 'Failed to load project' })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {error?.message || t('project.projectNotFound', { defaultValue: 'Project not found' })}
                </p>
              </div>
              <Button onClick={handleBack} variant="outline">
                {t('common.backToProjects', { defaultValue: 'Back to Projects' })}
              </Button>
            </div>
          </CardContent>
        </Card>
      </BlockContent>
    )
  }

  return (
    <BlockContent
      title={t('project.registerInProject', { defaultValue: 'Register in Project' })}
      actions={
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Project Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {project.title}
            </CardTitle>
            <CardDescription>
              {t('project.reviewDetailsBeforeRegistering', { defaultValue: 'Review project details before registering' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.description && (
                <div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap" dir="auto">
                    {project.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {t('project.supervisor', { defaultValue: 'Supervisor' })}:
                  </span>
                  <span className="text-sm">
                    {project.supervisor?.name || t('project.notAssigned', { defaultValue: 'Not assigned' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {t('project.students', { defaultValue: 'Students' })}:
                  </span>
                  <span className="text-sm">
                    {project.currentStudents}/{project.maxStudents}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Form */}
        <ProjectRegistrationForm
          project={project}
          onSuccess={handleSuccess}
          onCancel={handleBack}
        />
      </div>
    </BlockContent>
  )
}
