import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../../layouts/MainLayout'
import { CommitteeDistribution } from '../../../features/projects-committee/components/CommitteeDistribution'
import { Users } from 'lucide-react'

export function DistributeCommitteesPage() {
  const { t } = useTranslation()

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            {t('nav.distributeCommittees')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('committee.distributeDescription')}
          </p>
        </div>
        <CommitteeDistribution />
      </div>
    </MainLayout>
  )
}

