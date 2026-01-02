import { useTranslation } from 'react-i18next'
import { BlockContent } from '@/components/common'
import { ReportCard } from '../components/ReportCard'
import { useReportsList } from './ReportsList.hook'
import type { ReportType } from '@/features/admin/api/report.service'

const REPORT_TYPES: Array<{
  type: ReportType
  title: string
  description: string
}> = [
  {
    type: 'projects',
    title: 'تقرير المشاريع',
    description: 'تقرير شامل عن جميع المشاريع',
  },
  {
    type: 'students',
    title: 'تقرير الطلاب',
    description: 'تقرير عن الطلاب ومشاريعهم',
  },
  {
    type: 'evaluations',
    title: 'تقرير التقييمات',
    description: 'تقرير عن التقييمات والدرجات',
  },
]

export function ReportsList() {
  const { t } = useTranslation()
  const { state, handleGenerateReport } = useReportsList()

  return (
    <BlockContent title="إصدار التقارير">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REPORT_TYPES.map((report) => (
          <ReportCard
            key={report.type}
            title={report.title}
            description={report.description}
            type={report.type}
            isLoading={state.loadingReport === report.type}
            onGenerate={handleGenerateReport}
          />
        ))}
      </div>
    </BlockContent>
  )
}
