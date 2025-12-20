import { MainLayout } from '@/layouts/MainLayout'
import { ProposalManagement } from '@/features/student/components/ProposalManagement'

export function ProposalsPage() {

  return (
    <MainLayout>
      <div className="space-y-6">
        <ProposalManagement />
      </div>
    </MainLayout>
  )
}
