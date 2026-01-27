import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "../api/project.service";
import { useAuthStore } from "@/pages/auth/login";
import type { ProjectRegistration } from "@/types/project.types";

/**
 * Fetch all projects
 */
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => projectService.getAll(),
    staleTime: 0,
    refetchOnMount: true,
  });
}

/**
 * Fetch available projects for registration
 */
export function useAvailableProjects() {
  return useQuery({
    queryKey: ["projects", "available"],
    queryFn: () => projectService.getAvailable(),
    staleTime: 0,
    refetchOnMount: true,
  });
}

/**
 * Fetch a single project by ID
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => projectService.getById(id),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
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
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useProjectRegistration(projectId: string) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Get registrations query to ensure it's fetched (React Query will deduplicate)
  const registrationsQuery = useStudentRegistrations();

  // Derive the specific registration from the cached registrations
  // This hook never makes a separate API call - it only reads from cache
  return useQuery({
    queryKey: ["project-registration", projectId, user?.id],
    queryFn: () => {
      if (!user || !projectId) return null;

      // Always read from cache to avoid duplicate API calls
      const cachedRegistrations = queryClient.getQueryData<
        ProjectRegistration[]
      >(["project-registrations", user.id]);

      if (cachedRegistrations && cachedRegistrations.length > 0) {
        return (
          cachedRegistrations.find((r) => r.projectId === projectId) || null
        );
      }

      // If cache is not available, use data from the registrations query
      // This ensures we never make a duplicate API call
      if (registrationsQuery.data && registrationsQuery.data.length > 0) {
        return (
          registrationsQuery.data.find((r) => r.projectId === projectId) || null
        );
      }

      // Return null while loading - never fallback to API call
      return null;
    },
    enabled: !!user && !!projectId,
    staleTime: 0,
    refetchOnMount: false, // Don't refetch - use cache from registrations query
    // Use placeholder data from registrations query cache
    placeholderData: () => {
      const cachedRegistrations = queryClient.getQueryData<
        ProjectRegistration[]
      >(["project-registrations", user?.id]);
      if (cachedRegistrations) {
        return (
          cachedRegistrations.find((r) => r.projectId === projectId) || null
        );
      }
      return undefined;
    },
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
