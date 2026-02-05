import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ModalDialog } from '@/components/common'
import { Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui'
import { useToast } from '@/components/common'
import { LoadingSpinner } from '@/components/common'
import { UserMinus, UserPlus } from 'lucide-react'
import { committeeGroupService } from '../api/committee-group.service'
import type { User } from '@/types/user.types'

interface ManageGroupModalProps {
  groupId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ManageGroupModal({ groupId, open, onOpenChange, onSuccess }: ManageGroupModalProps) {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()
  const queryClient = useQueryClient()
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')

  const { data: group, isLoading } = useQuery({
    queryKey: ['committee-group', groupId],
    queryFn: () => committeeGroupService.getById(groupId),
    enabled: open && !!groupId,
  })

  const { data: eligibleStudents = [], isLoading: loadingEligible } = useQuery({
    queryKey: ['committee-eligible-students', groupId],
    queryFn: () => committeeGroupService.getEligibleStudents(),
    enabled: open && !!groupId,
  })

  const addMember = useMutation({
    mutationFn: (studentId: string) => committeeGroupService.addMember(groupId, studentId),
    onSuccess: (updated) => {
      setSelectedStudentId('')
      queryClient.setQueryData(['committee-group', groupId], updated)
      queryClient.invalidateQueries({ queryKey: ['committee-group', groupId] })
      queryClient.invalidateQueries({ queryKey: ['committee-eligible-students', groupId] })
      onSuccess?.()
      toastSuccess(t('committee.projectManagement.memberAdded', { defaultValue: 'Member added to group' }))
    },
    onError: (e) => toastError(e instanceof Error ? e.message : t('common.error')),
  })

  const removeMember = useMutation({
    mutationFn: (memberId: string) => committeeGroupService.removeMember(groupId, memberId),
    onSuccess: (updated) => {
      queryClient.setQueryData(['committee-group', groupId], updated)
      queryClient.invalidateQueries({ queryKey: ['committee-group', groupId] })
      onSuccess?.()
      toastSuccess(t('committee.projectManagement.memberRemoved', { defaultValue: 'Member removed from group' }))
    },
    onError: (e) => toastError(e instanceof Error ? e.message : t('common.error')),
  })

  const allMembers: User[] = []
  if (group?.leader) allMembers.push(group.leader)
  if (group?.members?.length) allMembers.push(...group.members)
  const membersToShow = allMembers.filter((m, i, a) => a.findIndex(x => x.id === m.id) === i)

  return (
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('committee.projectManagement.manageGroup', { defaultValue: 'Manage group' })}
      size="md"
    >
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : group ? (
        <div className="space-y-4">
          <div className="text-sm">
            <p className="font-medium">{group.name || group.groupCode || t('project.groups')}</p>
            {group.groupCode && <p className="text-muted-foreground">{group.groupCode}</p>}
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">{t('common.members')}</p>
            <ul className="space-y-1.5">
              {membersToShow.map((user) => {
                const isLeader = group.leaderId === user.id
                return (
                  <li
                    key={user.id}
                    className="flex items-center justify-between gap-2 py-1.5 px-2 rounded border bg-muted/30"
                  >
                    <span className="text-sm truncate">
                      {user.name ?? user.email}
                      {isLeader && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({t('common.leader')})
                        </span>
                      )}
                    </span>
                    {!isLeader && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-destructive hover:text-destructive"
                        onClick={() => removeMember.mutate(user.id)}
                        disabled={removeMember.isPending}
                      >
                        <UserMinus className="h-3.5 w-3" />
                      </Button>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {t('committee.projectManagement.addMember', { defaultValue: 'Add member' })}
            </p>
            <div className="flex gap-2">
              <Select
                value={selectedStudentId}
                onValueChange={setSelectedStudentId}
                disabled={addMember.isPending || loadingEligible || eligibleStudents.length === 0}
              >
                <SelectTrigger className="flex-1 h-9">
                  <SelectValue
                    placeholder={
                      eligibleStudents.length === 0
                        ? t('committee.projectManagement.noEligibleStudents', {
                          defaultValue: 'No eligible students',
                        })
                        : t('common.select')
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {eligibleStudents.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name ?? s.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="sm"
                disabled={!selectedStudentId || addMember.isPending || loadingEligible}
                className="shrink-0"
                onClick={() => selectedStudentId && addMember.mutate(selectedStudentId)}
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t('common.error')}</p>
      )}
    </ModalDialog>
  )
}
