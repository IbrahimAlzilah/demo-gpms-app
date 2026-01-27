import { useQuery } from "@tanstack/react-query";
import { committeeDistributionService } from "../api/committee.service";

/**
 * Fetch projects ready for discussion
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
 * Fetch discussion committee members
 */
export function useDiscussionCommitteeMembers() {
  return useQuery({
    queryKey: ["discussion-committee-members"],
    queryFn: () => committeeDistributionService.getDiscussionCommitteeMembers(),
    staleTime: 0,
    refetchOnMount: true,
  });
}
