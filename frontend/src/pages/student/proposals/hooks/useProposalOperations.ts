import { useMutation, useQueryClient } from "@tanstack/react-query";
import { proposalService } from "../api/proposal.service";
import type { Proposal } from "@/types/project.types";
import type { ProposalFormData } from "../types/Proposals.types";

/**
 * Invalidate all proposal-related queries
 */
function invalidateProposalQueries(queryClient: ReturnType<typeof useQueryClient>) {
  // Invalidate all proposal queries (individual and list)
  queryClient.invalidateQueries({ queryKey: ["proposals"] });
  // Invalidate student proposals table (with all possible pathname variations)
  queryClient.invalidateQueries({ queryKey: ["student-proposals-table"] });
  // Also invalidate any queries that start with these prefixes
  queryClient.invalidateQueries({ 
    predicate: (query) => {
      const key = query.queryKey;
      return (
        Array.isArray(key) &&
        (key[0] === "proposals" || key[0] === "student-proposals-table")
      );
    }
  });
}

/**
 * Hook for creating a new proposal
 */
export function useCreateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProposalFormData & { submitterId: string }) =>
      proposalService.create(data),
    onSuccess: () => {
      invalidateProposalQueries(queryClient);
    },
  });
}

/**
 * Hook for updating an existing proposal
 */
export function useUpdateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProposalFormData> }) =>
      proposalService.update(id, data),
    onSuccess: (_, variables) => {
      invalidateProposalQueries(queryClient);
      // Also invalidate the specific proposal
      queryClient.invalidateQueries({ queryKey: ["proposals", variables.id] });
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
          title: proposal.title,
          description: proposal.description,
        },
      }),
    onSuccess: (_, proposal) => {
      invalidateProposalQueries(queryClient);
      // Also invalidate the specific proposal
      queryClient.invalidateQueries({ queryKey: ["proposals", proposal.id] });
    },
  });
}

/**
 * Hook for batch creating proposals
 */
export function useCreateBatchProposals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      proposals,
      studentGroupId,
    }: {
      proposals: ProposalFormData[];
      studentGroupId?: string;
    }) => proposalService.createBatch(proposals, studentGroupId),
    onSuccess: () => {
      invalidateProposalQueries(queryClient);
    },
  });
}

/**
 * Hook for batch updating proposals
 */
export function useUpdateBatchProposals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      updates,
      newProposals,
      studentGroupId,
    }: {
      updates: Array<{ id: string } & Partial<ProposalFormData>>;
      newProposals: ProposalFormData[];
      studentGroupId?: string;
    }) => proposalService.updateBatch(updates, newProposals, studentGroupId),
    onSuccess: () => {
      invalidateProposalQueries(queryClient);
    },
  });
}
