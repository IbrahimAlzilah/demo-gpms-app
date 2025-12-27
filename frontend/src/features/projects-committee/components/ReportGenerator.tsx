import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectsReport } from '../hooks/useReports'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { LoadingSpinner, EmptyState, StatusBadge } from '@/components/common'
import { FileBarChart, Download, Loader2, RefreshCw } from 'lucide-react'

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
${t('committee.reports.title')}
${'='.repeat(30)}

${t('committee.reports.projects')}:
  - ${t('committee.reports.total')}: ${report.projects.total}
  - ${t('committee.reports.byStatus')}:
${Object.entries(report.projects.byStatus)
        .map(([status, count]) => `    - ${status}: ${count}`)
        .join('\n')}

${t('committee.reports.proposals')}:
  - ${t('committee.reports.total')}: ${report.proposals.total}
  - ${t('committee.reports.byStatus')}:
${Object.entries(report.proposals.byStatus)
        .map(([status, count]) => `    - ${status}: ${count}`)
        .join('\n')}

${t('committee.reports.requests')}:
  - ${t('committee.reports.total')}: ${report.requests.total}
  - ${t('committee.reports.byStatus')}:
${Object.entries(report.requests.byStatus)
        .map(([status, count]) => `    - ${status}: ${count}`)
        .join('\n')}

${t('committee.reports.evaluations')}:
  - ${t('committee.reports.total')}: ${report.evaluations.total}
  - ${t('committee.reports.averageGrade')}: ${report.evaluations.averageGrade}
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
              {t('committee.reports.generating')}
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('committee.reports.generate')}
            </>
          )}
        </Button>
        {report && (
          <Button onClick={handleDownload} variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            {t('committee.reports.download')}
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
                {t('committee.reports.projects')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{report.projects.total}</p>
                <p className="text-sm text-muted-foreground">{t('committee.reports.totalProjects')}</p>
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
                {t('committee.reports.proposals')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{report.proposals.total}</p>
                <p className="text-sm text-muted-foreground">{t('committee.reports.totalProposals')}</p>
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
                {t('committee.reports.requests')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{report.requests.total}</p>
                <p className="text-sm text-muted-foreground">{t('committee.reports.totalRequests')}</p>
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
                {t('committee.reports.evaluations')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{report.evaluations.total}</p>
                <p className="text-sm text-muted-foreground">{t('committee.reports.totalEvaluations')}</p>
                <div className="mt-4">
                  <p className="text-lg font-semibold">
                    {t('committee.reports.averageGrade')}: {report.evaluations.averageGrade}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <EmptyState
          icon={FileBarChart}
          title={t('committee.reports.noReport')}
          description={t('committee.reports.generateFirst')}
        />
      )}
    </div>
  )
}

