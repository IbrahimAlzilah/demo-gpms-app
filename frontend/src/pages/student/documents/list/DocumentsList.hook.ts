import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/pages/auth/login";
import { useProjects } from "@/pages/student/projects/hooks/useProjects";
import { usePeriodCheck } from "@/hooks/usePeriodCheck";
import { useDataTable } from "@/hooks/useDataTable";
import { useQuery } from "@tanstack/react-query";
import { documentService } from "../api/document.service";
import { apiClient } from "@/lib/axios";
import type { Document } from "@/types/request.types";
import type { Grade } from "@/types/evaluation.types";
import type {
  DocumentsListState,
  DocumentsListData,
} from "./DocumentsList.types";

export function useDocumentsList() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  // Check if any document submission period is active
  const { isPeriodActive: isPhase1Active } = usePeriodCheck(
    "chapter_submission_phase_1",
  );
  const { isPeriodActive: isPhase2Active } = usePeriodCheck(
    "chapter_submission_phase_2",
  );
  const { isPeriodActive: isFinalDefense1Active } = usePeriodCheck(
    "final_defense_phase_1",
  );
  const { isPeriodActive: isFinalDefense2Active } = usePeriodCheck(
    "final_defense_phase_2",
  );
  const { isPeriodActive: isFinalActive, isLoading: periodLoading } =
    usePeriodCheck("final_project_document_submission");
  const isPeriodActive = isPhase1Active || isPhase2Active || isFinalActive;

  const [state, setState] = useState<DocumentsListState>({
    selectedDocument: null,
    showUploadForm: false,
    showWorkflowModal: false,
    selectedProjectId: undefined,
    selectedChapterForUpload: null,
  });

  // Get user's project
  const userProject = projects?.find((p) =>
    p.students.some((s) => s.id === user?.id),
  );

  // Fetch grades to check defense completion
  const { data: grades } = useQuery<Grade[]>({
    queryKey: ["student-grades"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Grade[] }>(
        "/student/grades",
      );
      return response.data?.data || [];
    },
    enabled: !!userProject,
    staleTime: 30000, // 30 seconds
  });

  // Set default project if user has one
  useEffect(() => {
    if (!state.selectedProjectId && userProject) {
      setTimeout(() => {
        setState((prev) => ({ ...prev, selectedProjectId: userProject.id }));
      }, 0);
    }
  }, [state.selectedProjectId, userProject]);

  const {
    data: documents,
    totalCount,
    pageCount,
    isLoading,
    error,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
  } = useDataTable({
    queryKey: ["student-documents-table", state.selectedProjectId || ""],
    queryFn: (params) =>
      documentService.getTableData(params, state.selectedProjectId),
    initialPageSize: 10,
    enableServerSide: true,
  });

  // Fetch all documents for the project (for chapter cards and workflow) so we have latest per chapter
  const { data: allDocumentsForProject } = useQuery({
    queryKey: ["documents", state.selectedProjectId, "all"],
    queryFn: () => documentService.getAllForProject(state.selectedProjectId!),
    enabled: !!state.selectedProjectId,
    staleTime: 0,
    refetchOnMount: true,
  });

  // For chapter cards: use latest document per chapter (by id) so resubmissions show current status
  const documentsForChapterCards = useMemo(() => {
    if (!allDocumentsForProject?.length) return [];
    const chapterDocs = allDocumentsForProject.filter(
      (d: Document) =>
        d.type === "chapters" && typeof d.chapterNumber === "number",
    );
    const latestByChapter = new Map<number, Document>();
    for (const doc of chapterDocs) {
      const n = doc.chapterNumber!;
      const existing = latestByChapter.get(n);
      if (
        !existing ||
        (doc.id && existing.id && String(doc.id) > String(existing.id))
      ) {
        latestByChapter.set(n, doc);
      }
    }
    return Array.from(latestByChapter.values());
  }, [allDocumentsForProject]);

  // Calculate statistics (from table data)
  const statistics = useMemo(() => {
    if (!documents) return { total: 0, pending: 0, approved: 0, rejected: 0 };

    return {
      total: documents.length,
      pending: documents.filter((d: Document) => d.reviewStatus === "pending")
        .length,
      approved: documents.filter((d: Document) => d.reviewStatus === "approved")
        .length,
      rejected: documents.filter((d: Document) => d.reviewStatus === "rejected")
        .length,
    };
  }, [documents]);

  const data: DocumentsListData = {
    documents: documents || [],
    documentsForChapterCards,
    statistics,
    isLoading: isLoading || periodLoading,
    error: error as Error | null,
  };

  // Check if project has supervisor
  const hasSupervisor = useMemo(() => {
    return !!userProject?.supervisorId || !!userProject?.supervisor;
  }, [userProject]);

  // Check if Final Defense 1 is completed (all students have approved grades)
  // const finalDefense1Completed = useMemo(() => {
  //   if (!userProject || !grades || !userProject.students?.length) return false;
  //   const projectGrades = grades.filter((g) => g.projectId === userProject.id);
  //   const studentIds = new Set(userProject.students.map((s) => s.id));
  //   const approvedGrades = projectGrades.filter(
  //     (g) =>
  //       g.isApproved &&
  //       g.finalGrade !== undefined &&
  //       studentIds.has(g.studentId),
  //   );
  //   return (
  //     approvedGrades.length === studentIds.size && approvedGrades.length > 0
  //   );
  // }, [userProject, grades]);

  const finalDefense1Completed = isPhase2Active ;

  // Check if Final Defense 2 is completed (similar check, but we'll use the same grades for now)
  // In a real system, you might have separate grade records for defense 1 and 2
  const finalDefense2Completed = useMemo(() => {
    // For now, we'll treat it the same as defense 1 completion
    // This can be enhanced when backend supports separate defense phases
    return finalDefense1Completed;
  }, [finalDefense1Completed]);

  return {
    data,
    state,
    setState,
    userProject,
    projectsLoading,
    isPeriodActive,
    periodLoading,
    isPhase1Active,
    isPhase2Active,
    isFinalDefense1Active,
    isFinalDefense2Active,
    isFinalActive,
    hasSupervisor,
    finalDefense1Completed,
    finalDefense2Completed,
    // Table controls
    totalCount,
    pageCount,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
    t,
  };
}
