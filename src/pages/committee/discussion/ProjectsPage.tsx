import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../../layouts/MainLayout'
import { AssignedProjectsList } from '../../../features/discussion-committee/components/AssignedProjectsList'
import { Briefcase } from 'lucide-react'

export function DiscussionProjectsPage() {
  const { t } = useTranslation()

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" />
            {t('nav.projects')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('discussion.projectsDescription')}
          </p>
        </div>
        <AssignedProjectsList />
      </div>
    </MainLayout>
  )
}

