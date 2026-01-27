import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { useToast } from "@/components/common";
import { committeeProposalService } from "../api/proposal.service";
import {
  proposalCreateSchema,
  type ProposalCreateSchema,
} from "../schema/proposal-create.schema";

interface Student {
  id: string;
  name: string;
  email: string;
  university_id: string;
}

export function useProposalsNew(onSuccess?: () => void) {
  const { t } = useTranslation();
  const { toastSuccess, toastError } = useToast();
  const queryClient = useQueryClient();
  const [studentSearch, setStudentSearch] = useState("");

  const form = useForm<ProposalCreateSchema>({
    resolver: zodResolver(proposalCreateSchema(t)),
    defaultValues: {
      submitterId: "",
      title: "",
      description: "",
    },
  });

  const { reset, setValue } = form;

  // Search students query
  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ["students-search", studentSearch],
    queryFn: async () => {
      const response = await apiClient.get<Student[]>(
        "/projects-committee/proposals/students/search",
        {
          params: { query: studentSearch },
        },
      );
      return response.data;
    },
    enabled: !!studentSearch,
    staleTime: 0,
    refetchOnMount: true,
  });

  const createMutation = useMutation({
    mutationFn: committeeProposalService.create,
    onSuccess: () => {
      toastSuccess("committee.proposal.createSuccess");
      queryClient.invalidateQueries({ queryKey: ["committee-proposals"] });
      queryClient.invalidateQueries({
        queryKey: ["committee-proposals-table"],
      });
      reset();
      setStudentSearch("");
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
      submitterId: data.submitterId,
    });
  };

  const handleSearchChange = (val: string) => {
    setStudentSearch(val);
    if (val === "") {
      setValue("submitterId", "");
    }
  };

  const resetForm = () => {
    reset();
    setStudentSearch("");
  };

  return {
    form,
    students,
    loadingStudents,
    studentSearch,
    handleSearchChange,
    handleSubmit: form.handleSubmit(handleSubmit),
    isSubmitting: createMutation.isPending,
    resetForm,
  };
}
