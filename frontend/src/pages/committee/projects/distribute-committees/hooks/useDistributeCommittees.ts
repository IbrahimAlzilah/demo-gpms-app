import { useQuery } from "@tanstack/react-query";
import {
  committeeDistributionService,
  type ProjectFilterStatus,
  type DefensePhaseFilter,
} from "../api/committee.service";

/**
 * Fetch projects ready for discussion (legacy)
 */
export function useDistributeCommittees() {
  return useQuery({
    queryKey: ["projects-ready-for-discussion"],
    queryFn: () => committeeDistributionService.getProjectsReadyForDiscussion(),
    staleTime: 0,
    refetchOnMount: true,
  });
}

/**
 * Fetch projects for discussion with filtering
 * defensePhase: Final Defense 1 (Phase 1 complete) / Final Defense 2 (FD1 + Phase 2 complete)
 */
export function useProjectsForDiscussion(
  filterStatus?: ProjectFilterStatus,
  search?: string,
  defensePhase?: DefensePhaseFilter,
) {
  return useQuery({
    queryKey: ["projects-for-discussion", filterStatus, search, defensePhase],
    queryFn: () =>
      committeeDistributionService.getProjectsForDiscussion(
        filterStatus,
        search,
        defensePhase,
      ),
    staleTime: 0,
    refetchOnMount: true,
  });
}

/**
 * Fetch discussion committee members with detailed profiles
 */
export function useDiscussionCommitteeMembers() {
  return useQuery({
    queryKey: ["discussion-committee-members"],
    queryFn: () => committeeDistributionService.getDiscussionCommitteeMembers(),
    staleTime: 0,
    refetchOnMount: true,
  });
}

/**
 * Fetch assignment history for a specific project
 */
export function useAssignmentHistory(projectId: string | null) {
  return useQuery({
    queryKey: ["assignment-history", projectId],
    queryFn: () => projectId ? committeeDistributionService.getAssignmentHistory(projectId) : Promise.resolve([]),
    enabled: !!projectId,
    staleTime: 0,
    refetchOnMount: true,
  });
}
