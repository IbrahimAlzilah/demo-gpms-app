import { apiClient } from "../../../../lib/axios";
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from "../types/auth.types";

export interface PasswordRecoveryRequest {
  email: string;
}

export interface PasswordRecoveryResponse {
  message: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials,
    );
    // Backend returns { success: true, data: { token, user, permissions } }
    // Interceptor extracts data, so response.data is { token, user, permissions }
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  me: async (): Promise<AuthResponse["user"]> => {
    const response = await apiClient.get<AuthResponse["user"]>("/auth/me");
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  recoverPassword: async (
    data: PasswordRecoveryRequest,
  ): Promise<PasswordRecoveryResponse> => {
    const response = await apiClient.post<{ message: string }>(
      "/auth/recover-password",
      data,
    );
    // Backend returns { success: true, message: "..." }
    // Interceptor extracts data, so response.data is { message: "..." }
    return {
      message:
        response.data?.message || "Password reset link sent to your email",
    };
  },
};
