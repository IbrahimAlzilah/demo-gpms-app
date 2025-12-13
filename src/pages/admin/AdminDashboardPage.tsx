import { MainLayout } from '../../layouts/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { useAuthStore } from '../../features/auth/store/auth.store'
import { ROUTES } from '../../lib/constants'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Users, FileBarChart, ArrowLeft } from 'lucide-react'

export function AdminDashboardPage() {
  const { user } = useAuthStore()

  // Mock data - in real app, fetch from API
  const stats = {
    totalUsers: 150,
    activeUsers: 120,
    totalProjects: 45,
    totalProposals: 78,
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم مدير النظام</h1>
          <p className="text-muted-foreground mt-2">
            مرحباً {user?.name}، هذه نظرة عامة على النظام
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">{stats.activeUsers} نشط</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المشاريع</CardTitle>
              <FileBarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">مشاريع مسجلة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المقترحات</CardTitle>
              <FileBarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProposals}</div>
              <p className="text-xs text-muted-foreground">مقترحات مقدمة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">حالة النظام</CardTitle>
              <FileBarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">مستقر</div>
              <p className="text-xs text-muted-foreground">جميع الأنظمة تعمل</p>
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
              <Link to={ROUTES.ADMIN.USERS}>
                <Users className="ml-2 h-4 w-4" />
                إدارة المستخدمين
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to={ROUTES.ADMIN.REPORTS}>
                <FileBarChart className="ml-2 h-4 w-4" />
                إصدار التقارير
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
