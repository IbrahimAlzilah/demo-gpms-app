import { useProposal } from "../hooks/useProposals";

export function useProposalsView(proposalId: string) {
  const { data: proposal, isLoading } = useProposal(proposalId);

  return {
    proposal,
    isLoading,
  };
}
