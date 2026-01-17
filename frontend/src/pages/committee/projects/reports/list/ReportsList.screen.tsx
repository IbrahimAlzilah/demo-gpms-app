import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, Button, Badge } from '@/components/ui'
import { LoadingSpinner, StatusBadge, ModalDialog, BlockContent } from '@/components/common'
import { FileText, Users, Award, BarChart3, Loader2, Download, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { useReportsList } from './ReportsList.hook'
import { cn } from '@/lib/utils'

type ReportType = 'projects' | 'students' | 'assessments' | 'general'

export function ReportsList() {
  const { t } = useTranslation()
  const { data, state, handleGenerate } = useReportsList()
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null)

  const handleGenerateClick = async (type: ReportType) => {
    setSelectedReport(type)
    if (!data.report) {
      await handleGenerate()
    }
  }

  const handleExport = (type: ReportType | null) => {
    if (!data.report || !type) return

    // Create report content based on type
    let content = ''
    let filename = ''

    switch (type) {
      case 'projects':
        filename = 'projects-report.txt'
        content = generateProjectsReportContent(data.report)
        break
      case 'students':
        filename = 'students-report.txt'
        content = generateStudentsReportContent(data.report)
        break
      case 'assessments':
        filename = 'evaluations-report.txt'
        content = generateEvaluationsReportContent(data.report)
        break
      case 'general':
        filename = 'general-statistical-report.txt'
        content = generateGeneralReportContent(data.report)
        break
    }

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const generateProjectsReportContent = (report: any) => {
    return `
${t('committee.reports.projectsReport')}
${'='.repeat(50)}

${t('committee.reports.totalProjects')}: ${report.projects.total}

${t('committee.reports.byStatus')}:
${Object.entries(report.projects.byStatus).map(([status, count]) => 
  `  ${status}: ${count}`
).join('\n')}

${t('committee.reports.totalProposals')}: ${report.proposals.total}

${t('committee.reports.byStatus')}:
${Object.entries(report.proposals.byStatus).map(([status, count]) => 
  `  ${status}: ${count}`
).join('\n')}
`
  }

  const generateStudentsReportContent = (report: any) => {
    return `
${t('committee.reports.studentsReport')}
${'='.repeat(50)}

${t('committee.reports.total')}: ${report.students?.total || 0}
${t('committee.reports.registered')}: ${report.students?.registered || 0}
${t('committee.reports.unregistered')}: ${report.students?.unregistered || 0}
`
  }

  const generateEvaluationsReportContent = (report: any) => {
    return `
${t('committee.reports.evaluationsReport')}
${'='.repeat(50)}

${t('committee.reports.totalEvaluations')}: ${report.evaluations.total}
${t('committee.reports.averageGrade')}: ${report.evaluations.averageGrade}
`
  }

  const generateGeneralReportContent = (report: any) => {
    return `
${t('committee.reports.generalReport')}
${'='.repeat(50)}

${t('committee.reports.projects')}:
  ${t('committee.reports.total')}: ${report.projects.total}
  ${t('committee.reports.byStatus')}:
${Object.entries(report.projects.byStatus).map(([status, count]) => 
    `    ${status}: ${count}`
  ).join('\n')}

${t('committee.reports.proposals')}:
  ${t('committee.reports.total')}: ${report.proposals.total}
  ${t('committee.reports.byStatus')}:
${Object.entries(report.proposals.byStatus).map(([status, count]) => 
    `    ${status}: ${count}`
  ).join('\n')}

${t('committee.reports.requests')}:
  ${t('committee.reports.total')}: ${report.requests.total}
  ${t('committee.reports.byStatus')}:
${Object.entries(report.requests.byStatus).map(([status, count]) => 
    `    ${status}: ${count}`
  ).join('\n')}

${t('committee.reports.evaluations')}:
  ${t('committee.reports.total')}: ${report.evaluations.total}
  ${t('committee.reports.averageGrade')}: ${report.evaluations.averageGrade}

${t('committee.reports.students')}:
  ${t('committee.reports.total')}: ${report.students?.total || 0}
  ${t('committee.reports.registered')}: ${report.students?.registered || 0}
  ${t('committee.reports.unregistered')}: ${report.students?.unregistered || 0}
`
  }

  const getReportContent = (type: ReportType | null) => {
    if (!data.report) return null

    switch (type) {
      case 'projects':
        return (
          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <h3 className="font-semibold mb-4 text-primary text-lg">{t('committee.reports.projects')}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">{t('committee.reports.total')}</span>
                  <span className="text-2xl font-bold text-primary">{data.report.projects.total}</span>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">{t('committee.reports.byStatus')}</h4>
                  {Object.entries(data.report.projects.byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <StatusBadge status={status} />
                      <span className="font-semibold">{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <h3 className="font-semibold mb-4 text-primary text-lg">{t('committee.reports.proposals')}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">{t('committee.reports.total')}</span>
                  <span className="text-2xl font-bold text-primary">{data.report.proposals.total}</span>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">{t('committee.reports.byStatus')}</h4>
                  {Object.entries(data.report.proposals.byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <StatusBadge status={status} />
                      <span className="font-semibold">{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      case 'students':
        return (
          <div className="space-y-6">
            {data.report.students && (
              <div className="bg-card rounded-lg border p-6 shadow-sm">
                <h3 className="font-semibold mb-4 text-primary">{t('committee.reports.studentsReport')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="text-sm text-muted-foreground">{t('committee.reports.total')}</span>
                    </div>
                    <div className="text-2xl font-bold">{data.report.students.total}</div>
                  </div>
                  <div className="space-y-2 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-muted-foreground">{t('committee.reports.registered')}</span>
                    </div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-400">{data.report.students.registered}</div>
                  </div>
                  <div className="space-y-2 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm text-muted-foreground">{t('committee.reports.unregistered')}</span>
                    </div>
                    <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{data.report.students.unregistered}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      case 'assessments':
        return (
          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <h3 className="font-semibold mb-4 text-primary text-lg">{t('committee.reports.evaluations')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">{t('committee.reports.total')}</span>
                  <div className="text-3xl font-bold text-primary">{data.report.evaluations.total}</div>
                </div>
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">{t('committee.reports.averageGrade')}</span>
                  <div className="text-3xl font-bold text-primary">{data.report.evaluations.averageGrade}</div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'general':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatsSection title={t('committee.reports.projects')} data={data.report.projects} compact />
              <StatsSection title={t('committee.reports.proposals')} data={data.report.proposals} compact />
              <StatsSection title={t('committee.reports.requests')} data={data.report.requests} compact />
              <div className="bg-card rounded-lg border p-4 shadow-sm">
                <h3 className="font-semibold mb-4 text-primary">{t('committee.reports.evaluations')}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm text-muted-foreground">{t('committee.reports.total')}</span>
                    <span className="font-bold text-lg">{data.report.evaluations.total}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm text-muted-foreground">{t('committee.reports.averageGrade')}</span>
                    <span className="font-bold text-lg text-primary">{data.report.evaluations.averageGrade}</span>
                  </div>
                </div>
              </div>
              {data.report.students && (
                <div className="bg-card rounded-lg border p-4 shadow-sm md:col-span-2">
                  <h3 className="font-semibold mb-4 text-primary">{t('committee.reports.students')}</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <div className="text-sm text-muted-foreground mb-1">{t('committee.reports.total')}</div>
                      <div className="text-2xl font-bold">{data.report.students.total}</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                      <div className="text-sm text-muted-foreground mb-1">{t('committee.reports.registered')}</div>
                      <div className="text-2xl font-bold text-green-700 dark:text-green-400">{data.report.students.registered}</div>
                    </div>
                    <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
                      <div className="text-sm text-muted-foreground mb-1">{t('committee.reports.unregistered')}</div>
                      <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{data.report.students.unregistered}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const getReportTitle = (type: ReportType | null) => {
    switch (type) {
      case 'projects': return t('committee.reports.projectsReport')
      case 'students': return t('committee.reports.studentsReport')
      case 'assessments': return t('committee.reports.assessmentsReport')
      case 'general': return t('committee.reports.generalReport')
      default: return ''
    }
  }

  const ReportCard = ({
    type,
    title,
    description,
    icon: Icon,
    colorClass,
    tag,
    tagClass,
    isLarge = false
  }: {
    type: ReportType,
    title: string,
    description: string,
    icon: any,
    colorClass: string,
    tag: string,
    tagClass: string,
    isLarge?: boolean
  }) => (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-200 border-border overflow-hidden relative",
      isLarge && "md:col-span-2"
    )}>
      <CardContent className={cn(
        "p-6 flex flex-col h-full justify-between gap-4",
        isLarge && "p-8"
      )}>
        <div className="flex-1">
          <div className="relative mb-4">
            {/* Badge positioned at top-left */}
            <Badge className={cn(
              "absolute top-0 left-0 text-xs font-medium z-10",
              tagClass
            )}>
              {tag}
            </Badge>
            {/* Icon positioned at top-right */}
            <div className={cn(
              "ml-auto p-4 rounded-lg flex items-center justify-center",
              colorClass,
              isLarge ? "w-16 h-16" : "w-14 h-14"
            )}>
              <Icon className={cn(
                "text-white",
                isLarge ? "h-8 w-8" : "h-7 w-7"
              )} />
            </div>
          </div>
          <h3 className={cn(
            "font-bold mb-3 text-foreground",
            isLarge ? "text-xl" : "text-lg"
          )}>
            {title}
          </h3>
          <p className={cn(
            "text-muted-foreground leading-relaxed",
            isLarge ? "text-base mb-4" : "text-sm mb-6"
          )}>
            {description}
          </p>
        </div>
        <Button
          onClick={() => handleGenerateClick(type)}
          className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white group mt-auto"
          disabled={state.isGenerating}
          size={isLarge ? "default" : "sm"}
        >
          {state.isGenerating && selectedReport === type ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <>
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {t('committee.reports.generateReport')}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8">
      <BlockContent title={t('committee.reports.title')}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top row - 3 equal cards */}
          <ReportCard
            type="assessments"
            title={t('committee.reports.evaluationsReport')}
            description={t('committee.reports.evaluationsDesc')}
            icon={Award}
            colorClass="bg-purple-600"
            tag={t('committee.reports.tagCompliance')}
            tagClass="bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400"
          />
          <ReportCard
            type="students"
            title={t('committee.reports.studentsReport')}
            description={t('committee.reports.studentsDesc')}
            icon={Users}
            colorClass="bg-green-600"
            tag={t('committee.reports.tagPerformance')}
            tagClass="bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
          />
          <ReportCard
            type="projects"
            title={t('committee.reports.projectsReport')}
            description={t('committee.reports.projectsDesc')}
            icon={FileText}
            colorClass="bg-blue-600"
            tag={t('committee.reports.tagStats')}
            tagClass="bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
          />
          {/* Bottom row - 1 large card spanning 2 columns on the right */}
          <div className="md:col-start-2 md:col-span-2">
            <ReportCard
              type="general"
              title={t('committee.reports.generalReport')}
              description={t('committee.reports.generalDesc')}
              icon={BarChart3}
              colorClass="bg-amber-500"
              tag={t('committee.reports.tagSummary')}
              tagClass="bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
              isLarge={true}
            />
          </div>
        </div>
      </BlockContent>

      <ModalDialog
        open={!!selectedReport && !!data.report}
        onOpenChange={(open) => !open && setSelectedReport(null)}
        title={getReportTitle(selectedReport)}
        size="xl"
      >
        {data.isLoading ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="p-1">
            {getReportContent(selectedReport)}
            <div className="flex justify-end gap-2 mt-6 border-t pt-4">
              <Button variant="outline" onClick={() => setSelectedReport(null)}>
                {t('common.close')}
              </Button>
              <Button 
                onClick={() => handleExport(selectedReport)}
                className="bg-[#0f172a] hover:bg-[#1e293b] text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                {t('committee.reports.downloadPdf')}
              </Button>
            </div>
          </div>
        )}
      </ModalDialog>
    </div>
  )
}

function StatsSection({ title, data, compact = false }: { title: string, data: { total: number, byStatus: Record<string, number> }, compact?: boolean }) {
  return (
    <div className="bg-card rounded-lg border p-4 shadow-sm h-full">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="font-semibold text-primary">{title}</h3>
        <span className="text-2xl font-bold">{data.total}</span>
      </div>
      <div className={`space-y-2 ${compact ? 'text-sm' : ''}`}>
        {Object.entries(data.byStatus).map(([status, count]) => (
          <div key={status} className="flex items-center justify-between">
            <StatusBadge status={status} />
            <span className="font-medium text-slate-700">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
