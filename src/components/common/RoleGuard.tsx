import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/store/auth.store'
import type { UserRole } from '../../types/user.types'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallbackPath?: string
}

export function RoleGuard({
  children,
  allowedRoles,
  fallbackPath = '/unauthorized',
}: RoleGuardProps) {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />
  }

  return <>{children}</>
}

