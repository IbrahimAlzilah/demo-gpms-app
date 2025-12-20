import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePeriods, useCreatePeriod } from '../hooks/usePeriods'
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { useToast } from '@/components/common'
import { AlertCircle, CheckCircle2, Calendar, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import { StatusBadge } from '@/components/common'
import { timePeriodSchema, type TimePeriodSchema } from '../schema'
import type { PeriodType } from '@/types/period.types'

export function TimePeriodManager() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const { data: periods, isLoading } = usePeriods()
  const createPeriod = useCreatePeriod()
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<TimePeriodSchema>({
    resolver: zodResolver(timePeriodSchema(t)),
    defaultValues: {
      name: '',
      type: undefined as PeriodType | undefined,
      startDate: '',
      endDate: '',
      academicYear: '',
      semester: '',
    },
  })
  const [success, setSuccess] = useState(false)

  const onSubmit = async (data: TimePeriodSchema) => {
    setSuccess(false)

    try {
      await createPeriod.mutateAsync({
        ...data,
        isActive: true,
      })
      setSuccess(true)
      showToast(t('committee.periods.periodCreated'), 'success')
      reset()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('committee.periods.createError')
      showToast(errorMsg, 'error')
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  const periodTypeOptions = [
    { value: 'proposal_submission', label: t('committee.periods.types.proposalSubmission') },
    { value: 'project_registration', label: t('committee.periods.types.projectRegistration') },
    { value: 'document_submission', label: t('committee.periods.types.documentSubmission') },
    { value: 'supervisor_evaluation', label: t('committee.periods.types.supervisorEvaluation') },
    { value: 'committee_evaluation', label: t('committee.periods.types.committeeEvaluation') },
    { value: 'final_discussion', label: t('committee.periods.types.finalDiscussion') },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {t('committee.periods.createNew')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {success && (
              <div className="flex items-start gap-2 p-3 text-sm text-success bg-success/10 border border-success/20 rounded-md">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{t('committee.periods.periodCreated')}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">{t('committee.periods.name')} *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder={t('committee.periods.namePlaceholder')}
                className={errors.name ? 'border-destructive' : ''}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">{t('committee.periods.type')} *</Label>
              <Select
                onValueChange={(value) => setValue('type', value as TimePeriodSchema['type'])}
                defaultValue=""
              >
                <SelectTrigger
                  id="type"
                  className={errors.type ? 'border-destructive' : ''}
                >
                  <SelectValue placeholder={t('committee.periods.selectType')} />
                </SelectTrigger>
                <SelectContent>
                  {periodTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.type.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">{t('committee.periods.startDate')} *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                  className={errors.startDate ? 'border-destructive' : ''}
                  aria-invalid={!!errors.startDate}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">{t('committee.periods.endDate')} *</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate')}
                  className={errors.endDate ? 'border-destructive' : ''}
                  aria-invalid={!!errors.endDate}
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={createPeriod.isPending}
              className="w-full"
            >
              {createPeriod.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                t('committee.periods.announcePeriod')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {periods && periods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('committee.periods.currentPeriods')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {periods.map((period) => (
                <div key={period.id} className="p-4 bg-muted rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium">{period.name}</p>
                    <StatusBadge status={period.isActive ? 'active' : 'inactive'} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(period.startDate)} - {formatDate(period.endDate)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('committee.periods.type')}: {periodTypeOptions.find(opt => opt.value === period.type)?.label}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

