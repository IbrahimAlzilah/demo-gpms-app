import { AuthLayout } from '../../layouts/AuthLayout'
import { PasswordRecoveryForm } from '../../features/auth/components/PasswordRecoveryForm'

export function PasswordRecoveryPage() {
  return (
    <AuthLayout>
      <PasswordRecoveryForm />
    </AuthLayout>
  )
}

