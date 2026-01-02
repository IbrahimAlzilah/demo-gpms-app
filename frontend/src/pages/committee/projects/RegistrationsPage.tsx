import { MainLayout } from '../../../layouts/MainLayout'
import { RegistrationManagementPanel } from '../../../features/projects-committee/components/RegistrationManagementPanel'

export function RegistrationsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">إدارة طلبات التسجيل</h1>
          <p className="text-muted-foreground">
            مراجعة واعتماد أو رفض طلبات تسجيل الطلاب في المشاريع
          </p>
        </div>
        <RegistrationManagementPanel />
      </div>
    </MainLayout>
  )
}
