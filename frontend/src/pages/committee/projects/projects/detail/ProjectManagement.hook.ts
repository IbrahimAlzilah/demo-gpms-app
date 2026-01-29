import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { committeeProjectService } from "../../announce-projects/api/project.service";
import type {
  ProjectDetailStatistics,
  ProjectDetailsResponse,
  ProjectWorkflow,
  UpdateProjectPayload,
  UpdateProjectStatusPayload,
} from "../../announce-projects/api/project.service";
import type { Project } from "@/types/project.types";

export function useProjectManagement(projectId: string) {
  const queryClient = useQueryClient();

  const projectQuery = useQuery({
    queryKey: ["committee-project-detail", projectId],
    queryFn: () => committeeProjectService.getById(projectId),
    enabled: !!projectId,
    staleTime: 0,
    refetchOnMount: true,
  });

  const workflowQuery = useQuery({
    queryKey: ["committee-project-workflow", projectId],
    queryFn: () => committeeProjectService.getWorkflow(projectId),
    enabled: !!projectId,
    staleTime: 0,
    refetchOnMount: true,
  });

  const updateProject = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateProjectPayload;
    }) => committeeProjectService.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["committee-project-detail", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["committee-project-workflow", id],
      });
      queryClient.invalidateQueries({ queryKey: ["committee-projects"] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateProjectStatusPayload;
    }) => committeeProjectService.updateStatus(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["committee-project-detail", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["committee-project-workflow", id],
      });
      queryClient.invalidateQueries({ queryKey: ["committee-projects"] });
    },
  });

  const announceProjects = useMutation({
    mutationFn: (projectIds: string[]) =>
      committeeProjectService.announce(projectIds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["committee-project-detail", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["committee-project-workflow", projectId],
      });
      queryClient.invalidateQueries({ queryKey: ["committee-projects"] });
    },
  });

  const unannounceProjects = useMutation({
    mutationFn: (projectIds: string[]) =>
      committeeProjectService.unannounce(projectIds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["committee-project-detail", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["committee-project-workflow", projectId],
      });
      queryClient.invalidateQueries({ queryKey: ["committee-projects"] });
    },
  });

  const deleteProject = useMutation({
    mutationFn: (id: string) => committeeProjectService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["committee-projects"] });
    },
  });

  const detailResponse = projectQuery.data as
    | ProjectDetailsResponse
    | undefined;
  const project: Project | null =
    detailResponse && "data" in detailResponse && detailResponse.data
      ? (detailResponse.data as Project)
      : null;
  const statistics: ProjectDetailStatistics | null =
    detailResponse &&
    "statistics" in detailResponse &&
    detailResponse.statistics
      ? detailResponse.statistics
      : null;
  const workflow = workflowQuery.data ?? null;

  return {
    project,
    statistics,
    workflow,
    isLoading: projectQuery.isLoading || workflowQuery.isLoading,
    error: projectQuery.error ?? workflowQuery.error,
    refetch: () => {
      projectQuery.refetch();
      workflowQuery.refetch();
    },
    updateProject,
    updateStatus,
    announceProjects,
    unannounceProjects,
    deleteProject,
  };
}
