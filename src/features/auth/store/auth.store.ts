import { create } from 'zustand'
import type { User, AuthResponse } from '../types/auth.types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  permissions: string[]
  login: (user: User, token: string, permissions: string[]) => void
  logout: () => void
  setUser: (user: User) => void
  hasPermission: (permission: string) => boolean
  hasRole: (role: User['role']) => boolean
}

// Initialize from localStorage
const getInitialState = (): Partial<AuthState> => {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr) as User
      // Get permissions based on role (simplified - in real app, get from token)
      const permissions: Record<User['role'], string[]> = {
        student: ['view:own_projects', 'submit:proposals', 'submit:requests', 'upload:documents'],
        supervisor: [
          'view:assigned_projects',
          'evaluate:projects',
          'approve:supervision_requests',
          'manage:project_progress',
        ],
        discussion_committee: ['view:assigned_projects', 'evaluate:final_discussion'],
        projects_committee: [
          'manage:proposals',
          'manage:projects',
          'assign:supervisors',
          'process:requests',
          'distribute:committees',
          'generate:reports',
          'announce:periods',
        ],
        admin: ['*'],
      }
      return {
        user,
        token,
        isAuthenticated: true,
        permissions: permissions[user.role] || [],
      }
    } catch {
      // Invalid user data, clear it
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
  
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    permissions: [],
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ...getInitialState(),
  login: (user, token, permissions) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true, permissions })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false, permissions: [] })
  },
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },
  hasPermission: (permission) => {
    const { permissions } = get()
    return permissions.includes(permission) || permissions.includes('*')
  },
  hasRole: (role) => {
    const { user } = get()
    return user?.role === role
  },
  initialize: () => {
    set(getInitialState())
  },
}))

