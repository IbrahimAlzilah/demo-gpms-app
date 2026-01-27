import { useTranslation } from 'react-i18next'
import { CheckCircle2, XCircle, Info, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils'

interface DocumentGuidanceProps {
  isPhase1Active: boolean
  isPhase2Active: boolean
  isFinalActive: boolean
  hasProject: boolean
  t: (key: string) => string
}

export function DocumentGuidance({
  isPhase1Active,
  isPhase2Active,
  isFinalActive,
  hasProject,
  t,
}: DocumentGuidanceProps) {
  const isAnyPeriodActive = isPhase1Active || isPhase2Active || isFinalActive

  const steps = [
    {
      title: t('document.guidance.step1.title'),
      description: hasProject
        ? t('document.guidance.step1.active')
        : t('document.guidance.step1.inactive'),
      status: hasProject ? 'success' : 'error',
    },
    {
      title: t('document.guidance.step2.title'),
      description: isAnyPeriodActive
        ? t('document.guidance.step2.active')
        : t('document.guidance.step2.closed'),
      status: isAnyPeriodActive ? 'success' : 'error',
      info: isPhase1Active
        ? t('document.guidance.step2.phase1')
        : isPhase2Active
          ? t('document.guidance.step2.phase2')
          : isFinalActive
            ? t('document.guidance.step2.final')
            : undefined,
    },
  ]

  return (
    <Card className="bg-muted/50 border-none shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm text-primary">{t('document.guidance.title')}</h4>
        </div>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'h-6 w-6 rounded-full flex items-center justify-center border-2 text-[10px] font-bold',
                    step.status === 'success' &&
                    'bg-green-100 border-green-600 text-green-700 dark:bg-green-900/30 dark:border-green-500 dark:text-green-400',
                    step.status === 'error' &&
                    'bg-destructive/10 border-destructive text-destructive',
                    step.status === 'neutral' &&
                    'bg-gray-100 border-gray-300 text-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400'
                  )}
                >
                  {step.status === 'success' ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : step.status === 'error' ? (
                    <XCircle className="h-3 w-3" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 min-h-[1.5rem] flex-1 bg-gray-200 dark:bg-gray-700 my-1" />
                )}
              </div>
              <div className="pb-1 flex-1">
                <p className="text-sm font-medium leading-none mb-1">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
                {step.info && (
                  <p className="text-[10px] text-muted-foreground/80 mt-1 italic">
                    {step.info}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
