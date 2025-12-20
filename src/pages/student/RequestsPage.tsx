import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../layouts/MainLayout'
import { RequestManagement } from '../../features/student/components/RequestManagement'
import { FileCheck } from 'lucide-react'

export function RequestsPage() {
  const { t } = useTranslation()

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileCheck className="h-8 w-8 text-primary" />
            {t('nav.requests') || 'الطلبات'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('request.pageDescription') || 'تقديم طلب رسمي (تغيير مشرف، مجموعة، أو مشروع، إلخ)'}
          </p>
        </div>

        <RequestManagement />
      </div>
    </MainLayout>
  )
}
