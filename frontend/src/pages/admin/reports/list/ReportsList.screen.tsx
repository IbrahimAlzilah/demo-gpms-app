import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Label,
  Separator,
} from '@/components/ui'
import { BlockContent } from '@/components/common'
import { Filter, Download, X, Printer } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReportFilters } from '../api/report.service'
import { periodService } from '../../../committee/projects/periods/api/period.service'
import { useQuery } from '@tanstack/react-query'
import { adminReportService } from '../api/report.service'

import { AdminOverviewTab } from './tabs/AdminOverviewTab'
import { AdminUsersTab } from './tabs/AdminUsersTab'
import { AdminSystemTab } from './tabs/AdminSystemTab'
import { AdminProjectsTab } from './tabs/AdminProjectsTab'
import { AdminSupervisorsTab } from './tabs/AdminSupervisorsTab'
import { AdminStudentsTab } from './tabs/AdminStudentsTab'
import { AdminRequestsTab } from './tabs/AdminRequestsTab'
import { AdminDeadlinesTab } from './tabs/AdminDeadlinesTab'
import { AdminHistoryTab } from './tabs/AdminHistoryTab'

export function ReportsList() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [filters, setFilters] = useState<ReportFilters>({})
  const [filterOpen, setFilterOpen] = useState(false)

  const printStyles = `
    @media print {
      @page { size: landscape; margin: 10mm; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body { background-color: white !important; }
      aside, header, nav, .bg-sidebar, .border-r { display: none !important; }
      main { margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: none !important; }
      .no-print { display: none !important; }
      button { display: none !important; }
      [role="tabpanel"] { display: block !important; }
      [role="tablist"] { display: none !important; }
      .card, .border, .shadow-sm { box-shadow: none !important; border: 1px solid #ddd !important; break-inside: avoid; }
      .overflow-auto, .overflow-x-auto, .overflow-y-auto { overflow: visible !important; }
      th, td { white-space: normal !important; }
    }
  `

  const { data: periods = [] } = useQuery({
    queryKey: ['periods', 'general'],
    queryFn: async () => {
      const allPeriods = await periodService.getAll()
      return allPeriods.filter((p) => p.type === 'general')
    },
    staleTime: 0,
    refetchOnMount: true,
  })

  const handleFilterChange = (key: keyof ReportFilters, value: string | number | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }))
  }

  const activeFiltersCount = Object.values(filters).filter((v) => v !== undefined && v !== null && v !== '').length

  const handleClearFilters = () => {
    setFilters({})
  }

  const handleExport = async (reportType: string, format: 'pdf' | 'excel') => {
    try {
      const blob =
        format === 'pdf'
          ? await adminReportService.exportPdf(reportType, filters)
          : await adminReportService.exportExcel(reportType, filters)

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `admin_report_${reportType}_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'txt' : 'csv'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const actions = (
    <div className="relative flex justify-between items-center">
      <Popover open={filterOpen} onOpenChange={setFilterOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn('gap-2', activeFiltersCount > 0 && 'border-primary')}
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
        <PopoverContent className="w-80 p-0" align="start" sideOffset={8}>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">{t('committee.reports.filters.title')}</h4>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-7 px-2 text-xs">
                  <X className="h-3 w-3 mr-1" />
                  {t('common.clearFilters')}
                </Button>
              )}
            </div>
            <Separator />
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label className="text-xs font-medium">{t('committee.reports.filters.period')}</Label>
                <Select
                  value={filters.period_id?.toString() || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('period_id', value && value !== 'all' ? parseInt(value) : undefined)
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={t('committee.reports.filters.selectPeriod')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    {periods.map((period) => (
                      <SelectItem key={period.id} value={period.id.toString()}>
                        {period.name} {period.academicYear && `(${period.academicYear})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">{t('admin.reports.filters.role')}</Label>
                <Select
                  value={filters.role || 'all'}
                  onValueChange={(value) => handleFilterChange('role', value && value !== 'all' ? value : undefined)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={t('user.filterByRole')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="student">{t('roles.student')}</SelectItem>
                    <SelectItem value="supervisor">{t('roles.supervisor')}</SelectItem>
                    <SelectItem value="discussion_committee">{t('roles.discussion_committee')}</SelectItem>
                    <SelectItem value="projects_committee">{t('roles.projects_committee')}</SelectItem>
                    <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">{t('committee.reports.filters.status')}</Label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('status', value && value !== 'all' ? value : undefined)
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={t('committee.reports.filters.selectStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="active">{t('user.status.active')}</SelectItem>
                    <SelectItem value="inactive">{t('user.status.inactive')}</SelectItem>
                    <SelectItem value="suspended">{t('user.status.suspended')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
    </div >
  )

  return (
    <div className="space-y-6">
      <style>{printStyles}</style>
      <BlockContent title={t('admin.reports.title')} actions={actions}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="overview">{t('admin.reports.tabs.overview')}</TabsTrigger>
              <TabsTrigger value="users">{t('admin.reports.tabs.users')}</TabsTrigger>
              <TabsTrigger value="system">{t('admin.reports.tabs.system')}</TabsTrigger>
              <TabsTrigger value="projects">{t('admin.reports.tabs.projects')}</TabsTrigger>
              <TabsTrigger value="supervisors">{t('admin.reports.tabs.supervisors')}</TabsTrigger>
              <TabsTrigger value="students">{t('admin.reports.tabs.students')}</TabsTrigger>
              <TabsTrigger value="requests">{t('admin.reports.tabs.requests')}</TabsTrigger>
              <TabsTrigger value="deadlines">{t('admin.reports.tabs.deadlines')}</TabsTrigger>
              <TabsTrigger value="history">{t('admin.reports.tabs.history')}</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                {t('common.print')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport(activeTab, 'excel')}>
                <Download className="h-4 w-4 mr-2" />
                {t('committee.reports.exportExcel')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport(activeTab, 'pdf')}>
                <Download className="h-4 w-4 mr-2" />
                {t('committee.reports.exportPdf')}
              </Button>
            </div>
          </div>

          <TabsContent value="overview">
            <AdminOverviewTab filters={filters} />
          </TabsContent>
          <TabsContent value="users">
            <AdminUsersTab filters={filters} />
          </TabsContent>
          <TabsContent value="system">
            <AdminSystemTab />
          </TabsContent>
          <TabsContent value="projects">
            <AdminProjectsTab filters={filters} />
          </TabsContent>
          <TabsContent value="supervisors">
            <AdminSupervisorsTab filters={filters} />
          </TabsContent>
          <TabsContent value="students">
            <AdminStudentsTab filters={filters} />
          </TabsContent>
          <TabsContent value="requests">
            <AdminRequestsTab filters={filters} />
          </TabsContent>
          <TabsContent value="deadlines">
            <AdminDeadlinesTab filters={filters} />
          </TabsContent>
          <TabsContent value="history">
            <AdminHistoryTab />
          </TabsContent>
        </Tabs>
      </BlockContent>
    </div>
  )
}
