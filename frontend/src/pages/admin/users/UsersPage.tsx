import { MainLayout } from '@/layouts/MainLayout'
import { UsersList } from './list/UsersList.screen'

export function UsersPage() {
  return (
    <MainLayout>
      <UsersList />
    </MainLayout>
  )
}
