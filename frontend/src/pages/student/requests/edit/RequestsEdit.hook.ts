import { useEffect } from 'react'
import { useToast } from '@/components/common'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateRequest } from '../hooks/useRequestOperations'
import { requestSubmissionSchema, type RequestSubmissionSchema } from '../schema'
import type { Request } from '@/types/request.types'

export function useRequestsEdit(request: Request | null, onSuccess?: () => void) {
  const { t } = useTranslation()
  const updateRequest = useUpdateRequest()
  const { toastSuccess, toastError } = useToast()

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

    try {
      await updateRequest.mutateAsync({
        id: request.id,
        data: {
          type: data.type,
          reason: data.reason.trim(),
          projectId: data.projectId,
        },
      })
      toastSuccess('request.updateSuccess')
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('request.updateError')
      toastError(errorMessage)
    }
  }

  return {
    form,
    isLoading: updateRequest.isPending,
    handleSubmit: form.handleSubmit(handleSubmit),
  }
}
