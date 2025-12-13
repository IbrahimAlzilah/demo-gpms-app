import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { usePeriods, useCreatePeriod } from '../hooks/usePeriods'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { useToast } from '../../../components/common/NotificationToast'
import { AlertCircle, CheckCircle2, Calendar, Loader2 } from 'lucide-react'
import { formatDate } from '../../../lib/utils/format'
import { StatusBadge } from '../../../components/common/StatusBadge'
import type { PeriodType } from '../../../types/period.types'

interface PeriodFormData {
  name: string
  type: PeriodType
  startDate: string
  endDate: string
  academicYear?: string
  semester?: string
}

export function TimePeriodManager() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const { data: periods, isLoading } = usePeriods()
  const createPeriod = useCreatePeriod()
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<PeriodFormData>()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const selectedType = watch('type')

  const onSubmit = async (data: PeriodFormData) => {
    setError('')
    setSuccess(false)

    if (new Date(data.startDate) >= new Date(data.endDate)) {
      const errorMsg = t('committee.periods.invalidDateRange') || 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      return
    }

    try {
      await createPeriod.mutateAsync({
        ...data,
        isActive: true,
        createdBy: '', // Will be set by service
      })
      setSuccess(true)
      showToast(t('committee.periods.periodCreated') || 'تم إعلان الفترة الزمنية بنجاح', 'success')
      reset()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('committee.periods.createError') || 'فشل إنشاء الفترة'
      setError(errorMsg)
      showToast(errorMsg, 'error')
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  const periodTypeOptions = [
    { value: 'proposal_submission', label: t('committee.periods.types.proposalSubmission') || 'تقديم المقترحات' },
    { value: 'project_registration', label: t('committee.periods.types.projectRegistration') || 'التسجيل في المشاريع' },
    { value: 'document_submission', label: t('committee.periods.types.documentSubmission') || 'تسليم الوثائق' },
    { value: 'supervisor_evaluation', label: t('committee.periods.types.supervisorEvaluation') || 'تقييم المشرف' },
    { value: 'committee_evaluation', label: t('committee.periods.types.committeeEvaluation') || 'تقييم اللجنة' },
    { value: 'final_discussion', label: t('committee.periods.types.finalDiscussion') || 'المناقشة النهائية' },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {t('committee.periods.createNew') || 'إعلان فترة زمنية جديدة'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 p-3 text-sm text-success bg-success/10 border border-success/20 rounded-md">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{t('committee.periods.periodCreated') || 'تم إعلان الفترة الزمنية بنجاح'}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">{t('committee.periods.name') || 'اسم الفترة'} *</Label>
              <Input
                id="name"
                {...register('name', { required: t('committee.periods.nameRequired') || 'اسم الفترة مطلوب' })}
                placeholder={t('committee.periods.namePlaceholder') || 'مثال: فترة تقديم المقترحات'}
              />
              {errors.name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">{t('committee.periods.type') || 'نوع الفترة'} *</Label>
              <Select
                onValueChange={(value: PeriodType) => setValue('type', value)}
                defaultValue=""
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder={t('committee.periods.selectType') || 'اختر نوع الفترة'} />
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
                <Label htmlFor="startDate">{t('committee.periods.startDate') || 'تاريخ البداية'} *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate', { required: t('committee.periods.startDateRequired') || 'تاريخ البداية مطلوب' })}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">{t('committee.periods.endDate') || 'تاريخ النهاية'} *</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate', { required: t('committee.periods.endDateRequired') || 'تاريخ النهاية مطلوب' })}
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
                t('committee.periods.announcePeriod') || 'إعلان الفترة'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {periods && periods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('committee.periods.currentPeriods') || 'الفترات الزمنية الحالية'}</CardTitle>
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
                    {t('committee.periods.type')}: {periodTypeOptions.find(opt => opt.value === period.type)?.label || period.type}
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

