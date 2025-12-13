import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../../layouts/MainLayout'
import { ProposalReviewPanel } from '../../../features/projects-committee/components/ProposalReviewPanel'
import { FileText } from 'lucide-react'

export function ProposalsPage() {
  const { t } = useTranslation()

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            {t('nav.proposals') || 'إدارة المقترحات'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('committee.proposalsDescription') || 'مراجعة المقترحات المقدمة من الطلاب وقبولها أو رفضها أو طلب تعديلها'}
          </p>
        </div>
        <ProposalReviewPanel />
      </div>
    </MainLayout>
  )
}

