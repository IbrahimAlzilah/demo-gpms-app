import { useMutation, useQueryClient } from "@tanstack/react-query";
import { proposalService } from "../api/proposal.service";
import type { Proposal } from "@/types/project.types";

export function useCreateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: Omit<Proposal, "id" | "createdAt" | "updatedAt" | "status">,
    ) => proposalService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisor-proposals"] });
      queryClient.invalidateQueries({
        queryKey: ["supervisor-proposals-table"],
      });
    },
  });
}

export function useUpdateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Proposal> }) =>
      proposalService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["supervisor-proposals"] });
      queryClient.invalidateQueries({
        queryKey: ["supervisor-proposals", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["supervisor-proposals-table"],
      });
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
      // Additional invalidation to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["supervisor-proposals"] });
      queryClient.invalidateQueries({
        queryKey: ["supervisor-proposals", proposal.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["supervisor-proposals-table"],
      });
    },
  });
}

export function useDeleteProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => proposalService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisor-proposals"] });
      queryClient.invalidateQueries({
        queryKey: ["supervisor-proposals-table"],
      });
    },
  });
}
