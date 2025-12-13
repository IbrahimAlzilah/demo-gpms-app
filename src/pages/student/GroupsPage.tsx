import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../app/layouts/MainLayout'
import { GroupManagement } from '../../features/student/components/GroupManagement'
import { Users } from 'lucide-react'

export function GroupsPage() {
  const { t } = useTranslation()
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            {t('nav.groups') || 'إدارة المجموعة'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('group.pageDescription') || 'قم بإنشاء مجموعة جديدة، الانضمام إليها، دعوة زملاء، أو المغادرة'}
          </p>
        </div>
        <GroupManagement />
      </div>
    </MainLayout>
  )
}
