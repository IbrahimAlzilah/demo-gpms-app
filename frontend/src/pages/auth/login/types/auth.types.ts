export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData extends LoginCredentials {
  name: string
}

// Re-export user types from domain types
export type {
  User,
  UserRole,
  UserStatus,
  AuthResponse,
  PasswordRecoveryRequest,
  PasswordRecoveryResponse,
  ResetPasswordRequest,
} from '../../../../types/user.types'
