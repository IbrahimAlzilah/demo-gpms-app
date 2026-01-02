import { useQuery } from '@tanstack/react-query'
import { userService } from '@/features/admin/api/user.service'
import type { User } from '@/types/user.types'

export function useUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => userService.getAll(),
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['admin-users', id],
    queryFn: () => userService.getById(id),
    enabled: !!id,
  })
}
