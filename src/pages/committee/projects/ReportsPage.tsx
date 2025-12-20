import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../../layouts/MainLayout'
import { ReportGenerator } from '../../../features/projects-committee/components/ReportGenerator'
import { FileBarChart } from 'lucide-react'

export function CommitteeReportsPage() {
  const { t } = useTranslation()

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileBarChart className="h-8 w-8 text-primary" />
            {t('nav.reports')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('committee.reportsDescription')}
          </p>
        </div>
        <ReportGenerator />
      </div>
    </MainLayout>
  )
}

