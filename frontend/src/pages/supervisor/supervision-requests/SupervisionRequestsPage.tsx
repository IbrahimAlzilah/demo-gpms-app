import { MainLayout } from '@/layouts/MainLayout'
import { AssignmentRequestsList } from './list/AssignmentRequestsList.screen'

export function SupervisionRequestsPage() {
  return (
    <MainLayout>
      <AssignmentRequestsList />
    </MainLayout>
  )
}
