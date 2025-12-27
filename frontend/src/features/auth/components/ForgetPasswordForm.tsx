import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { mockAuthService } from '@/lib/mock/auth.mock'
import { Button, Input, Label } from '@/components/ui'
import { ROUTES } from '@/lib/constants'
import { useToast } from '@/components/common/NotificationToast'
import { AlertCircle, CheckCircle2, Loader2, Mail, ArrowLeft } from 'lucide-react'
import { forgetPasswordSchema, type ForgetPasswordSchema } from '../schema'

export function ForgetPasswordForm() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgetPasswordSchema>({
    resolver: zodResolver(forgetPasswordSchema(t)),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgetPasswordSchema) => {
    setError('')
    setMessage('')
    setIsSuccess(false)
    setIsLoading(true)
    setSubmittedEmail(data.email)

    try {
      const response = await mockAuthService.recoverPassword({ email: data.email })
      const successMessage = response.message || t('auth.forgetPassword.success')
      setMessage(successMessage)
      setIsSuccess(true)
      showToast(successMessage, 'success')
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : t('auth.forgetPassword.error')
      setError(errorMessage)
      setIsSuccess(false)
      showToast(errorMessage, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="w-full space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-success/10 p-3">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">{t('auth.forgetPassword.successTitle')}</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {message}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {t('auth.forgetPassword.checkEmail')}
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg border">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 flex items-center gap-2">
                <p className="text-sm font-medium">{t('auth.forgetPassword.emailSentTo')}</p>
                <p className="text-sm text-muted-foreground">{submittedEmail}</p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('auth.forgetPassword.didNotReceive')}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setIsSuccess(false)
                setMessage('')
                setSubmittedEmail('')
              }}
              className="w-full"
            >
              {t('auth.forgetPassword.tryAgain')}
            </Button>
          </div>

          <div className="text-center text-sm pt-4 border-t">
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center gap-2 text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('auth.forgetPassword.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">{t('auth.forgetPassword.title')}</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {t('auth.forgetPassword.subtitle')}
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

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || isSubmitting}
        >
          {isLoading || isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('auth.forgetPassword.sending')}
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              {t('auth.forgetPassword.sendLink')}
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-sm pt-4 border-t">
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-2 text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('auth.forgetPassword.backToLogin')}
        </Link>
      </div>
    </div>
  );
}
