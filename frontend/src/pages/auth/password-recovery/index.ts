// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { PasswordRecoveryPage } from './ForgetPasswordPage'

// Components
export { ForgetPasswordForm } from './components/ForgetPasswordForm'

// Hooks
export { usePasswordRecovery, useResetPassword } from './hooks/usePasswordRecovery'

// Schemas
export { forgetPasswordSchema } from './schema/password-recovery.schema'
export type { ForgetPasswordSchema } from './schema/password-recovery.schema'

// API Services (for internal use, but exported for flexibility)
export { authService } from './api/auth.service'
