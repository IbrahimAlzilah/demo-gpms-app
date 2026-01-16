import { apiClient } from "../../../../lib/axios";
import type { User } from "../../../../types/user.types";

export const supervisorService = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<{ success: boolean; data: User[] }>("/supervisor/supervisors");
    return Array.isArray(response.data?.data) ? response.data.data : [];
  },
};
