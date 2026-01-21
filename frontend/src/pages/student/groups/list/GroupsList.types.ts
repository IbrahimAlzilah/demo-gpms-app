import type { ProjectGroup, GroupInvitation } from '@/types/project.types'

export interface GroupsListState {
  showInviteForm: boolean
  showInviteModal: boolean
  showCreateGroupModal: boolean
  showJoinGroupModal: boolean
}

export interface GroupsListData {
  group: ProjectGroup | null
  invitations: GroupInvitation[]
  isLoading: boolean
  invitationsLoading: boolean
  error: Error | null
}

export type { ProjectGroup, GroupInvitation }
