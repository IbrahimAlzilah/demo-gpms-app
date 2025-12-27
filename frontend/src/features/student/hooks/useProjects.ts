import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "../api/project.service";
import { useAuthStore } from "../../auth/store/auth.store";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => projectService.getAll(),
  });
}

export function useAvailableProjects() {
  return useQuery({
    queryKey: ["projects", "available"],
    queryFn: () => projectService.getAvailable(),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => projectService.getById(id),
    enabled: !!id,
  });
}

export function useStudentRegistrations() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ["project-registrations", user?.id],
    queryFn: () => {
      if (!user) throw new Error("User not authenticated");
      return projectService.getStudentRegistrations(user.id);
    },
    enabled: !!user,
  });
}

export function useProjectRegistration(projectId: string) {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ["project-registration", projectId, user?.id],
    queryFn: () => {
      if (!user) throw new Error("User not authenticated");
      return projectService.getRegistrationByProject(projectId, user.id);
    },
    enabled: !!user && !!projectId,
  });
}

export function useRegisterProject() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (projectId: string) => {
      if (!user) throw new Error("User not authenticated");
      return projectService.register(projectId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project-registrations"] });
    },
  });
}

export function useCancelRegistration() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (registrationId: string) => {
      if (!user) throw new Error("User not authenticated");
      return projectService.cancelRegistration(registrationId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
