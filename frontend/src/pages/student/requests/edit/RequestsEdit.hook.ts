import { useEffect } from "react";
import { useToast } from "@/components/common";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateRequest } from "../hooks/useRequestOperations";
import {
  requestSubmissionSchema,
  type RequestSubmissionSchema,
} from "../schema";
import type { Request } from "@/types/request.types";

export function useRequestsEdit(
  request: Request | null,
  onSuccess?: () => void,
) {
  const { t } = useTranslation();
  const updateRequest = useUpdateRequest();
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

  // Update form when request changes (map snake_case additionalData to camelCase)
  useEffect(() => {
    if (request) {
      const ad = request.additionalData as Record<string, unknown> | undefined;
      form.reset({
        type: request.type,
        reason: request.reason || "",
        projectId: request.projectId || undefined,
        title: (ad?.title as string) ?? "",
        proposedSupervisorId:
          (ad?.proposed_supervisor_id as string) ?? undefined,
        targetGroupId: (ad?.target_group_id as string) ?? undefined,
        targetProjectId: (ad?.target_project_id as string) ?? undefined,
      });
    } else {
      form.reset({
        type: undefined,
        reason: "",
        projectId: undefined,
        title: "",
        proposedSupervisorId: undefined,
        targetGroupId: undefined,
        targetProjectId: undefined,
      });
    }
  }, [request]);

  const handleSubmit = async (data: RequestSubmissionSchema) => {
    if (!request) return;

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

    try {
      await updateRequest.mutateAsync({
        id: request.id,
        data: {
          type: data.type,
          reason: data.reason.trim(),
          projectId: data.projectId,
          additionalData: Object.keys(additionalData).length
            ? additionalData
            : undefined,
        },
      });
      toastSuccess("request.updateSuccess");
      onSuccess?.();
    } catch (err) {
      const apiMessage = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      const errorMessage =
        apiMessage ||
        (err instanceof Error ? err.message : t("request.updateError"));
      toastError(errorMessage);
    }
  };

  return {
    form,
    isLoading: updateRequest.isPending,
    handleSubmit: form.handleSubmit(handleSubmit),
  };
}
