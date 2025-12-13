import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../store/auth.store'
import { mockAuthService } from '../../../lib/mock/auth.mock'
import { Button, Input, Label } from '../../../components/ui'
import { ROUTES } from '../../../lib/constants'
import { useToast } from '../../../components/common/NotificationToast'
import { AlertCircle, Eye, EyeOff, Loader2, LogIn } from 'lucide-react'
import type { LoginCredentials } from '../types/auth.types'

export function LoginForm() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: Location })?.from?.pathname || '/'

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!value) {
      setEmailError(t('auth.validation.emailRequired'))
      return false
    }
    if (!emailRegex.test(value)) {
      setEmailError(t('auth.validation.emailInvalid'))
      return false
    }
    setEmailError('')
    return true
  }

  const validatePassword = (value: string): boolean => {
    if (!value) {
      setPasswordError(t('auth.validation.passwordRequired'))
      return false
    }
    if (value.length < 6) {
      setPasswordError(t('auth.validation.passwordMinLength'))
      return false
    }
    setPasswordError('')
    return true
  }

  const handleEmailBlur = () => {
    validateEmail(email)
  }

  const handlePasswordBlur = () => {
    validatePassword(password)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)

    if (!isEmailValid || !isPasswordValid) {
      return
    }

    setIsLoading(true)

    try {
      const credentials: LoginCredentials = { email, password }
      const response = await mockAuthService.login(credentials)
      login(response.user, response.token, response.permissions)

      // Redirect based on role
      const roleRoutes: Record<string, string> = {
        student: ROUTES.STUDENT.DASHBOARD,
        supervisor: ROUTES.SUPERVISOR.DASHBOARD,
        discussion_committee: ROUTES.DISCUSSION_COMMITTEE.DASHBOARD,
        projects_committee: ROUTES.PROJECTS_COMMITTEE.DASHBOARD,
        admin: ROUTES.ADMIN.DASHBOARD,
      }

      const redirectPath = roleRoutes[response.user.role] || from
      showToast(t('auth.loginSuccess'), 'success')
      navigate(redirectPath, { replace: true })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('auth.loginError')
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <img src="/src/assets/logo2.png" alt="GPMS Logo" className="h-16 w-16 object-contain" />
        </div>
        <h2 className="text-2xl font-bold">{t('auth.login')}</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {t('auth.loginSubtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">{t('common.email')}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (emailError) setEmailError('')
            }}
            onBlur={handleEmailBlur}
            required
            disabled={isLoading}
            placeholder={t('auth.emailPlaceholder')}
            className={emailError ? 'border-destructive focus-visible:ring-destructive' : ''}
            aria-invalid={!!emailError}
            aria-describedby={emailError ? 'email-error' : undefined}
          />
          {emailError && (
            <p id="email-error" className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {emailError}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('common.password')}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (passwordError) setPasswordError('')
              }}
              onBlur={handlePasswordBlur}
              required
              disabled={isLoading}
              placeholder={t('auth.passwordPlaceholder')}
              className={passwordError ? 'border-destructive focus-visible:ring-destructive pe-10' : 'pe-10'}
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? 'password-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordError && (
            <p id="password-error" className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {passwordError}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Link
            to="/recover-password"
            className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !!emailError || !!passwordError || !email || !password}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('auth.loggingIn')}
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              {t('auth.login')}
            </>
          )}
        </Button>
      </form>
    </div>
  )
}

