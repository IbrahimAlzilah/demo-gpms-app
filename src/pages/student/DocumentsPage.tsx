import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../layouts/MainLayout'
import { DocumentManagement } from '../../features/student/components/DocumentManagement'
import { FolderOpen } from 'lucide-react'

export function DocumentsPage() {
  const { t } = useTranslation()

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderOpen className="h-8 w-8 text-primary" />
            {t('nav.documents') || 'تسليم الوثائق'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('document.pageDescription') || 'قم برفع الوثائق المطلوبة للمشروع'}
          </p>
        </div>

        <DocumentManagement />
      </div>
    </MainLayout>
  )
}
