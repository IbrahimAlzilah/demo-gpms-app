import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input, Popover, PopoverTrigger, PopoverContent, Label, Separator } from '@/components/ui'
import { BlockContent } from '@/components/common'
import { Filter, Download, X, Printer } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReportFilters } from '../api/report.service'
import { periodService } from '../../periods/api/period.service'
import { useQuery } from '@tanstack/react-query'
import { supervisorAssignmentService } from '../../supervisors/api/supervisor.service'

// Import tab components (we'll create these)
import { OverviewTab } from './tabs/OverviewTab'
import { ProjectsTab } from './tabs/ProjectsTab'
import { SupervisorsTab } from './tabs/SupervisorsTab'
import { StudentsTab } from './tabs/StudentsTab'
import { StudentGroupsTab } from './tabs/StudentGroupsTab'
import { DiscussionCommitteesTab } from './tabs/DiscussionCommitteesTab'
import { RequestsTab } from './tabs/RequestsTab'
import { DeadlinesTab } from './tabs/DeadlinesTab'
import { HistoryTab } from './tabs/HistoryTab'

export function ReportsList() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [filters, setFilters] = useState<ReportFilters>({})
  const [filterOpen, setFilterOpen] = useState(false)

  // Print styles
  const printStyles = `
    @media print {
      @page { size: landscape; margin: 10mm; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body { background-color: white !important; }
      aside, header, nav, .bg-sidebar, .border-r { display: none !important; }
      main { margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: none !important; }
      .no-print { display: none !important; }
      button { display: none !important; }
      
      /* Ensure Tabs Content is visible and proper overflow */
      [role="tabpanel"] { display: block !important; }
      [role="tablist"] { display: none !important; }
      
      .card, .border, .shadow-sm {
        box-shadow: none !important;
        border: 1px solid #ddd !important;
        break-inside: avoid;
      }
      
      /* Table optimizations */
      .overflow-auto, .overflow-x-auto, .overflow-y-auto { overflow: visible !important; }
      th, td { white-space: normal !important; }
      .report-print-header { display: block !important; }
    }
    .report-print-header { display: none; }
  `

  // Fetch periods for filter
  const { data: periods = [] } = useQuery({
    queryKey: ['periods', 'general'],
    queryFn: async () => {
      const allPeriods = await periodService.getAll()
      return allPeriods.filter(p => p.type === 'general')
    },
    staleTime: 0,
    refetchOnMount: true,
  })

  // Fetch supervisors for filter
  const { data: supervisors = [] } = useQuery({
    queryKey: ['supervisors-list'],
    queryFn: async () => {
      return await supervisorAssignmentService.getAvailableSupervisors()
    },
    staleTime: 0,
    refetchOnMount: true,
  })

  const handleFilterChange = (key: keyof ReportFilters, value: string | number | undefined) => {
    setFilters((prev: ReportFilters) => ({
      ...prev,
      [key]: value || undefined,
    }))
    // Filters update in real-time, no need to close popover
  }

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== null && v !== '').length

  const handleClearFilters = () => {
    setFilters({})
  }

  const handleExport = async (reportType: string, format: 'pdf' | 'excel') => {
    try {
      const { committeeReportService } = await import('../api/report.service')
      const blob = format === 'pdf'
        ? await committeeReportService.exportPdf(reportType, filters)
        : await committeeReportService.exportExcel(reportType, filters)

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `report_${reportType}_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'txt' : 'csv'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const actions = (
    <div className="relative flex flex-wrap items-center gap-2">
      {/* Filter Button and Popover */}
      <Popover open={filterOpen} onOpenChange={setFilterOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-2",
              activeFiltersCount > 0 && "border-primary"
            )}
          >
            <Filter className="h-4 w-4" />
            {t('common.filter')}
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-0"
          align="start"
          sideOffset={8}
        >
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">{t('committee.reports.filters.title')}</h4>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-7 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  {t('common.clearFilters')}
                </Button>
              )}
            </div>

            <Separator />

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Period Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">{t('committee.reports.filters.period')}</Label>
                <Select
                  value={filters.period_id?.toString() || 'all'}
                  onValueChange={(value) => handleFilterChange('period_id', value && value !== 'all' ? parseInt(value) : undefined)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={t('committee.reports.filters.selectPeriod')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    {periods.map(period => (
                      <SelectItem key={period.id} value={period.id.toString()}>
                        {period.name} {period.academicYear && `(${period.academicYear})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">{t('committee.reports.filters.status')}</Label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => handleFilterChange('status', value && value !== 'all' ? value : undefined)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={t('committee.reports.filters.selectStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="draft">{t('projectManagement.status.draft')}</SelectItem>
                    <SelectItem value="pending_review">{t('projectManagement.status.pendingReview')}</SelectItem>
                    <SelectItem value="approved">{t('projectManagement.status.approved')}</SelectItem>
                    <SelectItem value="in_progress">{t('projectManagement.status.inProgress')}</SelectItem>
                    <SelectItem value="completed">{t('projectManagement.status.completed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Supervisor Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">{t('committee.reports.filters.supervisor')}</Label>
                <Select
                  value={filters.supervisor_id?.toString() || 'all'}
                  onValueChange={(value) => handleFilterChange('supervisor_id', value && value !== 'all' ? parseInt(value) : undefined)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={t('committee.reports.filters.selectSupervisor')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    {supervisors.map(supervisor => (
                      <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                        {supervisor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">{t('committee.reports.filters.department')}</Label>
                <Input
                  placeholder={t('committee.reports.filters.departmentPlaceholder')}
                  value={filters.department || ''}
                  onChange={(e) => handleFilterChange('department', e.target.value || undefined)}
                  className="h-9"
                />
              </div>

              {/* Date Range Filters */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">{t('committee.reports.filters.dateRange')}</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t('committee.reports.filters.dateFrom')}</Label>
                    <Input
                      type="date"
                      value={filters.date_from || ''}
                      onChange={(e) => handleFilterChange('date_from', e.target.value || undefined)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t('committee.reports.filters.dateTo')}</Label>
                    <Input
                      type="date"
                      value={filters.date_to || ''}
                      onChange={(e) => handleFilterChange('date_to', e.target.value || undefined)}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.print()}
        className="no-print"
      >
        <Printer className="h-4 w-4 mr-2" />
        {t('common.print')}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport(activeTab, 'excel')}
        className="no-print"
      >
        <Download className="h-4 w-4 mr-2" />
        {t('committee.reports.exportExcel')}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport(activeTab, 'pdf')}
        className="no-print"
      >
        <Download className="h-4 w-4 mr-2" />
        {t('committee.reports.exportPdf')}
      </Button>
    </div>
  )

  const reportGeneratedDate = new Date().toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })

  return (
    <div className="space-y-6" role="region" aria-label={t('committee.reports.title')}>
      <style>{printStyles}</style>
      <div className="report-print-header" aria-hidden="true">
        <h1 className="text-lg font-bold">{t('committee.reports.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('committee.reports.generatedOn', { date: reportGeneratedDate })}</p>
      </div>
      <BlockContent title={t('committee.reports.title')} actions={actions}>
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-4">
            <TabsList>
              <TabsTrigger value="overview">{t('committee.reports.tabs.overview')}</TabsTrigger>
              <TabsTrigger value="projects">{t('committee.reports.tabs.projects')}</TabsTrigger>
              <TabsTrigger value="supervisors">{t('committee.reports.tabs.supervisors')}</TabsTrigger>
              <TabsTrigger value="students">{t('committee.reports.tabs.students')}</TabsTrigger>
              <TabsTrigger value="student-groups">{t('committee.reports.tabs.studentGroups')}</TabsTrigger>
              <TabsTrigger value="discussion-committees">{t('committee.reports.tabs.discussionCommittees')}</TabsTrigger>
              <TabsTrigger value="requests">{t('committee.reports.tabs.requests')}</TabsTrigger>
              <TabsTrigger value="deadlines">{t('committee.reports.tabs.deadlines')}</TabsTrigger>
              <TabsTrigger value="history">{t('committee.reports.tabs.history')}</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <OverviewTab filters={filters} onExport={handleExport} />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsTab filters={filters} onExport={handleExport} />
          </TabsContent>

          <TabsContent value="supervisors">
            <SupervisorsTab filters={filters} onExport={handleExport} />
          </TabsContent>

          <TabsContent value="students">
            <StudentsTab filters={filters} onExport={handleExport} />
          </TabsContent>

          <TabsContent value="student-groups">
            <StudentGroupsTab filters={filters} onExport={handleExport} />
          </TabsContent>

          <TabsContent value="discussion-committees">
            <DiscussionCommitteesTab filters={filters} onExport={handleExport} />
          </TabsContent>

          <TabsContent value="requests">
            <RequestsTab filters={filters} onExport={handleExport} />
          </TabsContent>

          <TabsContent value="deadlines">
            <DeadlinesTab filters={filters} onExport={handleExport} />
          </TabsContent>

          <TabsContent value="history">
            <HistoryTab onExport={handleExport} />
          </TabsContent>
        </Tabs>
      </BlockContent>
    </div>
  )
}
