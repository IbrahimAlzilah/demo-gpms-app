import { useMutation, useQueryClient } from "@tanstack/react-query";
import { committeeProposalService } from "../api/proposal.service";
import { useAuthStore } from "@/pages/auth/login";
import type { Proposal } from "@/types/project.types";

/**
 * Hook for approving a proposal
 */
export function useApproveProposal() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId?: string }) => {
      if (!user) throw new Error("User not authenticated");
      return committeeProposalService.approve(id, user.id, projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["committee-proposals"] });
      queryClient.invalidateQueries({
        queryKey: ["committee-proposals-table"],
      });
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({
        queryKey: ["committee-proposals-submissions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["committee-proposals-supervisor-submissions"],
      });
      // Invalidate unified groups to refresh group data with proposals and registrations
      queryClient.invalidateQueries({ queryKey: ["committee-unified-groups"] });
      // Invalidate projects queries to refresh approved projects list
      queryClient.invalidateQueries({ queryKey: ["committee-projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      // Invalidate registrations to refresh registration status
      queryClient.invalidateQueries({ queryKey: ["committee-registrations"] });
      queryClient.invalidateQueries({
        queryKey: ["committee-registrations-grouped"],
      });
    },
  });
}

/**
 * Hook for rejecting a proposal
 */
export function useRejectProposal() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({ id, reviewNotes }: { id: string; reviewNotes?: string }) => {
      if (!user) throw new Error("User not authenticated");
      return committeeProposalService.reject(id, user.id, reviewNotes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["committee-proposals"] });
      queryClient.invalidateQueries({
        queryKey: ["committee-proposals-table"],
      });
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({
        queryKey: ["committee-proposals-submissions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["committee-proposals-supervisor-submissions"],
      });
      queryClient.invalidateQueries({ queryKey: ["committee-unified-groups"] });
    },
  });
}

/**
 * Hook for requesting modification of a proposal
 */
export function useRequestModification() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({ id, reviewNotes }: { id: string; reviewNotes: string }) => {
      if (!user) throw new Error("User not authenticated");
      return committeeProposalService.requestModification(
        id,
        user.id,
        reviewNotes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["committee-proposals"] });
      queryClient.invalidateQueries({
        queryKey: ["committee-proposals-table"],
      });
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({
        queryKey: ["committee-proposals-submissions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["committee-proposals-supervisor-submissions"],
      });
      queryClient.invalidateQueries({ queryKey: ["committee-unified-groups"] });
    },
  });
}

/**
 * Hook for updating a proposal
 */
export function useUpdateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { title: string; description: string };
    }) => {
      return committeeProposalService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["committee-proposals"] });
      queryClient.invalidateQueries({
        queryKey: ["committee-proposals-table"],
      });
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({
        queryKey: ["committee-proposals-submissions"],
      });
    },
  });
}

/**
 * Hook for deleting a proposal
 */
export function useDeleteProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, force = false }: { id: string; force?: boolean }) => {
      return committeeProposalService.delete(id, force);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["committee-proposals"] });
      queryClient.invalidateQueries({
        queryKey: ["committee-proposals-table"],
      });
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({
        queryKey: ["committee-proposals-submissions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["committee-proposals-supervisor-submissions"],
      });
      queryClient.invalidateQueries({ queryKey: ["committee-unified-groups"] });
    },
  });
}
