import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { MainLayout } from '../../app/layouts/MainLayout'
import { ProjectProgressTracker } from '../../features/supervisor/components/ProjectProgressTracker'
import { TrendingUp } from 'lucide-react'

export function ProgressPage() {
  const { t } = useTranslation()
  const { projectId } = useParams<{ projectId: string }>()
  const defaultProjectId = projectId || '2' // Fallback for development
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            {t('nav.progress') || 'متابعة تقدم المشاريع'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('supervisor.progressDescription') || 'متابعة المشاريع التي تشرف عليها، من خلال الاطلاع على حالة التقدم والوثائق، إضافة ملاحظات، وتحديد مواعيد لقاءات'}
          </p>
        </div>
        <ProjectProgressTracker projectId={defaultProjectId} />
      </div>
    </MainLayout>
  )
}

