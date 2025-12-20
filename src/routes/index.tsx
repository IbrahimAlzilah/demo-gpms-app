import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/common'
import { publicRoutes } from './config'
import { ProtectedRouteWrapper, RoleBasedRoutesWrapper } from './guards'

export function RootRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
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
