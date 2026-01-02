import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMyGroup, useGroupInvitations } from '../hooks/useGroups'
import { useProjectRegistration, useStudentRegistrations } from '@/pages/student/projects/hooks/useProjects'
import type { GroupsListState, GroupsListData } from './GroupsList.types'

export function useGroupsList() {
  const { t } = useTranslation()
  const { data: group, isLoading } = useMyGroup()
  const { data: invitations, isLoading: invitationsLoading } = useGroupInvitations()
  const { data: registration } = useProjectRegistration(group?.projectId || '')
  const { data: registrations } = useStudentRegistrations()

  const [state, setState] = useState<GroupsListState>({
    showInviteForm: false,
    showCreateGroupModal: false,
    showJoinGroupModal: false,
    error: '',
    success: '',
  })

  const data: GroupsListData = {
    group: group || null,
    invitations: invitations || [],
    isLoading,
    invitationsLoading,
    error: null,
  }

  return {
    data,
    state,
    setState,
    registration,
    registrations,
    t,
  }
}
