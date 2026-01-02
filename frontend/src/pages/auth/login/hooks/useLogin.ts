import { useMutation } from '@tanstack/react-query'
import { authService } from '../api/auth.service'
import { useAuthStore } from '../store/auth.store'
import type { LoginCredentials, AuthResponse } from '../types/auth.types'

export function useLogin() {
  const { login } = useAuthStore()

  return useMutation({
    mutationFn: (credentials: LoginCredentials): Promise<AuthResponse> => {
      return authService.login(credentials)
    },
    onSuccess: (response) => {
      login(response.user, response.token, response.permissions)
    },
  })
}
