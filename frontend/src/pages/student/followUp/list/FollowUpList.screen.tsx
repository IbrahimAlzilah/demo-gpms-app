import { useTranslation } from 'react-i18next'
import { ProjectDashboard } from '@/features/student/components/ProjectDashboard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { Briefcase } from 'lucide-react'
import { useFollowUpList } from './FollowUpList.hook'

export function FollowUpList() {
  const { t } = useTranslation()
  const { data } = useFollowUpList()

  if (data.isLoading) {
    return <LoadingSpinner />
  }

  if (!data.project) {
    return (
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
    )
  }

  return <ProjectDashboard projectId={data.project.id} />
}
