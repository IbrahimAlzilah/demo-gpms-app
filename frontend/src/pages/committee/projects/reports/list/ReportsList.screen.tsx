import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { LoadingSpinner, EmptyState, StatusBadge } from '@/components/common'
import { FileBarChart, Download, Loader2, RefreshCw } from 'lucide-react'
import { useReportsList } from './ReportsList.hook'

export function ReportsList() {
  const { t } = useTranslation()
  const { data, state, handleGenerate } = useReportsList()

  const handleDownload = () => {
    if (!data.report) return

    const reportText = `
${t('committee.reports.title')}
${'='.repeat(30)}

${t('committee.reports.projects')}:
  - ${t('committee.reports.total')}: ${data.report.projects.total}
  - ${t('committee.reports.byStatus')}:
${Object.entries(data.report.projects.byStatus)
        .map(([status, count]) => `    - ${status}: ${count}`)
        .join('\n')}

${t('committee.reports.proposals')}:
  - ${t('committee.reports.total')}: ${data.report.proposals.total}
  - ${t('committee.reports.byStatus')}:
${Object.entries(data.report.proposals.byStatus)
        .map(([status, count]) => `    - ${status}: ${count}`)
        .join('\n')}

${t('committee.reports.requests')}:
  - ${t('committee.reports.total')}: ${data.report.requests.total}
  - ${t('committee.reports.byStatus')}:
${Object.entries(data.report.requests.byStatus)
        .map(([status, count]) => `    - ${status}: ${count}`)
        .join('\n')}

${t('committee.reports.evaluations')}:
  - ${t('committee.reports.total')}: ${data.report.evaluations.total}
  - ${t('committee.reports.averageGrade')}: ${data.report.evaluations.averageGrade}
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
          disabled={data.isLoading || state.isGenerating}
          className="w-full sm:w-auto"
        >
          {state.isGenerating || data.isLoading ? (
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
        {data.report && (
          <Button onClick={handleDownload} variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            {t('committee.reports.download')}
          </Button>
        )}
      </div>

      {data.isLoading ? (
        <LoadingSpinner />
      ) : data.report ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileBarChart className="h-5 w-5" />
                {t('committee.reports.projects')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{data.report.projects.total}</div>
                <div className="space-y-1">
                  {Object.entries(data.report.projects.byStatus).map(([status, count]) => (
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
                <FileBarChart className="h-5 w-5" />
                {t('committee.reports.proposals')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{data.report.proposals.total}</div>
                <div className="space-y-1">
                  {Object.entries(data.report.proposals.byStatus).map(([status, count]) => (
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
                <FileBarChart className="h-5 w-5" />
                {t('committee.reports.requests')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{data.report.requests.total}</div>
                <div className="space-y-1">
                  {Object.entries(data.report.requests.byStatus).map(([status, count]) => (
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
                <FileBarChart className="h-5 w-5" />
                {t('committee.reports.evaluations')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{data.report.evaluations.total}</div>
                <div className="text-sm text-muted-foreground">
                  {t('committee.reports.averageGrade')}: {data.report.evaluations.averageGrade}
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
