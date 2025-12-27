import type { ComponentType, LazyExoticComponent } from 'react'
import type { UserRole } from '@/types/user.types'

export interface RouteConfig {
  path: string
  element: LazyExoticComponent<ComponentType<unknown>>
  index?: boolean
}

export interface RoleRouteConfig {
  role: UserRole
  routes: RouteConfig[]
  defaultPath: string
}

export interface PublicRouteConfig extends RouteConfig {
  public: true
}

