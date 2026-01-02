import { MainLayout } from '@/layouts/MainLayout'
import { RequestsList } from './list/RequestsList.screen'

export function RequestsPage() {
  return (
    <MainLayout>
      <RequestsList />
    </MainLayout>
  )
}
