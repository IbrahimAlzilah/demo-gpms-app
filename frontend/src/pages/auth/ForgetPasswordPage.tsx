import { AuthLayout } from '@/layouts/AuthLayout'
import { ForgetPasswordForm } from '@/features/auth/components/ForgetPasswordForm'

export function PasswordRecoveryPage() {
  return (
    <AuthLayout>
      <ForgetPasswordForm />
    </AuthLayout>
  )
}

