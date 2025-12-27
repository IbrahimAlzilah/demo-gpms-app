import { apiClient } from '../../../lib/axios'
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  PasswordRecoveryRequest,
  PasswordRecoveryResponse,
  ResetPasswordRequest,
} from '../types/auth.types'

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
    return response.data
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  recoverPassword: async (
    data: PasswordRecoveryRequest
  ): Promise<PasswordRecoveryResponse> => {
    const response = await apiClient.post<PasswordRecoveryResponse>(
      '/auth/recover-password',
      data
    )
    return response.data
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/reset-password', data)
  },
}

