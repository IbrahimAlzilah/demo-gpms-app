import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectsReport } from '../hooks/useReports'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { EmptyState } from '../../../components/common/EmptyState'
import { FileBarChart, Download, Loader2, RefreshCw } from 'lucide-react'
import { StatusBadge } from '../../../components/common/StatusBadge'

export function ReportGenerator() {
  const { t } = useTranslation()
  const { data: report, isLoading, refetch } = useProjectsReport()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      await refetch()
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!report) return
    
    const reportText = `
${t('committee.reports.title') || 'تقرير المشاريع'}
${'='.repeat(30)}

${t('committee.reports.projects') || 'المشاريع'}:
  - ${t('committee.reports.total') || 'الإجمالي'}: ${report.projects.total}
  - ${t('committee.reports.byStatus') || 'حسب الحالة'}:
${Object.entries(report.projects.byStatus)
  .map(([status, count]) => `    - ${status}: ${count}`)
  .join('\n')}

${t('committee.reports.proposals') || 'المقترحات'}:
  - ${t('committee.reports.total') || 'الإجمالي'}: ${report.proposals.total}
  - ${t('committee.reports.byStatus') || 'حسب الحالة'}:
${Object.entries(report.proposals.byStatus)
  .map(([status, count]) => `    - ${status}: ${count}`)
  .join('\n')}

${t('committee.reports.requests') || 'الطلبات'}:
  - ${t('committee.reports.total') || 'الإجمالي'}: ${report.requests.total}
  - ${t('committee.reports.byStatus') || 'حسب الحالة'}:
${Object.entries(report.requests.byStatus)
  .map(([status, count]) => `    - ${status}: ${count}`)
  .join('\n')}

${t('committee.reports.evaluations') || 'التقييمات'}:
  - ${t('committee.reports.total') || 'الإجمالي'}: ${report.evaluations.total}
  - ${t('committee.reports.averageGrade') || 'متوسط الدرجات'}: ${report.evaluations.averageGrade}
`

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button 
          onClick={handleGenerate} 
          disabled={isLoading || isGenerating}
          className="w-full sm:w-auto"
        >
          {isGenerating || isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('committee.reports.generating') || 'جاري التوليد...'}
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('committee.reports.generate') || 'توليد التقرير'}
            </>
          )}
        </Button>
        {report && (
          <Button onClick={handleDownload} variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            {t('committee.reports.download') || 'تحميل التقرير'}
          </Button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : report ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileBarChart className="h-5 w-5 text-primary" />
                {t('committee.reports.projects') || 'المشاريع'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{report.projects.total}</p>
                <p className="text-sm text-muted-foreground">{t('committee.reports.totalProjects') || 'إجمالي المشاريع'}</p>
                <div className="mt-4 space-y-2">
                  {Object.entries(report.projects.byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between text-sm">
                      <StatusBadge status={status} />
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileBarChart className="h-5 w-5 text-primary" />
                {t('committee.reports.proposals') || 'المقترحات'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{report.proposals.total}</p>
                <p className="text-sm text-muted-foreground">{t('committee.reports.totalProposals') || 'إجمالي المقترحات'}</p>
                <div className="mt-4 space-y-2">
                  {Object.entries(report.proposals.byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between text-sm">
                      <StatusBadge status={status} />
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileBarChart className="h-5 w-5 text-primary" />
                {t('committee.reports.requests') || 'الطلبات'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{report.requests.total}</p>
                <p className="text-sm text-muted-foreground">{t('committee.reports.totalRequests') || 'إجمالي الطلبات'}</p>
                <div className="mt-4 space-y-2">
                  {Object.entries(report.requests.byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between text-sm">
                      <StatusBadge status={status} />
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileBarChart className="h-5 w-5 text-primary" />
                {t('committee.reports.evaluations') || 'التقييمات'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{report.evaluations.total}</p>
                <p className="text-sm text-muted-foreground">{t('committee.reports.totalEvaluations') || 'إجمالي التقييمات'}</p>
                <div className="mt-4">
                  <p className="text-lg font-semibold">
                    {t('committee.reports.averageGrade') || 'متوسط الدرجات'}: {report.evaluations.averageGrade}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <EmptyState
          icon={FileBarChart}
          title={t('committee.reports.noReport') || 'لا يوجد تقرير'}
          description={t('committee.reports.generateFirst') || 'اضغط على "توليد التقرير" لعرض البيانات'}
        />
      )}
    </div>
  )
}

