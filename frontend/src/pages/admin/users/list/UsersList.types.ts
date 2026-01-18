import type { User } from '@/types/user.types'

export interface UsersListState {
  selectedUser: User | null
  showForm: boolean
  userToDelete: User | null
  showDeleteDialog: boolean
}

export interface UsersListData {
  users: User[]
  isLoading: boolean
  error: Error | null
}

export type { User }
