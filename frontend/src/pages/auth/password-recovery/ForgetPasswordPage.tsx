import { AuthLayout } from '@/layouts/AuthLayout'
import { ForgetPasswordForm } from './components/ForgetPasswordForm'

export function PasswordRecoveryPage() {
  return (
    <AuthLayout>
      <ForgetPasswordForm />
    </AuthLayout>
  )
}
