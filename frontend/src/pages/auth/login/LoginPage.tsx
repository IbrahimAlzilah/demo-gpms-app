import { AuthLayout } from '@/layouts/AuthLayout'
import { LoginForm } from './components/LoginForm'

export function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
