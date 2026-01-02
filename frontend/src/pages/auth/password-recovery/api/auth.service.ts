import { apiClient } from '../../../../lib/axios'
import type {
  PasswordRecoveryRequest,
  PasswordRecoveryResponse,
  ResetPasswordRequest,
} from '../../login/types/auth.types'

export const authService = {
  recoverPassword: async (
    data: PasswordRecoveryRequest
  ): Promise<PasswordRecoveryResponse> => {
    const response = await apiClient.post<{ data: PasswordRecoveryResponse }>(
      '/auth/recover-password',
      data
    )
    return response.data
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/reset-password', data)
  },
}
