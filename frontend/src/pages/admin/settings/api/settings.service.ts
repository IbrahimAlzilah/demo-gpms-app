import { apiClient } from "@/lib/axios";
import type {
  SystemSettingsMap,
  SystemSettingItem,
  SystemSettingsUpdatePayload,
} from "@/types/settings.types";

/** Get display settings (any authenticated user) */
export const getSettings = async (): Promise<SystemSettingsMap> => {
  const response = await apiClient.get<SystemSettingsMap>("/settings");
  const data = response.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as SystemSettingsMap;
  }
  return {};
};

/** Get all settings with definitions (admin only) */
export const getAdminSettings = async (): Promise<SystemSettingItem[]> => {
  const response = await apiClient.get<SystemSettingItem[]>("/admin/settings");
  const data = response.data;
  return Array.isArray(data) ? data : [];
};

/** Update settings (admin only) */
export const updateSettings = async (
  settings: SystemSettingsUpdatePayload,
): Promise<SystemSettingsMap> => {
  const response = await apiClient.put<SystemSettingsMap>("/admin/settings", {
    settings,
  });
  const data = response.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as SystemSettingsMap;
  }
  return {};
};
