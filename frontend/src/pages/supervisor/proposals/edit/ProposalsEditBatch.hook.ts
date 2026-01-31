import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/common";
import { useAuthStore } from "@/pages/auth/login";
import { proposalService } from "../api/proposal.service";
import { usePeriodCheck } from "@/hooks/usePeriodCheck";
import type { ProposalFormData } from "../types/Proposals.types";

interface ProposalItem extends ProposalFormData {
  id: string;
  isNew?: boolean;
  status?: "pending_review" | "approved" | "rejected" | "requires_modification";
  errors?: Record<string, string>;
}

export function useProposalsEditBatch(onSuccess?: () => void) {
  const { t } = useTranslation();
  const { toastSuccess, toastError } = useToast();
  const { user } = useAuthStore();
  const { isPeriodActive: isSubmissionPeriod } = usePeriodCheck(
    "proposal_submission",
  );
  const isPeriodActive = isSubmissionPeriod;

  const [existingProposals, setExistingProposals] = useState<ProposalItem[]>(
    [],
  );
  const [newProposals, setNewProposals] = useState<ProposalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editBlocked, setEditBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<string | null>(null);
  const isLoadingRef = useRef(false);

  // Load all editable proposals for the supervisor using submission context
  useEffect(() => {
    // Prevent multiple simultaneous calls
    if (isLoadingRef.current) {
      return;
    }

    // Only load if we have a user
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadProposals = async () => {
      isLoadingRef.current = true;
      setIsLoading(true);
      setEditBlocked(false);
      setBlockReason(null);

      try {
        const context = await proposalService.getSubmissionContext();

        // Ensure context exists (proposals can be empty array - that's OK, means no proposals yet)
        if (!context) {
          console.warn("Submission context is invalid:", context);
          const errorMessage = t("proposal.loadError");
          setEditBlocked(true);
          setBlockReason(errorMessage);
          setExistingProposals([]);
          setIsLoading(false);
          isLoadingRef.current = false;
          return;
        }

        // Map ALL proposals to ProposalItem format (approved, rejected, pending)
        // Supervisors can always add new proposals; only pending_review/requires_modification are editable
        const proposals = Array.isArray(context.proposals)
          ? context.proposals
          : [];
        setExistingProposals(
          proposals.map(
            (p: {
              id: string;
              title?: string;
              description?: string;
              status?: string;
            }) => ({
              id: String(p.id),
              title: p.title || "",
              description: p.description || "",
              isNew: false,
              status: p.status as ProposalItem["status"],
            }),
          ),
        );
        setEditBlocked(false);
        setBlockReason(null);
      } catch (error: any) {
        console.error("Failed to load submission context:", error);

        let errorMessage = t("proposal.loadError");
        if (error.response?.status === 404) {
          setExistingProposals([]);
          setEditBlocked(false);
          setBlockReason(null);
          setIsLoading(false);
          isLoadingRef.current = false;
          return;
        }
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        setEditBlocked(true);
        setBlockReason(errorMessage);
        toastError(errorMessage);
        setExistingProposals([]);
      } finally {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    };

    loadProposals();
  }, [user?.id]); // Reload if user changes

  const addNewProposal = () => {
    setNewProposals([
      ...newProposals,
      {
        id: `new-${Date.now()}`,
        title: "",
        description: "",
        isNew: true,
      },
    ]);
  };

  const removeNewProposal = (id: string) => {
    setNewProposals(newProposals.filter((p) => p.id !== id));
  };

  const updateProposal = (id: string, data: Partial<ProposalFormData>) => {
    // Check if it's an existing proposal
    const existingIndex = existingProposals.findIndex((p) => p.id === id);
    if (existingIndex >= 0) {
      setExistingProposals(
        existingProposals.map((p) =>
          p.id === id ? { ...p, ...data, errors: undefined } : p,
        ),
      );
    } else {
      // It's a new proposal
      setNewProposals(
        newProposals.map((p) =>
          p.id === id ? { ...p, ...data, errors: undefined } : p,
        ),
      );
    }
  };

  const validateProposals = (): boolean => {
    let isValid = true;

    const validateProposal = (proposal: ProposalItem): ProposalItem => {
      const errors: Record<string, string> = {};

      if (!proposal.title?.trim()) {
        errors.title = t("proposal.validation.titleRequired");
        isValid = false;
      }

      if (!proposal.description?.trim()) {
        errors.description = t("proposal.validation.descriptionRequired");
        isValid = false;
      }

      return {
        ...proposal,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
      };
    };

    setExistingProposals(existingProposals.map(validateProposal));
    setNewProposals(newProposals.map(validateProposal));
    return isValid;
  };

  const handleSubmit = async () => {
    if (!user) {
      toastError(t("proposal.authRequired"));
      return;
    }

    if (!isPeriodActive) {
      // Check if any proposal requires modification (allows editing even outside windows)
      // For supervisors, we check if any existing proposal has requires_modification status
      // This is handled on the backend, but we can still show a warning
      const hasModificationRequired = existingProposals.length > 0;

      if (!hasModificationRequired && newProposals.length > 0) {
        toastError(t("proposal.periodClosed"));
        return;
      }
    }

    if (!validateProposals()) {
      toastError(t("proposal.validationErrors"));
      return;
    }

    setIsSubmitting(true);
    try {
      // Only send updates for proposals that are still editable (pending_review or requires_modification)
      const editableStatuses = [
        "pending_review",
        "requires_modification",
      ] as const;
      const updates = existingProposals
        .filter((p) => p.status && editableStatuses.includes(p.status))
        .map((p) => ({
          id: p.id,
          title: p.title.trim(),
          description: p.description.trim(),
        }));

      const newProposalsData: ProposalFormData[] = newProposals.map((p) => ({
        title: p.title.trim(),
        description: p.description.trim(),
      }));

      await proposalService.updateBatch(updates, newProposalsData);

      toastSuccess(t("proposal.updateSuccess"));
      onSuccess?.();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        t("proposal.updateError");
      toastError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    existingProposals,
    newProposals,
    addNewProposal,
    removeNewProposal,
    updateProposal,
    handleSubmit,
    isLoading,
    isSubmitting,
    editBlocked,
    blockReason,
  };
}
