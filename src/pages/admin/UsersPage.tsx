import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../layouts/MainLayout'
import { UserManagement } from '../../features/admin/components/UserManagement'
import { Users } from 'lucide-react'

export function UsersPage() {
  const { t } = useTranslation()

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            {t('nav.users') || 'إدارة المستخدمين'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('admin.usersDescription') || 'التحكم الكامل في حسابات المستخدمين وإدارة صلاحياتهم'}
          </p>
        </div>
        <UserManagement />
      </div>
    </MainLayout>
  )
}

