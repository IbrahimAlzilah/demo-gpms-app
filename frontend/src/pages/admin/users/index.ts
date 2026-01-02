// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { UsersList } from './list/UsersList.screen'

// Components
export { UserForm } from './components/UserForm'
export { createUserColumns } from './components/table'

// Hooks
export { useUsers, useUser } from './hooks/useUsers'
export {
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from './hooks/useUserOperations'

// Types
export type {
  UserFormData,
  UserFilters,
  UserTableColumnsProps,
  UsersListScreenProps,
  UsersViewScreenProps,
  UsersNewScreenProps,
} from './types/Users.types'

// Schemas
export { userFormSchema } from './schema'
export type { UserFormSchema } from './schema'
