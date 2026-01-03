import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDistributeCommittees, useDiscussionCommitteeMembers } from '../hooks/useDistributeCommittees'
import type { DistributeCommitteesListState, DistributeCommitteesListData } from './DistributeCommitteesList.types'

export function useDistributeCommitteesList() {
  const { t } = useTranslation()
  const { data: projects, isLoading: projectsLoading } = useDistributeCommittees()
  const { data: members, isLoading: membersLoading } = useDiscussionCommitteeMembers()
  
  const [state, setState] = useState<DistributeCommitteesListState>({
    assignments: new Map(),
  })

  const data: DistributeCommitteesListData = {
    projects: projects || [],
    members: (members || []).map(m => ({ id: m.id, name: m.name })),
    isLoading: projectsLoading || membersLoading,
    error: null,
  }

  return {
    data,
    state,
    setState,
    t,
  }
}
