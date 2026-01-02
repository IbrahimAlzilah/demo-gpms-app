// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { GroupsList } from './list/GroupsList.screen'
export { GroupsView } from './view/GroupsView.screen'

// Components
export { GroupInviteForm } from './components/GroupInviteForm'
export { GroupJoinForm } from './components/GroupJoinForm'
export { GroupMembersList } from './components/GroupMembersList'

// Hooks
export { 
  useMyGroup, 
  useGroupInvitations, 
  useGroupByProject,
  useCreateGroup,
  useAddGroupMember,
  useRemoveGroupMember,
  useInviteGroupMember,
  useAcceptInvitation,
  useRejectInvitation,
  useJoinGroup,
} from './hooks/useGroups'
export {
  useCreateGroup as useCreateGroupOp,
  useAddGroupMember as useAddGroupMemberOp,
  useRemoveGroupMember as useRemoveGroupMemberOp,
  useInviteGroupMember as useInviteGroupMemberOp,
  useAcceptInvitation as useAcceptInvitationOp,
  useRejectInvitation as useRejectInvitationOp,
  useJoinGroup as useJoinGroupOp,
} from './hooks/useGroupOperations'

// Types
export type {
  GroupFilters,
  GroupsListScreenProps,
  GroupsViewScreenProps,
} from './types/Groups.types'

// Schemas
export {
  groupInviteSchema,
  groupJoinSchema,
} from './schema'
export type {
  GroupInviteSchema,
  GroupJoinSchema,
} from './schema'

// API Services (for internal use, but exported for flexibility)
export { groupService } from './api/group.service'
