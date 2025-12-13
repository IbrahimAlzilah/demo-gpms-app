import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../app/layouts/MainLayout'
import { ProjectDashboard } from '../../features/student/components/ProjectDashboard'
import { useProjects } from '../../features/student/hooks/useProjects'
import { useAuthStore } from '../../features/auth/store/auth.store'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { Briefcase, TrendingUp } from 'lucide-react'

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
              <TrendingUp className="h-8 w-8 text-primary" />
              {t('nav.followUp') || 'متابعة المشروع'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t('followUp.pageDescription') || 'تابع تقدم مشروعك، بما في ذلك حالة المشروع، نسبة الإنجاز، ملاحظات المشرف، والمواعيد'}
            </p>
          </div>
          <EmptyState
            icon={Briefcase}
            title={t('followUp.noProject') || 'لا يوجد مشروع مسجل'}
            description={t('followUp.noProjectDescription') || 'يجب أن تكون مسجلاً في مشروع لمتابعة التقدم'}
          />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            {t('nav.followUp') || 'متابعة المشروع'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('followUp.pageDescription') || 'تابع تقدم مشروعك، بما في ذلك حالة المشروع، نسبة الإنجاز، ملاحظات المشرف، والمواعيد'}
          </p>
        </div>
        <ProjectDashboard projectId={userProject.id} />
      </div>
    </MainLayout>
  )
}
