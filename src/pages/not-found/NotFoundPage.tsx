import { useTranslation } from 'react-i18next'

export function NotFoundPage() {
  const { t } = useTranslation()
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">{t('error.notFound.title')}</h1>
      </div>
    </div>
  )
}

