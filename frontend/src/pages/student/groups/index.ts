// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { GroupsList } from './list/GroupsList.screen'
export { GroupsView } from './view/GroupsView.screen'

// Components
export { GroupInviteForm } from './components/GroupInviteForm'
export { GroupJoinForm } from './components/GroupJoinForm'
export { GroupMembersList } from './components/GroupMembersList'

// Hooks
export { useMyGroup, useGroupInvitations, useGroupByProject } from './hooks/useGroups'
export {
  useCreateGroup,
  useAddGroupMember,
  useRemoveGroupMember,
  useInviteGroupMember,
  useAcceptInvitation,
  useRejectInvitation,
  useJoinGroup,
} from './hooks/useGroupOperations'

// Types
export type {
  GroupFilters,
  GroupsListScreenProps,
  GroupsViewScreenProps,
} from './types/Groups.types'
