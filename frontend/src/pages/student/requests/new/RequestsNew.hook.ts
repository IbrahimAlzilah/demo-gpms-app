import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateRequest } from '../hooks/useRequestOperations'
import { requestSubmissionSchema, type RequestSubmissionSchema } from '@/features/student/schema'

export function useRequestsNew(onSuccess?: () => void) {
  const { t } = useTranslation()
  const createRequest = useCreateRequest()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const form = useForm<RequestSubmissionSchema>({
    resolver: zodResolver(requestSubmissionSchema(t)),
    defaultValues: {
      type: undefined,
      reason: '',
      projectId: undefined,
    },
  })

  const handleSubmit = async (data: RequestSubmissionSchema) => {
    setError('')
    setSuccess(false)

    try {
      await createRequest.mutateAsync({
        type: data.type,
        reason: data.reason.trim(),
        projectId: data.projectId,
      })
      setSuccess(true)
      form.reset()
      setTimeout(() => {
        onSuccess?.()
      }, 2000)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('request.submitError')
      )
    }
  }

  return {
    form,
    error,
    success,
    isLoading: createRequest.isPending,
    handleSubmit: form.handleSubmit(handleSubmit),
  }
}
