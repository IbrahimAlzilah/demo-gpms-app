import { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { LoadingSpinner } from '@/components/common'
import { useAuthStore } from '@/pages/auth/login'
import { ROUTES } from '@/lib/constants'
import { roleRouteMap } from './config'
import { LazyNotFoundPage } from './lazy'
import type { UserRole } from '@/types/user.types'

interface ProtectedRouteWrapperProps {
  children: React.ReactNode
}

export function ProtectedRouteWrapper({ children }: ProtectedRouteWrapperProps) {
  return (
    <ProtectedRoute>
      <Suspense fallback={<LoadingSpinner />}>
        {children}
      </Suspense>
    </ProtectedRoute>
  )
}

interface RoleBasedRoutesProps {
  role: UserRole
}

export function RoleBasedRoutes({ role }: RoleBasedRoutesProps) {
  const routeConfig = roleRouteMap[role]

  if (!routeConfig) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />
  }

  return (
    <Routes>
      {routeConfig.routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<route.element />}
        />
      ))}
      <Route
        path="*"
        element={<LazyNotFoundPage />}
      />
    </Routes>
  )
}

export function RoleBasedRoutesWrapper() {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RoleBasedRoutes role={user.role} />
    </Suspense>
  )
}

