import { useMutation, useQueryClient } from "@tanstack/react-query";
import { committeeGradeService } from "../api/grade.service";

/**
 * Hook for approving a grade
 */
export function useApproveGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      gradeId,
      comments,
    }: {
      gradeId: string;
      comments?: string;
    }) => committeeGradeService.approve(gradeId, { comments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["committee-grades"] });
      queryClient.invalidateQueries({ queryKey: ["committee-grades-table"] });
      queryClient.invalidateQueries({ queryKey: ["student-grades"] });
    },
  });
}

/**
 * Hook for publishing approved grades to students
 */
export function usePublishGrades() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gradeIds: string[]) => committeeGradeService.publish(gradeIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["committee-grades"] });
      queryClient.invalidateQueries({ queryKey: ["committee-grades-table"] });
      queryClient.invalidateQueries({ queryKey: ["student-grades"] });
    },
  });
}
