import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '../store/auth.store'
import { authService } from '../api/auth.service'
import { Button, Input, Label } from '@/components/ui'
import { ROUTES } from '@/lib/constants'
import { useToast } from '@/components/common/NotificationToast'
import { AlertCircle, Eye, EyeOff, Loader2, LogIn } from 'lucide-react'
import { authSchema, type AuthSchema } from '../schema'
import logo from '@/assets/logo2.png'

export function LoginForm() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: Location })?.from?.pathname || '/'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthSchema>({
    resolver: zodResolver(authSchema(t)),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: AuthSchema) => {
    setError('')
    setIsLoading(true)

    try {
      const response = await authService.login(data)
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
          <img src={logo} alt="GPMS Logo" className="h-16 w-16 object-contain" />
        </div>
        <h2 className="text-2xl font-bold">{t('auth.login')}</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {t('auth.loginSubtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            {...register('email')}
            disabled={isLoading || isSubmitting}
            placeholder={t('auth.emailPlaceholder')}
            className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('common.password')}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              disabled={isLoading || isSubmitting}
              placeholder={t('auth.passwordPlaceholder')}
              className={errors.password ? 'border-destructive focus-visible:ring-destructive pe-10' : 'pe-10'}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
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
          {errors.password && (
            <p id="password-error" className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.password.message}
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
          disabled={isLoading || isSubmitting}
        >
          {isLoading || isSubmitting ? (
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

