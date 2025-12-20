import { MainLayout } from '@/layouts/MainLayout'
import { DocumentManagement } from '@/features/student/components/DocumentManagement'

export function DocumentsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <DocumentManagement />
      </div>
    </MainLayout>
  )
}
