import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../../layouts/MainLayout'
import { ProjectAnnouncement } from '../../../features/projects-committee/components/ProjectAnnouncement'
import { Megaphone } from 'lucide-react'

export function AnnounceProjectsPage() {
  const { t } = useTranslation()

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Megaphone className="h-8 w-8 text-primary" />
            {t('nav.announceProjects') || 'إعلان المشاريع المعتمدة'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('committee.announceDescription') || 'إعلان المشاريع المعتمدة للطلاب للتسجيل فيها'}
          </p>
        </div>
        <ProjectAnnouncement />
      </div>
    </MainLayout>
  )
}

