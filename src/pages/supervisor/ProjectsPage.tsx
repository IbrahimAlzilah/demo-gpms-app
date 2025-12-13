import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../app/layouts/MainLayout'
import { ProjectList } from '../../features/supervisor/components/ProjectList'
import { Briefcase } from 'lucide-react'

export function SupervisorProjectsPage() {
  const { t } = useTranslation()
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" />
            {t('nav.projects') || 'استعراض المشاريع'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('supervisor.projectsDescription') || 'استعراض المشاريع المرتبطة بك والوصول إلى تفاصيلها ووثائقها'}
          </p>
        </div>
        <ProjectList />
      </div>
    </MainLayout>
  )
}

