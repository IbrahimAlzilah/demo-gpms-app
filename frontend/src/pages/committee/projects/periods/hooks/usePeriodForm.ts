import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { timePeriodSchema, type TimePeriodSchema } from '../schema'
import type { TimePeriod } from '@/types/period.types'

export interface UsePeriodFormOptions {
  defaultValues?: Partial<TimePeriodSchema>
  onSubmit?: (data: TimePeriodSchema) => Promise<void>
}

/**
 * Hook for managing period form state and validation
 */
export function usePeriodForm(options: UsePeriodFormOptions = {}) {
  const { t } = useTranslation()
  const [error, setError] = useState('')

  const form = useForm<TimePeriodSchema>({
    resolver: zodResolver(timePeriodSchema(t)),
    defaultValues: {
      name: '',
      type: 'general',
      startDate: '',
      endDate: '',
      academicYear: '',
      semester: '',
      ...options.defaultValues,
    },
  })

  const handleSubmit = async (data: TimePeriodSchema) => {
    setError('')

    try {
      await options.onSubmit?.(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('committee.periods.submitError'))
    }
  }

  const resetForm = () => {
    form.reset()
    setError('')
  }

  return {
    form,
    error,
    setError,
    handleSubmit: form.handleSubmit(handleSubmit),
    resetForm,
    watch: form.watch,
    setValue: form.setValue,
  } as const
}

export type UsePeriodFormReturn = ReturnType<typeof usePeriodForm>
