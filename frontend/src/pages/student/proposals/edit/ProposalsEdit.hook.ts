import { useEffect } from "react";
import { useProposalForm } from "../hooks/useProposalForm";
import { useUpdateProposal } from "../hooks/useProposalOperations";
import { useProposal } from "../hooks/useProposals";
import { useTranslation } from "react-i18next";

export function useProposalsEdit(proposalId: string, onSuccess?: () => void) {
  const { t } = useTranslation();
  const { data: proposal, isLoading } = useProposal(proposalId);
  const updateProposal = useUpdateProposal();

  const form = useProposalForm({
    defaultValues: proposal
      ? {
          title: proposal.title,
          description: proposal.description,
          objectives: proposal.objectives,
          methodology: proposal.methodology,
          expectedOutcomes: proposal.expectedOutcomes,
        }
      : undefined,
    onSubmit: async (data) => {
      // Validate proposal status before allowing edit
      if (!proposal) {
        form.setError(t("proposal.loadError"));
        throw new Error("Proposal not found");
      }

      if (proposal.status !== "pending_review") {
        const errorMsg = t("proposal.cannotEdit");
        form.setError(errorMsg);
        throw new Error(errorMsg);
      }

      try {
        await updateProposal.mutateAsync({
          id: proposalId,
          data,
        });

        onSuccess?.();
      } catch (error) {
        // Error is handled by the mutation's onError, but we can set form error too
        const errorMessage =
          error instanceof Error
            ? error.message
            : t("proposal.submitError");
        form.setError(errorMessage);
        throw error; // Re-throw to prevent form from thinking it succeeded
      }
    },
  });

  // Update form when proposal loads
  useEffect(() => {
    if (proposal && form.form) {
      form.form.reset({
        title: proposal.title,
        description: proposal.description,
        objectives: proposal.objectives,
        methodology: proposal.methodology,
        expectedOutcomes: proposal.expectedOutcomes,
      });
    }
  }, [proposal, form.form]);

  return {
    form,
    proposal,
    isLoading,
    isSubmitting: updateProposal.isPending,
  };
}
