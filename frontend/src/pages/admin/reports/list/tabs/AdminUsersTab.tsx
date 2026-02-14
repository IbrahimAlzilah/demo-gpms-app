import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { LoadingSpinner, StatusBadge } from '@/components/common'
import { useAdminUsersReport } from '../../hooks/useReports'
import type { ReportFilters } from '../../api/report.service'

interface AdminUsersTabProps {
  filters: ReportFilters
}

export function AdminUsersTab({ filters }: AdminUsersTabProps) {
  const { t } = useTranslation()
  const { data, isLoading, error } = useAdminUsersReport(filters)

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        {t('common.errorLoadingData')}
      </div>
    )
  }

  if (!data) return null

  const { summary, users } = data

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground font-medium">{t('admin.reports.usersTotal')}</p>
            <p className="text-2xl font-bold">{summary.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground font-medium">{t('admin.reports.byRole')}</p>
            <p className="text-lg font-semibold">
              {Object.keys(summary.byRole || {}).length} {t('admin.reports.roles')}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(summary.byRole || {}).map(([role, count]) => (
                <span
                  key={role}
                  className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary"
                >
                  {t(`roles.${role}`) || role}: {count}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground font-medium">{t('admin.reports.byStatus')}</p>
            <p className="text-lg font-semibold">
              {Object.keys(summary.byStatus || {}).length} {t('common.statuses')}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(summary.byStatus || {}).map(([status, count]) => (
                <span
                  key={status}
                  className="text-xs px-2 py-0.5 rounded bg-muted"
                >
                  {t(`status.${status}`, { defaultValue: status })}: {count}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{t('admin.reports.usersList')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">{t('common.name')}</th>
                  <th className="text-left py-2 px-3 font-medium">{t('user.username')}</th>
                  <th className="text-left py-2 px-3 font-medium">{t('user.role')}</th>
                  <th className="text-left py-2 px-3 font-medium">{t('common.status')}</th>
                  <th className="text-left py-2 px-3 font-medium">{t('user.department')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/30">
                    <td className="py-2 px-3">
                      <div className="font-medium">{user.name}</div>
                      {user.email && <div className="text-xs text-muted-foreground">{user.email}</div>}
                    </td>
                    <td className="py-2 px-3 font-mono text-xs">{user.username}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 text-xs rounded bg-primary/10 text-primary">
                        {t(`roles.${user.role}`) || user.role}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">{user.department || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">{t('common.noData')}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
