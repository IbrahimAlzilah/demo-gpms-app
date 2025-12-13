import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '../api/user.service'
import type { User } from '../../../types/user.types'

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

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) =>
      userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      userService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-users', variables.id] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}

