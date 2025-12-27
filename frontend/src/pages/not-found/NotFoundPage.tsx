import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { ROUTES } from '@/lib/constants'
import { roleRouteMap } from '@/routes/config'

export function NotFoundPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const getDefaultPath = () => {
    if (!user) return ROUTES.LOGIN
    const routeConfig = roleRouteMap[user.role as keyof typeof roleRouteMap]
    return routeConfig?.defaultPath || ROUTES.LOGIN
  }

  const handleGoHome = () => {
    navigate(getDefaultPath())
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-muted/50 via-background to-muted/30 p-4">
      <Card className="w-full max-w-2xl border-none shadow-none">
        <CardContent className="p-8 md:p-12">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* 404 Number with Icon */}
            <div className="relative">
              <div className="text-9xl md:text-[12rem] font-bold text-primary/20 select-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FileQuestion className="h-24 w-24 md:h-32 md:w-32 text-primary/60" />
              </div>
            </div>

            {/* Title and Message */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {t('error.notFound.title')}
              </h1>
              <h2 className="text-xl md:text-xl font-semibold text-foreground/80">
                {t('error.notFound.heading')}
              </h2>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
              <Button
                onClick={handleGoHome}
                size="lg"
                className="w-full sm:w-auto min-w-[160px]"
              >
                <Home className="h-4 w-4 mr-2" />
                {t('error.notFound.backHome')}
              </Button>
              <Button
                onClick={handleGoBack}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto min-w-[160px]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('error.notFound.back')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

