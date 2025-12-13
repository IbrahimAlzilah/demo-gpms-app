import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { mockAuthService } from '../../../lib/mock/auth.mock'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { ROUTES } from '../../../lib/constants'
import { useToast } from '../../../components/common/NotificationToast'
import { AlertCircle, CheckCircle2, Loader2, Mail, ArrowLeft } from 'lucide-react'

export function PasswordRecoveryForm() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!value) {
      setEmailError(t('auth.validation.emailRequired') || 'البريد الإلكتروني مطلوب')
      return false
    }
    if (!emailRegex.test(value)) {
      setEmailError(t('auth.validation.emailInvalid') || 'البريد الإلكتروني غير صحيح')
      return false
    }
    setEmailError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsSuccess(false)

    if (!validateEmail(email)) {
      return
    }

    setIsLoading(true)

    try {
      const response = await mockAuthService.recoverPassword({ email })
      const successMessage = response.message || t('auth.passwordRecovery.success') || 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني'
      setMessage(successMessage)
      setIsSuccess(true)
      showToast(successMessage, 'success')
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : t('auth.passwordRecovery.error') || 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.'
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
          <h2 className="text-2xl font-bold">{t('auth.passwordRecovery.successTitle') || 'تم إرسال الطلب بنجاح'}</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {message}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {t('auth.passwordRecovery.checkEmail') || 'يرجى التحقق من بريدك الإلكتروني واتباع التعليمات لإعادة تعيين كلمة المرور.'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg border">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">{t('auth.passwordRecovery.emailSentTo') || 'تم الإرسال إلى:'}</p>
                <p className="text-sm text-muted-foreground mt-1">{email}</p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('auth.passwordRecovery.didNotReceive') || 'لم تستلم البريد؟'}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setIsSuccess(false)
                setMessage('')
                setEmail('')
              }}
              className="w-full"
            >
              {t('auth.passwordRecovery.tryAgain') || 'إعادة المحاولة'}
            </Button>
          </div>

          <div className="text-center text-sm pt-4 border-t">
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center gap-2 text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('auth.passwordRecovery.backToLogin') || 'العودة إلى تسجيل الدخول'}
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
        <h2 className="text-2xl font-bold">{t('auth.passwordRecovery.title') || 'استعادة كلمة المرور'}</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {t('auth.passwordRecovery.subtitle') || 'أدخل بريدك الإلكتروني لإرسال رابط إعادة تعيين كلمة المرور'}
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
            onBlur={() => validateEmail(email)}
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

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || !!emailError}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('auth.passwordRecovery.sending') || 'جاري الإرسال...'}
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              {t('auth.passwordRecovery.sendLink') || 'إرسال رابط الاستعادة'}
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
          {t('auth.passwordRecovery.backToLogin') || 'العودة إلى تسجيل الدخول'}
        </Link>
      </div>
    </div>
  )
}

