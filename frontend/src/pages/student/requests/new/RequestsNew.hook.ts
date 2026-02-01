import { useState } from "react";
import { useToast } from "@/components/common";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateRequest } from "../hooks/useRequestOperations";
import {
  requestSubmissionSchema,
  type RequestSubmissionSchema,
} from "../schema";

export function useRequestsNew(onSuccess?: () => void) {
  const { t } = useTranslation();
  const createRequest = useCreateRequest();
  const { toastSuccess, toastError } = useToast();

  const form = useForm<RequestSubmissionSchema>({
    resolver: zodResolver(requestSubmissionSchema(t)),
    defaultValues: {
      type: undefined,
      reason: "",
      projectId: undefined,
      title: "",
      proposedSupervisorId: undefined,
      targetGroupId: undefined,
      targetProjectId: undefined,
    },
  });

  const handleSubmit = async (data: RequestSubmissionSchema) => {
    try {
      const additionalData: Record<string, unknown> = {};
      if (data.proposedSupervisorId)
        additionalData.proposedSupervisorId = data.proposedSupervisorId;
      if (data.targetGroupId) additionalData.targetGroupId = data.targetGroupId;
      if (data.targetProjectId)
        additionalData.targetProjectId = data.targetProjectId;
      if (
        (data.type === "change_project_title" || data.type === "other") &&
        data.title?.trim()
      ) {
        additionalData.title = data.title.trim();
      }

      await createRequest.mutateAsync({
        type: data.type,
        reason: data.reason.trim(),
        projectId: data.projectId,
        additionalData: Object.keys(additionalData).length
          ? additionalData
          : undefined,
      });
      toastSuccess("request.submitSuccess");
      form.reset();
      onSuccess?.();
    } catch (err) {
      const apiMessage = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      const errorMessage =
        apiMessage ||
        (err instanceof Error ? err.message : t("request.submitError"));
      toastError(errorMessage);
    }
  };

  return {
    form,
    isLoading: createRequest.isPending,
    handleSubmit: form.handleSubmit(handleSubmit),
  };
}
