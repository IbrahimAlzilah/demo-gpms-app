import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/pages/auth/login";
import { usePeriodCheck } from "@/hooks/usePeriodCheck";
import { proposalFormSchema, type ProposalFormSchema } from "../schema";
import type { ProposalFormData } from "../types/Proposals.types";

export interface UseProposalFormOptions {
  defaultValues?: Partial<ProposalFormData>;
  onSubmit?: (data: ProposalFormData) => Promise<void>;
}

/**
 * Hook for managing proposal form state and validation
 */
export function useProposalForm(options: UseProposalFormOptions = {}) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { isPeriodActive: isSubmissionPeriod, isLoading: submissionPeriodLoading } = usePeriodCheck(
    "proposal_submission"
  );
  const { isPeriodActive: isRegistrationPeriod, isLoading: registrationPeriodLoading } = usePeriodCheck(
    "project_registration"
  );
  const isPeriodActive = isSubmissionPeriod || isRegistrationPeriod;
  const periodLoading = submissionPeriodLoading || registrationPeriodLoading;
  const isRegistrationWindow = isRegistrationPeriod && !isSubmissionPeriod;
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [error, setError] = useState("");

  const form = useForm<ProposalFormSchema>({
    resolver: zodResolver(proposalFormSchema(t, isRegistrationWindow)),
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      proposedSupervisorId: "",
      studentGroupId: "",
      targetProjectId: "",
      teamMembers: [],
      ...options.defaultValues,
    },
  });

  const handleSubmit = async (data: ProposalFormSchema) => {
    if (!user) {
      setError(t("proposal.authRequired"));
      return;
    }

    if (!isPeriodActive) {
      setError(t("proposal.periodClosed"));
      return;
    }

    setError("");

    try {
      const formData: ProposalFormData = {
        title: data.title.trim(),
        description: data.description.trim(),
        requirements: data.requirements?.trim() || undefined,
        proposedSupervisorId: data.proposedSupervisorId || undefined,
        studentGroupId: data.studentGroupId || undefined,
        targetProjectId: data.targetProjectId || undefined,
        teamMembers: data.teamMembers?.filter(m => m.name.trim() && m.role.trim()) || [],
      };

      await options.onSubmit?.(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("proposal.submitError"));
    }
  };

  const handleFileChange = (files: File[]) => {
    setAttachedFiles(files);
    setError("");
  };

  const resetForm = () => {
    form.reset();
    setAttachedFiles([]);
    setError("");
  };

  return {
    form,
    attachedFiles,
    error,
    setError,
    isPeriodActive,
    periodLoading,
    isRegistrationWindow,
    handleSubmit: form.handleSubmit(handleSubmit),
    handleFileChange,
    resetForm,
    watch: form.watch,
  } as const;
}

export type UseProposalFormReturn = ReturnType<typeof useProposalForm>;
