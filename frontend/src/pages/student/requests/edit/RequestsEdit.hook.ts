import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateRequest } from '../hooks/useRequestOperations'
import { requestSubmissionSchema, type RequestSubmissionSchema } from '../schema'
import type { Request } from '@/types/request.types'

export function useRequestsEdit(request: Request | null, onSuccess?: () => void) {
  const { t } = useTranslation()
  const updateRequest = useUpdateRequest()
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

  // Update form when request changes
  useEffect(() => {
    if (request) {
      form.reset({
        type: request.type as "change_supervisor" | "change_group" | "change_project" | "other",
        reason: request.reason || '',
        projectId: request.projectId || undefined,
      })
    } else {
      form.reset({
        type: undefined,
        reason: '',
        projectId: undefined,
      })
    }
  }, [request])

  const handleSubmit = async (data: RequestSubmissionSchema) => {
    if (!request) return

    setError('')
    setSuccess(false)

    try {
      await updateRequest.mutateAsync({
        id: request.id,
        data: {
          type: data.type,
          reason: data.reason.trim(),
          projectId: data.projectId,
        },
      })
      setSuccess(true)
      // Close modal after a short delay
      setTimeout(() => {
        onSuccess?.()
      }, 1500)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('request.updateError')
      )
    }
  }

  return {
    form,
    error,
    success,
    isLoading: updateRequest.isPending,
    handleSubmit: form.handleSubmit(handleSubmit),
  }
}
