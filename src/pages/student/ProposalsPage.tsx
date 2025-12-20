// import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../layouts/MainLayout'
import { ProposalManagement } from '../../features/student/components/ProposalManagement'
// import { FileText } from 'lucide-react'

export function ProposalsPage() {
  // const { t } = useTranslation()

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        {/* <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            {t('nav.proposals') || 'المقترحات'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('proposal.pageDescription') || 'قم بتقديم مقترحات مشاريع التخرج أو راجع المقترحات المقدمة'}
          </p>
        </div> */}
        <ProposalManagement />
      </div>
    </MainLayout>
  )
}
