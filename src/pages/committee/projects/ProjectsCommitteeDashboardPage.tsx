import { MainLayout } from '../../../layouts/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { useAuthStore } from '../../../features/auth/store/auth.store'
import { ROUTES } from '../../../lib/constants'
import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/button'
import {
  Calendar,
  FileText,
  Megaphone,
  UserPlus,
  FileCheck,
  Users,
  FileBarChart,
  ArrowLeft,
} from 'lucide-react'

export function ProjectsCommitteeDashboardPage() {
  const { user } = useAuthStore()

  // Mock data - in real app, fetch from API
  const stats = {
    pendingProposals: 12,
    pendingRequests: 8,
    projectsToAnnounce: 5,
    supervisorsToAssign: 3,
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم لجنة المشاريع</h1>
          <p className="text-muted-foreground mt-2">
            مرحباً {user?.name}، هذه نظرة عامة على نشاطك في النظام
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المقترحات</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingProposals}</div>
              <p className="text-xs text-muted-foreground">مقترحات قيد المراجعة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الطلبات</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">طلبات معلقة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المشاريع</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.projectsToAnnounce}</div>
              <p className="text-xs text-muted-foreground">مشاريع للإعلان</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المشرفين</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.supervisorsToAssign}</div>
              <p className="text-xs text-muted-foreground">مشاريع تحتاج مشرفين</p>
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
                <Link to={ROUTES.PROJECTS_COMMITTEE.PERIODS}>
                  <Calendar className="ml-2 h-4 w-4" />
                  إعلان الفترات الزمنية
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={ROUTES.PROJECTS_COMMITTEE.PROPOSALS}>
                  <FileText className="ml-2 h-4 w-4" />
                  إدارة المقترحات
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={ROUTES.PROJECTS_COMMITTEE.ANNOUNCE_PROJECTS}>
                  <Megaphone className="ml-2 h-4 w-4" />
                  إعلان المشاريع
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={ROUTES.PROJECTS_COMMITTEE.ASSIGN_SUPERVISORS}>
                  <UserPlus className="ml-2 h-4 w-4" />
                  تعيين المشرفين
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={ROUTES.PROJECTS_COMMITTEE.REQUESTS}>
                  <FileCheck className="ml-2 h-4 w-4" />
                  معالجة الطلبات
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={ROUTES.PROJECTS_COMMITTEE.DISTRIBUTE_COMMITTEES}>
                  <Users className="ml-2 h-4 w-4" />
                  توزيع لجان المناقشة
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={ROUTES.PROJECTS_COMMITTEE.REPORTS}>
                  <FileBarChart className="ml-2 h-4 w-4" />
                  إصدار التقارير
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
                {stats.pendingProposals > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10">
                    <span className="text-sm">لديك {stats.pendingProposals} مقترح للمراجعة</span>
                    <Button asChild size="sm" variant="outline">
                      <Link to={ROUTES.PROJECTS_COMMITTEE.PROPOSALS}>
                        مراجعة
                        <ArrowLeft className="mr-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                )}
                {stats.pendingRequests > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-info/10">
                    <span className="text-sm">لديك {stats.pendingRequests} طلب للمعالجة</span>
                    <Button asChild size="sm" variant="outline">
                      <Link to={ROUTES.PROJECTS_COMMITTEE.REQUESTS}>
                        معالجة
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
