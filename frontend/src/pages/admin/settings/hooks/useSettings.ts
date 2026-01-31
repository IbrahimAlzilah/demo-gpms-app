import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminSettings,
  updateSettings,
  getSettings,
} from "../api/settings.service";
import type { SystemSettingsUpdatePayload } from "@/types/settings.types";

export function useAdminSettings() {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: getAdminSettings,
  });
}

export function usePublicSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: SystemSettingsUpdatePayload) =>
      updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
