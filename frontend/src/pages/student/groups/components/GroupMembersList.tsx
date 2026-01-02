import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import { UserMinus, Crown } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useRemoveGroupMember } from '../hooks/useGroupOperations'
import type { ProjectGroup } from '@/types/project.types'

interface GroupMembersListProps {
  group: ProjectGroup
  onError?: (error: string) => void
  onSuccess?: (message: string) => void
}

export function GroupMembersList({ group, onError, onSuccess }: GroupMembersListProps) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const removeMember = useRemoveGroupMember()

  const isLeader = user?.id === group.leaderId

  const handleRemove = (memberId: string) => {
    if (window.confirm(t('groups.confirmRemove'))) {
      removeMember.mutate(
        {
          groupId: group.id,
          memberId,
        },
        {
          onError: (err) => {
            onError?.(err instanceof Error ? err.message : t('groups.removeError'))
          },
          onSuccess: () => {
            onSuccess?.(t('groups.removeSuccess'))
          },
        }
      )
    }
  }

  const handleLeave = (memberId: string) => {
    if (window.confirm(t('groups.confirmLeave'))) {
      removeMember.mutate(
        {
          groupId: group.id,
          memberId,
        },
        {
          onError: (err) => {
            onError?.(err instanceof Error ? err.message : t('groups.leaveError'))
          },
        }
      )
    }
  }

  return (
    <div>
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        {t('groups.members')}
      </h4>
      <div className="space-y-2">
        {group.members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 bg-muted rounded-lg border"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{member.name}</p>
                {member.id === group.leaderId && (
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <Crown className="h-3 w-3" />
                    <span>{t('groups.leader')}</span>
                  </div>
                )}
              </div>
            </div>
            {member.id !== group.leaderId && isLeader && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRemove(member.id)}
              >
                <UserMinus className="mr-1 h-4 w-4" />
                {t('groups.remove')}
              </Button>
            )}
            {member.id !== group.leaderId && !isLeader && member.id === user?.id && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleLeave(member.id)}
              >
                <UserMinus className="mr-1 h-4 w-4" />
                {t('groups.leave')}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
