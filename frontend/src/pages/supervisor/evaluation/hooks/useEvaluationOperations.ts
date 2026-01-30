import { useMutation, useQueryClient } from "@tanstack/react-query";
import { evaluationService } from "../api/evaluation.service";

/**
 * Hook for submitting supervisor grades
 */
export function useSubmitGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      studentId,
      grade,
    }: {
      projectId: string;
      studentId: string;
      grade: {
        score: number;
        maxScore: number;
        criteria: Record<string, number>;
        comments?: string;
      };
    }) => evaluationService.submitGrade(projectId, studentId, grade, ""),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["supervisor-grades", variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["supervisor-evaluations"],
      });
      queryClient.invalidateQueries({
        queryKey: ["supervisor-evaluation-projects"],
      });
    },
  });
}

/**
 * Hook for batch grading (group evaluation)
 */
export function useSubmitBatchGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      projectId: string;
      score: number;
      maxScore: number;
      comments?: string;
      studentIds?: string[];
    }) => evaluationService.submitBatchGrade(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["supervisor-grades", variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["supervisor-evaluations"],
      });
      queryClient.invalidateQueries({
        queryKey: ["supervisor-evaluation-projects"],
      });
    },
  });
}
