import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Label, Input, Textarea } from '@/components/ui'
import { AlertCircle, Mail, Loader2 } from 'lucide-react'
import { groupInviteSchema, type GroupInviteSchema } from '@/features/student/schema'
import { useInviteGroupMember } from '../hooks/useGroupOperations'
import type { ProjectGroup } from '@/types/project.types'

interface GroupInviteFormProps {
  group: ProjectGroup
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function GroupInviteForm({ group, onSuccess, onError }: GroupInviteFormProps) {
  const { t } = useTranslation()
  const inviteMember = useInviteGroupMember()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GroupInviteSchema>({
    resolver: zodResolver(groupInviteSchema(t)),
    defaultValues: {
      inviteeId: '',
      message: '',
    },
  })

  const onSubmit = async (data: GroupInviteSchema) => {
    if (group.members.length >= group.maxMembers) {
      onError?.(t('groups.fullCapacity'))
      return
    }

    try {
      await inviteMember.mutateAsync({
        groupId: group.id,
        inviteeId: data.inviteeId,
        message: data.message?.trim() || undefined,
      })
      reset()
      onSuccess?.()
    } catch (err) {
      onError?.(err instanceof Error ? err.message : t('groups.inviteError'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <Label htmlFor="inviteeId">
          {t('groups.studentId')} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="inviteeId"
          {...register('inviteeId')}
          placeholder={t('groups.studentIdPlaceholder')}
          className={errors.inviteeId ? 'border-destructive' : ''}
          aria-invalid={!!errors.inviteeId}
        />
        {errors.inviteeId && (
          <p className="text-sm text-destructive flex items-center gap-1 mt-1">
            <AlertCircle className="h-3 w-3" />
            {errors.inviteeId.message}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="inviteMessage">
          {t('groups.message')} ({t('common.optional')})
        </Label>
        <Textarea
          id="inviteMessage"
          {...register('message')}
          placeholder={t('groups.messagePlaceholder')}
          rows={3}
        />
      </div>
      <Button
        type="submit"
        disabled={inviteMember.isPending}
        className="w-full"
      >
        {inviteMember.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('groups.sending')}
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            {t('groups.sendInvitation')}
          </>
        )}
      </Button>
    </form>
  )
}
