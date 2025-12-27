import { MainLayout } from '@/layouts/MainLayout'
import { GroupManagement } from '@/features/student/components/GroupManagement'
import { useTranslation } from 'react-i18next'
import { BlockContent } from '@/components/common'

export function GroupsPage() {
  const { t } = useTranslation()
  return (
    <MainLayout>
      <BlockContent title={t('group.management')}>
        <GroupManagement />
      </BlockContent>
    </MainLayout>
  )
}
