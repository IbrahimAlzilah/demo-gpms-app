import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/features/dashboard/api/dashboard.service";
import type { ProjectsCommitteeDashboardData } from "@/features/dashboard/api/dashboard.service";

export function useProjectsCommitteeDashboard() {
  return useQuery<ProjectsCommitteeDashboardData, Error>({
    queryKey: ["projects-committee-dashboard"],
    queryFn: () => dashboardService.getProjectsCommitteeDashboard(),
    staleTime: 0,
    refetchOnMount: true,
  });
}
