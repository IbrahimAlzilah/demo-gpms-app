import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Label, Input, Textarea } from '@/components/ui'
import { AlertCircle, Users, Loader2 } from 'lucide-react'
import { useCreateJoinRequest } from '../hooks/useGroupOperations'
import { groupJoinSchema, type GroupJoinSchema } from '../schema'

interface GroupJoinFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function GroupJoinForm({ onSuccess, onError }: GroupJoinFormProps) {
  const { t } = useTranslation()
  const createJoinRequest = useCreateJoinRequest()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GroupJoinSchema>({
    resolver: zodResolver(groupJoinSchema(t)),
    defaultValues: {
      groupId: '',
      message: '',
    },
  })

  const onSubmit = async (data: GroupJoinSchema) => {
    try {
      await createJoinRequest.mutateAsync({
        groupId: data.groupId,
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
        <Label htmlFor="groupId">
          {t('groups.groupId')} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="groupId"
          {...register('groupId')}
          placeholder={t('groups.groupIdPlaceholder')}
          className={errors.groupId ? 'border-red-500' : ''}
          aria-invalid={!!errors.groupId}
        />
        {errors?.groupId && (
          <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
            <AlertCircle className="h-3 w-3" />
            {errors.groupId.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {t('groups.groupIdDescription')}
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
      <Button
        type="submit"
        disabled={createJoinRequest.isPending}
        className="w-full bg-primary text-white hover:bg-primary/90"
      >
        {createJoinRequest.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('groups.submittingRequest')}
          </>
        ) : (
          <>
            <Users className="mr-2 h-4 w-4" />
            {t('groups.submitJoinRequest')}
          </>
        )}
      </Button>
    </form>
  )
}
