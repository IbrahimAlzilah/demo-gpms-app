import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Label, Input, Textarea } from '@/components/ui'
import { AlertCircle, Users, Loader2 } from 'lucide-react'
import { useCreateJoinRequest, useMyJoinRequests } from '../hooks/useGroupOperations'
import { groupService } from '../api/group.service'
import { groupJoinSchema, type GroupJoinSchema } from '../schema'
import { useToast } from '@/components/common'

interface GroupJoinFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function GroupJoinForm({ onSuccess, onError }: GroupJoinFormProps) {
  const { t } = useTranslation()
  const createJoinRequest = useCreateJoinRequest()
  const { data: myJoinRequests } = useMyJoinRequests()
  const { toastError } = useToast()

  // Check if there's a pending join request
  const hasPendingJoinRequest = myJoinRequests?.some((request) => request.status === 'pending') ?? false

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GroupJoinSchema>({
    resolver: zodResolver(groupJoinSchema(t)),
    defaultValues: {
      groupCode: '',
      message: '',
    },
  })

  const onSubmit = async (data: GroupJoinSchema) => {
    // Prevent submission if there's a pending request
    if (hasPendingJoinRequest) {
      toastError(t('groups.pendingRequestError', { defaultValue: 'You already have a pending join request. Please cancel it first.' }))
      return
    }

    try {
      const group = await groupService.lookupByCode(data.groupCode)

      await createJoinRequest.mutateAsync({
        groupId: group.id,
        message: data.message,
      })
      reset()
      onSuccess?.()
    } catch (err) {
      onError?.(err instanceof Error ? err.message : t('groups.joinRequestError'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="groupCode">
          {t('groups.groupCode')} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="groupCode"
          {...register('groupCode')}
          placeholder="GP-202X-XXXX"
          className={errors.groupCode ? 'border-red-500' : ''}
          aria-invalid={!!errors.groupCode}
        />
        {errors?.groupCode && (
          <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
            <AlertCircle className="h-3 w-3" />
            {errors.groupCode.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {t('groups.groupCodeDescription')}
        </p>
      </div>
      <div>
        <Label htmlFor="message">{t('groups.message')} (Optional)</Label>
        <Textarea
          id="message"
          {...register('message')}
          placeholder={t('groups.messagePlaceholder')}
          rows={3}
          className={errors.message ? 'border-red-500' : ''}
        />
        {errors?.message && (
          <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
            <AlertCircle className="h-3 w-3" />
            {errors.message.message}
          </p>
        )}
      </div>
      {hasPendingJoinRequest && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-900 dark:text-amber-100 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {t('groups.pendingRequestWarning', { defaultValue: 'You have a pending join request. Please cancel it before sending a new one.' })}
          </p>
        </div>
      )}
      <Button
        type="submit"
        disabled={createJoinRequest.isPending || hasPendingJoinRequest}
        className="w-full bg-primary text-white hover:bg-primary/90"
        title={hasPendingJoinRequest ? t('groups.pendingRequestTooltip', { defaultValue: 'You have a pending join request. Please cancel it first.' }) : undefined}
      >
        {createJoinRequest.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('groups.submittingRequest')}
          </>
        ) : (
          <>
            <Users className="size-4" />
            {t('groups.submitJoinRequest')}
          </>
        )}
      </Button>
    </form>
  )
}
