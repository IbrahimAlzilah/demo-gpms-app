import { apiClient } from '../../../../lib/axios'
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from '../types/auth.types'

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<{ data: AuthResponse }>('/auth/login', credentials)
    // Backend returns { success: true, data: { token, user, permissions } }
    // Interceptor extracts data, so response.data is { token, user, permissions }
    return response.data as AuthResponse
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<{ data: AuthResponse }>('/auth/register', data)
    return response.data as AuthResponse
  },

  me: async (): Promise<AuthResponse['user']> => {
    const response = await apiClient.get<{ data: AuthResponse['user'] }>('/auth/me')
    return response.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },
}
