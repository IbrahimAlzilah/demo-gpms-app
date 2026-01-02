import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Label, Input } from '@/components/ui'
import { AlertCircle, Users, Loader2 } from 'lucide-react'
import { groupJoinSchema, type GroupJoinSchema } from '@/features/student/schema'
import { useJoinGroup } from '../hooks/useGroupOperations'

interface GroupJoinFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function GroupJoinForm({ onSuccess, onError }: GroupJoinFormProps) {
  const { t } = useTranslation()
  const joinGroup = useJoinGroup()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GroupJoinSchema>({
    resolver: zodResolver(groupJoinSchema(t)),
    defaultValues: {
      joinGroupId: '',
    },
  })

  const onSubmit = async (data: GroupJoinSchema) => {
    try {
      await joinGroup.mutateAsync(data.joinGroupId)
      reset()
      onSuccess?.()
    } catch (err) {
      onError?.(err instanceof Error ? err.message : t('groups.joinError'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="joinGroupId">
          {t('groups.groupId')} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="joinGroupId"
          {...register('joinGroupId')}
          placeholder={t('groups.groupIdPlaceholder')}
          className={errors.joinGroupId ? 'border-red-500' : ''}
          aria-invalid={!!errors.joinGroupId}
        />
        {errors?.joinGroupId && (
          <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
            <AlertCircle className="h-3 w-3" />
            {errors.joinGroupId.message}
          </p>
        )}
      </div>
      <Button
        type="submit"
        disabled={joinGroup.isPending}
        className="w-full bg-primary text-white hover:bg-primary/90"
      >
        {joinGroup.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('groups.joining')}
          </>
        ) : (
          <>
            <Users className="mr-2 h-4 w-4" />
            {t('groups.join')}
          </>
        )}
      </Button>
    </form>
  )
}
