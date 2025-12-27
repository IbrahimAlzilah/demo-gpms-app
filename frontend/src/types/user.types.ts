import type { BaseEntity } from './common.types'

export type UserRole =
  | 'student'
  | 'supervisor'
  | 'discussion_committee'
  | 'projects_committee'
  | 'admin'

export type UserStatus = 'active' | 'inactive' | 'suspended'

export interface User extends BaseEntity {
  email: string
  name: string
  role: UserRole
  status: UserStatus
  studentId?: string
  department?: string
  phone?: string
}

export interface AuthResponse {
  token: string
  user: User
  permissions: string[]
}

export interface PasswordRecoveryRequest {
  email: string
}

export interface PasswordRecoveryResponse {
  message: string
  resetToken?: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
  confirmPassword: string
}

