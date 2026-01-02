import { useQuery } from '@tanstack/react-query'
import { requestService } from '@/features/student/api/request.service'
import { useAuthStore } from '@/features/auth/store/auth.store'
import type { Request } from '@/types/request.types'

export function useRequests() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['requests', user?.id],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated')
      return requestService.getAll(user.id)
    },
    enabled: !!user,
  })
}

export function useRequest(id: string) {
  return useQuery({
    queryKey: ['requests', id],
    queryFn: () => requestService.getById(id),
    enabled: !!id,
  })
}
