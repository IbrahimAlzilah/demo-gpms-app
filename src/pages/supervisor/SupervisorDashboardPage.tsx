import { MainLayout } from '../../layouts/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { useAuthStore } from '../../features/auth/store/auth.store'
import { ROUTES } from '../../lib/constants'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import {
  Briefcase,
  UserCheck,
  ClipboardCheck,
  Calendar,
  ArrowLeft,
} from 'lucide-react'

export function SupervisorDashboardPage() {
  const { user } = useAuthStore()

  // Mock data - in real app, fetch from API
  const stats = {
    projects: 5,
    pendingRequests: 3,
    upcomingMeetings: 2,
    pendingEvaluations: 4,
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم المشرف</h1>
          <p className="text-muted-foreground mt-2">
            مرحباً {user?.name}، هذه نظرة عامة على نشاطك في النظام
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المشاريع</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.projects}</div>
              <p className="text-xs text-muted-foreground">مشاريع تحت الإشراف</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">طلبات الإشراف</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">طلبات معلقة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">اللقاءات</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingMeetings}</div>
              <p className="text-xs text-muted-foreground">لقاءات قادمة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">التقييمات</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingEvaluations}</div>
              <p className="text-xs text-muted-foreground">تقييمات معلقة</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={ROUTES.SUPERVISOR.SUPERVISION_REQUESTS}>
                  <UserCheck className="ml-2 h-4 w-4" />
                  معالجة طلبات الإشراف
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={ROUTES.SUPERVISOR.PROJECTS}>
                  <Briefcase className="ml-2 h-4 w-4" />
                  استعراض المشاريع
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={ROUTES.SUPERVISOR.PROGRESS}>
                  <Calendar className="ml-2 h-4 w-4" />
                  متابعة تقدم المشاريع
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={ROUTES.SUPERVISOR.EVALUATION}>
                  <ClipboardCheck className="ml-2 h-4 w-4" />
                  تقييم المشاريع
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>المهام العاجلة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.pendingRequests > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10">
                    <span className="text-sm">لديك {stats.pendingRequests} طلب إشراف معلق</span>
                    <Button asChild size="sm" variant="outline">
                      <Link to={ROUTES.SUPERVISOR.SUPERVISION_REQUESTS}>
                        مراجعة
                        <ArrowLeft className="mr-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                )}
                {stats.pendingEvaluations > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-info/10">
                    <span className="text-sm">لديك {stats.pendingEvaluations} تقييم معلق</span>
                    <Button asChild size="sm" variant="outline">
                      <Link to={ROUTES.SUPERVISOR.EVALUATION}>
                        تقييم
                        <ArrowLeft className="mr-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
