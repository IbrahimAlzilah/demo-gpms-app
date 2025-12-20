import { MainLayout } from '@/layouts/MainLayout'
import { SupervisionRequestsList } from '@/features/supervisor/components/SupervisionRequestsList'

export function SupervisionRequestsPage() {

  return (
    <MainLayout>
      <SupervisionRequestsList />
    </MainLayout>
  )
}

