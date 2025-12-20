import { MainLayout } from '@/layouts/MainLayout'
import { AssignedProjectsList } from '@/features/discussion-committee/components/AssignedProjectsList'

export function DiscussionProjectsPage() {

  return (
    <MainLayout>
      <AssignedProjectsList />
    </MainLayout>
  )
}

