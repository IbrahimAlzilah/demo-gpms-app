import { useState } from 'react'
import { useToast } from '@/components/common'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateRequest } from '../hooks/useRequestOperations'
import { requestSubmissionSchema, type RequestSubmissionSchema } from '../schema'

export function useRequestsNew(onSuccess?: () => void) {
  const { t } = useTranslation()
  const createRequest = useCreateRequest()
  const { toastSuccess, toastError } = useToast()

  const form = useForm<RequestSubmissionSchema>({
    resolver: zodResolver(requestSubmissionSchema(t)),
    defaultValues: {
      type: undefined,
      reason: '',
      projectId: undefined,
    },
  })

  const handleSubmit = async (data: RequestSubmissionSchema) => {
    try {
      await createRequest.mutateAsync({
        type: data.type,
        reason: data.reason.trim(),
        projectId: data.projectId, // Backend will auto-fetch from group if not provided for change_supervisor
      })
      toastSuccess('request.submitSuccess')
      form.reset()
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('request.submitError')
      toastError(errorMessage)
    }
  }

  return {
    form,
    isLoading: createRequest.isPending,
    handleSubmit: form.handleSubmit(handleSubmit),
  }
}
