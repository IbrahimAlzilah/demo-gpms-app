import type { User } from '@/types/user.types'

/**
 * User form data type
 */
export interface UserFormData {
  name: string
  email: string
  role: User['role']
  status: User['status']
  studentId?: string
  department?: string
  phone?: string
}

/**
 * User filter options
 */
export interface UserFilters {
  role?: User['role']
  status?: User['status']
  search?: string
}

/**
 * User table column definition props
 */
export interface UserTableColumnsProps {
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  t: (key: string) => string
}

/**
 * User list screen props
 */
export interface UsersListScreenProps {
  // No props needed - uses route context
}

/**
 * User view screen props
 */
export interface UsersViewScreenProps {
  userId: string
  open: boolean
  onClose: () => void
}

/**
 * User new screen props
 */
export interface UsersNewScreenProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}
