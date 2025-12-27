import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../lib/constants'

export function UnauthorizedPage() {
  const { t } = useTranslation()
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">{t('error.unauthorized.title')}</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          {t('error.unauthorized.heading')}
        </h2>
        <p className="text-muted-foreground mb-8">
          {t('error.unauthorized.message')}
        </p>
        <Link
          to={ROUTES.HOME}
          className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          {t('error.unauthorized.backHome')}
        </Link>
      </div>
    </div>
  )
}

