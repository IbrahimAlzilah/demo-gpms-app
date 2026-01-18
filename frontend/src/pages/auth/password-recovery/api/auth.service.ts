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
    const response = await apiClient.post<PasswordRecoveryResponse>(
      '/auth/recover-password',
      data
    )
    // Ensure message property exists
    return {
      ...response.data,
      message: response.data.message || response.message || 'Password recovery email sent',
    }
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/reset-password', data)
  },
}
