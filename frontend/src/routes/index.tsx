import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/common'
import { useAuthStore } from '@/pages/auth/login'
import { ROUTES } from '@/lib/constants'
import { publicRoutes, roleRouteMap } from './config'
import { ProtectedRouteWrapper, RoleBasedRoutesWrapper } from './guards'

function IndexRedirect() {
  const { user } = useAuthStore()

  if (user && user.role) {
    const defaultPath = roleRouteMap[user.role]?.defaultPath
    if (defaultPath) {
      return <Navigate to={defaultPath} replace />
    }
  }

  return <Navigate to={ROUTES.LOGIN} replace />
}

export function RootRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<IndexRedirect />} />

          {/* Public routes */}
          {publicRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<route.element />}
            />
          ))}
          {/* Protected routes - Role-based routing */}
          <Route
            path="*"
            element={
              <ProtectedRouteWrapper>
                <RoleBasedRoutesWrapper />
              </ProtectedRouteWrapper>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
