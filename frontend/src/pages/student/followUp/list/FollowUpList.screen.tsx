import { useTranslation } from 'react-i18next'
import { ProjectDashboard } from '../components/ProjectDashboard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { Briefcase } from 'lucide-react'
import { useFollowUpList } from './FollowUpList.hook'
import { BlockContent } from '@/components/common/BlockContent'

export function FollowUpList() {
  const { t } = useTranslation()
  const { data } = useFollowUpList()

  if (data.isLoading) {
    return <LoadingSpinner />
  }

  if (!data.project) {
    return (
      <BlockContent title={t('nav.followUp')}>
        <EmptyState
          icon={Briefcase}
          title={t('followUp.noProject')}
          description={t('followUp.noProjectDescription')}
        />
      </BlockContent>
    )
  }

  return <ProjectDashboard projectId={data.project.id} />
}
