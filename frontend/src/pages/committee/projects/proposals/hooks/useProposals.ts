import { useQuery } from "@tanstack/react-query";
import { committeeProposalService } from "../api/proposal.service";

/**
 * Fetch pending proposals
 */
export function usePendingProposals() {
  return useQuery({
    queryKey: ["committee-proposals", "pending"],
    queryFn: () => committeeProposalService.getPending(),
    staleTime: 0,
    refetchOnMount: true,
  });
}

/**
 * Fetch all proposals
 */
export function useAllProposals() {
  return useQuery({
    queryKey: ["committee-proposals"],
    queryFn: () => committeeProposalService.getAll(),
    staleTime: 0,
    refetchOnMount: true,
  });
}

/**
 * Fetch a single proposal by ID
 */
export function useProposal(id: string) {
  return useQuery({
    queryKey: ["committee-proposals", id],
    queryFn: () => committeeProposalService.getById(id),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
  });
}
