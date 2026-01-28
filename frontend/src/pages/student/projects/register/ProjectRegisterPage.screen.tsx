import { useTranslation } from 'react-i18next'
import { useProjectRegisterPage } from './ProjectRegisterPage.hook'
import { ProjectRegistrationForm } from '../components/ProjectRegistrationForm'
import { BlockContent } from '@/components/common'
import { LoadingSpinner } from '@/components/common'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@/components/ui'

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
