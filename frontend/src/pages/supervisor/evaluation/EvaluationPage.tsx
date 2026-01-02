import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MainLayout } from '@/layouts/MainLayout'
import { EvaluationList } from './list/EvaluationList.screen'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

export function EvaluationPage() {
  const { projectId, studentId } = useParams<{ projectId?: string; studentId?: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  if (!projectId) {
    return (
      <MainLayout>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              {t('supervisor.projectIdRequired')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {t('supervisor.projectIdRequiredMessage')}
            </p>
            <Button
              onClick={() => navigate(ROUTES.SUPERVISOR.PROJECTS)}
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('supervisor.backToProjects')}
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    )
  }

  if (!studentId) {
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
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('supervisor.backToProjects')}
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <EvaluationList projectId={projectId} studentId={studentId} />
    </MainLayout>
  )
}
