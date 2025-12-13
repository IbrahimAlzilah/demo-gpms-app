import { MainLayout } from '../../../app/layouts/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { useAuthStore } from '../../../features/auth/store/auth.store'
import { ROUTES } from '../../../lib/constants'
import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/button'
import { Briefcase, ClipboardCheck, ArrowLeft } from 'lucide-react'

export function DiscussionCommitteeDashboardPage() {
  const { user } = useAuthStore()

  // Mock data - in real app, fetch from API
  const stats = {
    assignedProjects: 8,
    pendingEvaluations: 5,
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم لجنة المناقشة</h1>
          <p className="text-muted-foreground mt-2">
            مرحباً {user?.name}، هذه نظرة عامة على نشاطك في النظام
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المشاريع المعينة</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assignedProjects}</div>
              <p className="text-xs text-muted-foreground">مشاريع معينة للجنة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">التقييمات المعلقة</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingEvaluations}</div>
              <p className="text-xs text-muted-foreground">تقييمات في انتظار المراجعة</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to={ROUTES.DISCUSSION_COMMITTEE.PROJECTS}>
                <Briefcase className="ml-2 h-4 w-4" />
                استعراض المشاريع
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to={ROUTES.DISCUSSION_COMMITTEE.EVALUATION}>
                <ClipboardCheck className="ml-2 h-4 w-4" />
                تقييم المناقشة النهائية
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
