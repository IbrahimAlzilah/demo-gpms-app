import { MainLayout } from '@/layouts/MainLayout'
import { RequestsList } from './list/RequestsList.screen'

export function CommitteeRequestsPage() {
  return (
    <MainLayout>
      <RequestsList />
    </MainLayout>
  )
}
