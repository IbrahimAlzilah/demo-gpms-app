import { MainLayout } from '@/layouts/MainLayout'
import { RequestManagement } from '@/features/student/components/RequestManagement'

export function RequestsPage() {

  return (
    <MainLayout>
      <div className="space-y-6">
        <RequestManagement />
      </div>
    </MainLayout>
  )
}
