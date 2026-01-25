import { useState, useEffect } from "react";
import { useToast } from "@/components/common";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/pages/auth/login";
import { usePeriodCheck } from "@/hooks/usePeriodCheck";
import { useMyGroup } from "@/pages/student/groups/hooks/useGroups";
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
  const { data: studentGroup } = useMyGroup();
  const isPeriodActive = isSubmissionPeriod || isRegistrationPeriod;
  const periodLoading = submissionPeriodLoading || registrationPeriodLoading;
  const isRegistrationWindow = isRegistrationPeriod && !isSubmissionPeriod;
  
  // Rule 5: After group creation, all proposals must be submitted under the group name
  // Group is required if: (1) student is in a group, OR (2) it's registration-only window
  const requireGroup = !!studentGroup || isRegistrationWindow;
  
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const { toastError } = useToast()

  const form = useForm<ProposalFormSchema>({
    resolver: zodResolver(proposalFormSchema(t, requireGroup, isRegistrationWindow, !!studentGroup)),
    defaultValues: {
      title: "",
      description: "",
      studentGroupId: studentGroup ? String(studentGroup.id) : "",
      targetProjectId: "",
      ...options.defaultValues,
    },
  });

  // Update form when studentGroup loads to auto-select and clear errors
  useEffect(() => {
    if (studentGroup) {
      const groupId = String(studentGroup.id);
      const currentValue = form.getValues('studentGroupId');
      
      // Set the group ID if it's not already set, and clear errors
      if (currentValue !== groupId) {
        form.setValue('studentGroupId', groupId, { 
          shouldValidate: false, // Don't validate to avoid showing wrong message
          shouldDirty: false 
        });
      }
      // Always clear errors when group is available
      form.clearErrors('studentGroupId');
    }
  }, [studentGroup, form]);

  const handleSubmit = async (data: ProposalFormSchema) => {
    if (!user) {
      toastError(t("proposal.authRequired"));
      return;
    }

    if (!isPeriodActive) {
      toastError(t("proposal.periodClosed"));
      return;
    }

    try {
      const formData: ProposalFormData = {
        title: data.title.trim(),
        description: data.description.trim(),
        studentGroupId: data.studentGroupId || undefined,
        targetProjectId: data.targetProjectId || undefined,
      };

      await options.onSubmit?.(formData);
    } catch (err) {
      toastError(err instanceof Error ? err.message : t("proposal.submitError"));
    }
  };

  const handleFileChange = (files: File[]) => {
    setAttachedFiles(files);
  };

  const resetForm = () => {
    form.reset();
    setAttachedFiles([]);
  };

  return {
    form,
    attachedFiles,
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
