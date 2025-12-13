import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../app/layouts/MainLayout'
import { SupervisionRequestsList } from '../../features/supervisor/components/SupervisionRequestsList'
import { UserCheck } from 'lucide-react'

export function SupervisionRequestsPage() {
  const { t } = useTranslation()
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserCheck className="h-8 w-8 text-primary" />
            {t('nav.supervisionRequests') || 'معالجة طلبات الإشراف'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('supervision.pageDescription') || 'مراجعة طلبات الإشراف الواردة وقبولها أو رفضها'}
          </p>
        </div>
        <SupervisionRequestsList />
      </div>
    </MainLayout>
  )
}

