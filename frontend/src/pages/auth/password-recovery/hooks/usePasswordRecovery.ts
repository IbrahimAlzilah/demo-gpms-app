import { useMutation } from '@tanstack/react-query'
import { authService } from '../api/auth.service'
import type {
  PasswordRecoveryRequest,
  PasswordRecoveryResponse,
  ResetPasswordRequest,
} from '../../login/types/auth.types'

export function usePasswordRecovery() {
  return useMutation({
    mutationFn: (data: PasswordRecoveryRequest): Promise<PasswordRecoveryResponse> => {
      return authService.recoverPassword(data)
    },
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest): Promise<void> => {
      return authService.resetPassword(data)
    },
  })
}
