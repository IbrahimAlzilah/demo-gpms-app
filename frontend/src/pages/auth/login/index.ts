// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { LoginPage } from './LoginPage'

// Components
export { LoginForm } from './components/LoginForm'

// Hooks
export { useAuth } from './hooks/useAuth'
export { useLogin } from './hooks/useLogin'

// Store (shared across auth features)
export { useAuthStore } from './store/auth.store'

// Types (shared across auth features)
export type {
  LoginCredentials,
  RegisterData,
  User,
  UserRole,
  UserStatus,
  AuthResponse,
  PasswordRecoveryRequest,
  PasswordRecoveryResponse,
  ResetPasswordRequest,
} from './types/auth.types'

// Schemas
export { loginSchema } from './schema/login.schema'
export type { LoginSchema } from './schema/login.schema'

// API Services (for internal use, but exported for flexibility)
export { authService } from './api/auth.service'
