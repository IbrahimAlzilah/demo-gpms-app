import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/common";
import { committeeProposalService } from "../api/proposal.service";
import {
  proposalCreateSchema,
  type ProposalCreateSchema,
} from "../schema/proposal-create.schema";

export function useProposalsNew(onSuccess?: () => void) {
  const { t } = useTranslation();
  const { toastSuccess, toastError } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProposalCreateSchema>({
    resolver: zodResolver(proposalCreateSchema(t)),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const { reset } = form;

  const createMutation = useMutation({
    mutationFn: committeeProposalService.create,
    onSuccess: () => {
      toastSuccess("committee.proposal.createSuccess");
      queryClient.invalidateQueries({ queryKey: ["committee-proposals"] });
      queryClient.invalidateQueries({
        queryKey: ["committee-proposals-table"],
      });
      queryClient.invalidateQueries({
        queryKey: ["committee-proposals-supervisor-submissions"],
      });
      reset();
      onSuccess?.();
    },
    onError: (err: any) => {
      const errorMsg =
        err?.response?.data?.message || err?.message || "common.error";
      toastError(errorMsg);
    },
  });

  const handleSubmit = async (data: ProposalCreateSchema) => {
    await createMutation.mutateAsync({
      title: data.title,
      description: data.description,
    });
  };

  const resetForm = () => {
    reset();
  };

  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    isSubmitting: createMutation.isPending,
    resetForm,
  };
}
