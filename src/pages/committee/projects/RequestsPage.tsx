import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../../layouts/MainLayout'
import { RequestProcessingPanel } from '../../../features/projects-committee/components/RequestProcessingPanel'
import { FileCheck } from 'lucide-react'

export function CommitteeRequestsPage() {
  const { t } = useTranslation()

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileCheck className="h-8 w-8 text-primary" />
            {t('nav.processRequests')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('committee.requestsDescription')}
          </p>
        </div>
        <RequestProcessingPanel />
      </div>
    </MainLayout>
  )
}

