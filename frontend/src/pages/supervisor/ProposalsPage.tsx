import { MainLayout } from '@/layouts/MainLayout'
import { SupervisorProposalManagement } from '@/features/supervisor/components/ProposalManagement'

export function SupervisorProposalsPage() {
  return (
    <MainLayout>
      <SupervisorProposalManagement />
    </MainLayout>
  )
}
