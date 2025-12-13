import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../features/auth/store/auth.store'
import { ROUTES } from '../../lib/constants'
import { AuthLayout } from '../../layouts/AuthLayout'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { useToast } from '../../components/common/NotificationToast'
import { LogOut, CheckCircle2 } from 'lucide-react'

export function LogoutPage() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(true)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Clear auth state
        logout()

        // Clear any cached data
        if (window.localStorage) {
          // Clear only auth-related items, keep preferences
          const keysToRemove: string[] = []
          for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i)
            if (key && (key.includes('auth') || key.includes('token') || key.includes('user'))) {
              keysToRemove.push(key)
            }
          }
          keysToRemove.forEach(key => window.localStorage.removeItem(key))
        }

        // Clear session storage
        if (window.sessionStorage) {
          window.sessionStorage.clear()
        }

        // Small delay to show loading state
        await new Promise((resolve) => setTimeout(resolve, 800))

        setIsComplete(true)
        showToast(t('auth.logoutSuccess') || 'تم تسجيل الخروج بنجاح', 'success')

        // Navigate to login after a brief moment
        setTimeout(() => {
          navigate(ROUTES.LOGIN, { replace: true })
        }, 500)
      } catch (error) {
        console.error('Logout error:', error)
        // Even if there's an error, navigate to login
        navigate(ROUTES.LOGIN, { replace: true })
      } finally {
        setIsLoggingOut(false)
      }
    }

    performLogout()
  }, [logout, navigate, showToast, t])

  return (
    <AuthLayout>
      <div className="flex flex-col items-center justify-center space-y-4 min-h-[400px]">
        {isComplete ? (
          <>
            <div className="rounded-full bg-success/10 p-4">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <p className="text-muted-foreground text-center font-medium">
              {t('auth.logoutSuccess') || 'تم تسجيل الخروج بنجاح'}
            </p>
            <p className="text-sm text-muted-foreground text-center">
              {t('auth.logoutMessage') || 'نأمل أن نراك قريباً'}
            </p>
          </>
        ) : (
          <>
            <div className="rounded-full bg-primary/10 p-4">
              <LogOut className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <LoadingSpinner />
            <p className="text-muted-foreground text-center">
              {t('auth.loggingOut') || 'جاري تسجيل الخروج...'}
            </p>
            <p className="text-sm text-muted-foreground text-center">
              {t('auth.logoutMessage') || 'نأمل أن نراك قريباً'}
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  )
}

