import { useMutation, useQueryClient } from "@tanstack/react-query";
import { proposalService } from "../api/proposal.service";
import type { Proposal } from "@/types/project.types";
import type { ProposalFormData } from "../types/Proposals.types";

/**
 * Hook for creating a new proposal
 */
export function useCreateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProposalFormData & { submitterId: string }) =>
      proposalService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["student-proposals-table"] });
    },
  });
}

/**
 * Hook for updating an existing proposal
 */
export function useUpdateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Proposal> }) =>
      proposalService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["proposals", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["student-proposals-table"] });
    },
    onError: (error) => {
      // Error is handled by the component, but we log it here for debugging
      console.error('Failed to update proposal:', error);
    },
  });
}

/**
 * Hook for resubmitting a proposal (wrapper around update)
 */
export function useResubmitProposal() {
  const queryClient = useQueryClient();
  const updateProposal = useUpdateProposal();

  return useMutation({
    mutationFn: (proposal: Proposal) =>
      updateProposal.mutateAsync({
        id: proposal.id,
        data: {
          ...proposal,
          status: "pending_review" as const,
        },
      }),
    onSuccess: (_, proposal) => {
      // Additional invalidation to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["proposals", proposal.id] });
      queryClient.invalidateQueries({ queryKey: ["student-proposals-table"] });
    },
  });
}
