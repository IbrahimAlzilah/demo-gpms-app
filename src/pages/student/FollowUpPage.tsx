import { useTranslation } from 'react-i18next'
import { MainLayout } from '@/layouts/MainLayout'
import { ProjectDashboard } from '@/features/student/components/ProjectDashboard'
import { useProjects } from '@/features/student/hooks/useProjects'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { Briefcase } from 'lucide-react'

export function FollowUpPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { data: projects, isLoading } = useProjects()

  // Get user's project
  const userProject = projects?.find((p) => p.students.some((s) => s.id === user?.id))

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    )
  }

  if (!userProject) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {t('nav.followUp')}
            </h1>
          </div>
          <EmptyState
            icon={Briefcase}
            title={t('followUp.noProject')}
            description={t('followUp.noProjectDescription')}
          />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <ProjectDashboard projectId={userProject.id} />
      </div>
    </MainLayout>
  )
}
