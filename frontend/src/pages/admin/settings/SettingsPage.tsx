import { MainLayout } from '@/layouts/MainLayout'
import { SettingsListScreen } from './list/SettingsList.screen'

export function SettingsPage() {
  return (
    <MainLayout>
      <SettingsListScreen />
    </MainLayout>
  )
}
