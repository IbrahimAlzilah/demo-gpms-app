import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
} from "@/components/ui";
import { LoadingSpinner } from "@/components/common";
import { useToast } from "@/components/common";
import {
  AlertCircle,
  Users,
  FileText,
  User,
  ShieldCheck,
} from "lucide-react";
import { PerStudentGradingTable } from "@/components/evaluation/PerStudentGradingTable";
import { usePeriodCheck } from "@/hooks/usePeriodCheck";
import { discussionCommitteeProjectService } from "../../../projects/api/project.service";
import { committeeEvaluationService } from "../../api/evaluation.service";
import { useSubmitFinalGrade } from "../../hooks/useEvaluationOperations";
import type { Project } from "@/types/project.types";
import type { User as UserType } from "@/types/user.types";
import type { Grade, DefenseStage } from "@/types/evaluation.types";
import type { StudentGradeEntry } from "../../types/Evaluation.types";

export type EvaluationRole = "discussion_committee" | "supervisor";

export interface UnifiedEvaluationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  role: EvaluationRole;
  /** Called when user explicitly closes the modal (optional) */
  onSuccess?: () => void;
  /** For supervisor: fetch project via supervisor API */
  fetchProject?: (id: string) => Promise<Project | null>;
  fetchGrades?: (projectId: string) => Promise<Grade[]>;
  defenseStage?: DefenseStage;
  /** For supervisor: check if stage is locked (read-only after approval) */
  getLocked?: (projectId: string) => Promise<boolean>;
  /** When true, hides Close button (e.g. when embedded inline in Evaluate tab) */
  inline?: boolean;
  submitGrade?: (params: {
    projectId: string;
    studentId: string;
    defenseStage?: DefenseStage;
    grade: {
      score: number;
      maxScore: number;
      criteria: Record<string, unknown>;
      comments?: string;
    };
  }) => Promise<unknown>;
}

export function UnifiedEvaluationModal({
  open,
  onOpenChange,
  projectId,
  role,
  onSuccess,
  fetchProject: fetchProjectProp,
  fetchGrades: fetchGradesProp,
  submitGrade: submitGradeProp,
  defenseStage,
  getLocked,
  inline = false,
}: UnifiedEvaluationModalProps) {
  const { t } = useTranslation();
  const { toastSuccess, toastError } = useToast();
  const submitCommitteeGrade = useSubmitFinalGrade();

  const { isPeriodActive, isLoading: periodLoading } = usePeriodCheck(
    "final_defense_phase_1"
  );
  const { isPeriodActive: isPhase2Active } = usePeriodCheck(
    "final_defense_phase_2"
  );
  // Supervisors can evaluate anytime (only locked after approval); committee follows period
  const isPeriodActiveComputed =
    role === "supervisor" ? true : isPeriodActive || isPhase2Active;

  const queryClient = useQueryClient();

  // State
  const [studentGrades, setStudentGrades] = useState<
    Record<string, StudentGradeEntry>
  >({});
  const [groupScore, setGroupScore] = useState("");
  const [groupComments, setGroupComments] = useState("");
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null);
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);

  // Queries
  // Queries
  const projectQuery = useQuery({
    queryKey: [
      role === "discussion_committee"
        ? "discussion-project"
        : "supervisor-project",
      projectId,
    ],
    queryFn: () =>
      role === "discussion_committee"
        ? discussionCommitteeProjectService.getById(projectId)
        : fetchProjectProp?.(projectId) ?? Promise.resolve(null),
    enabled: open && !!projectId,
    staleTime: 0,
  });

  const gradesQuery = useQuery({
    queryKey: [
      role === "discussion_committee"
        ? "discussion-grades"
        : "supervisor-grades",
      projectId,
      defenseStage,
    ],
    queryFn: async () => {
      if (fetchGradesProp) return fetchGradesProp(projectId);

      if (defenseStage) {
        if (role === "discussion_committee") {
          return committeeEvaluationService.getDefenseEvaluations(projectId, defenseStage);
        }
      }
      return role === "discussion_committee"
        ? committeeEvaluationService.getEvaluationsByProject(projectId)
        : Promise.resolve([]);
    },
    enabled: open && !!projectId,
    staleTime: 0,
  });

  const lockedQuery = useQuery({
    queryKey: ["supervisor-defense-locked", projectId, defenseStage],
    queryFn: () => (getLocked ? getLocked(projectId) : Promise.resolve(false)),
    enabled: open && !!projectId && role === "supervisor" && !!getLocked,
    staleTime: 0,
  });

  const project = projectQuery.data ?? null;
  const grades = gradesQuery.data ?? [];
  const students = (project?.students as UserType[] | undefined) ?? [];

  // Initialize student grades from existing data
  useEffect(() => {
    if (!open || !students.length) return;
    const next: Record<string, StudentGradeEntry> = {};
    const gradesByStudent = new Map<string, Grade>();
    grades.forEach((g) => {
      const sid =
        typeof g.studentId === "string"
          ? g.studentId
          : (g.student as { id?: string })?.id;
      if (sid) gradesByStudent.set(sid, g);
    });
    students.forEach((s) => {
      const g = gradesByStudent.get(s.id);
      const committeeGrade =
        g?.committeeGrade ?? (g as unknown as Record<string, unknown>)?.committee_grade;
      const supervisorGrade =
        g?.supervisorGrade ?? (g as unknown as Record<string, unknown>)?.supervisor_grade;
      const source =
        role === "discussion_committee" ? committeeGrade : supervisorGrade;
      const sourceObj = source as Record<string, unknown> | undefined;
      const score = sourceObj?.score ?? "";
      next[s.id] = {
        studentId: s.id,
        score: String(score),
        maxScore: "100",
        comments: (sourceObj?.comments as string) ?? "",
        hasExistingGrade: !!sourceObj?.score,
      };
    });
    setStudentGrades(next);
  }, [open, students, grades, role]);

  // Check if grades are locked (supervisor: by stage; committee: by approval on grades)
  const gradesLocked =
    (role === "supervisor" && lockedQuery.data === true) ||
    grades.some((g: Grade) => g.isApproved === true);

  // Apply group grade to all students (0-100) and save to backend
  const handleApplyGroupGrade = useCallback(async () => {
    const scoreVal = groupScore.trim();
    if (!scoreVal) {
      toastError(t("evaluation.enterGroupGrade"));
      return;
    }
    const numScore = parseFloat(scoreVal);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      toastError(t("discussion.invalidScore"));
      return;
    }

    setIsSubmittingGroup(true);
    try {
      if (role === "discussion_committee") {
        if (defenseStage) {
          // Defense Bulk
          const items = students.map((s) => ({
            studentId: s.id,
            score: numScore,
            maxScore: 100,
            notes: groupComments,
          }));
          await committeeEvaluationService.submitDefenseBulkEvaluation({
            projectId,
            stage: defenseStage,
            items,
          });
        } else {
          // Regular Batch
          await committeeEvaluationService.submitBatchGrade({
            projectId,
            score: numScore,
            maxScore: 100,
            comments: groupComments,
            studentIds: students.map((s) => s.id),
          });
        }
      } else {
        // Supervisor - use individual submissions concurrently
        if (submitGradeProp) {
          await Promise.all(
            students.map((s) =>
              submitGradeProp({
                projectId,
                studentId: s.id,
                defenseStage,
                grade: {
                  score: numScore,
                  maxScore: 100,
                  criteria: {},
                  comments: groupComments,
                },
              })
            )
          );
        }
      }

      // Update local state to reflect saved status
      const next: Record<string, StudentGradeEntry> = {};
      students.forEach((s) => {
        next[s.id] = {
          studentId: s.id,
          score: scoreVal,
          maxScore: "100",
          comments: groupComments,
          hasExistingGrade: true,
        };
      });
      setStudentGrades(next);
      toastSuccess(t("evaluation.groupGradeApplied"));

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey:
          role === "discussion_committee"
            ? ["discussion-grades", projectId, defenseStage]
            : ["supervisor-grades", projectId, defenseStage],
      });
    } catch (error) {
      toastError(
        error instanceof Error ? error.message : t("discussion.evaluationError")
      );
    } finally {
      setIsSubmittingGroup(false);
    }
  }, [
    groupScore,
    groupComments,
    students,
    role,
    defenseStage,
    projectId,
    submitGradeProp,
    queryClient,
    t,
    toastError,
    toastSuccess,
  ]);

  // Update individual student grade
  const setGradeForStudent = useCallback(
    (
      studentId: string,
      field: "score" | "comments",
      value: string
    ) => {
      setStudentGrades((prev) => ({
        ...prev,
        [studentId]: {
          ...(prev[studentId] ?? {
            studentId,
            score: "",
            maxScore: "100",
            comments: "",
          }),
          [field]: value,
        },
      }));
    },
    []
  );

  // Submit single student grade
  const handleSaveStudent = useCallback(
    async (studentId: string) => {
      if (!isPeriodActiveComputed) {
        toastError(t("discussion.evaluationPeriodClosed"));
        return;
      }
      const entry = studentGrades[studentId];
      if (!entry?.score?.trim()) return;
      const score = parseFloat(entry.score);
      if (isNaN(score) || score < 0 || score > 100) {
        toastError(t("discussion.invalidScore"));
        return;
      }

      setSavingStudentId(studentId);
      try {
        const submit = submitGradeProp
          ? (p: {
            projectId: string;
            studentId: string;
            defenseStage?: DefenseStage;
            grade: {
              score: number;
              maxScore: number;
              criteria: Record<string, unknown>;
              comments?: string;
            };
          }) => submitGradeProp(p)
          : (
            p: Parameters<typeof committeeEvaluationService.submitFinalGrade>[0]
          ) => {
            if (defenseStage) {
              return committeeEvaluationService.submitDefenseEvaluation({
                ...p,
                defenseStage,
              });
            }
            return submitCommitteeGrade.mutateAsync(p);
          };

        await submit({
          projectId,
          studentId,
          ...(defenseStage ? { defenseStage } : {}),
          grade: {
            score,
            maxScore: 100,
            criteria: {} as Record<string, unknown>,
            comments: entry.comments?.trim() || undefined,
          },
        });

        toastSuccess(t("discussion.evaluationSaved"));
        setStudentGrades((prev) => ({
          ...prev,
          [studentId]: {
            ...(prev[studentId] ?? { studentId, score: "", maxScore: "100", comments: "" }),
            hasExistingGrade: true,
          },
        }));

        // Refetch grades (keep modal open for per-row grading)
        queryClient.invalidateQueries({
          queryKey:
            role === "discussion_committee"
              ? ["discussion-grades", projectId, defenseStage]
              : ["supervisor-grades", projectId, defenseStage],
        });
      } catch (err) {
        toastError(
          err instanceof Error ? err.message : t("discussion.evaluationError")
        );
      } finally {
        setSavingStudentId(null);
      }
    },
    [
      studentGrades,
      isPeriodActiveComputed,
      submitGradeProp,
      defenseStage,
      projectId,
      role,
      queryClient,
      t,
      toastError,
      toastSuccess,
      submitCommitteeGrade,
    ]
  );

  if (!projectId) return null;

  if (periodLoading || projectQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isPeriodActiveComputed) {
    return (
      <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
            <AlertCircle className="h-5 w-5" />
            {t("discussion.evaluationPeriodClosed")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("discussion.evaluationPeriodClosedMessage")}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            {t("project.projectNotFound")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const documents = (
    project as {
      documents?: Array<{
        id: string;
        file_name?: string;
        chapter_number?: number;
      }>;
    }
  ).documents ?? [];

  // Calculate progress stats
  const totalStudents = students.length;
  const evaluatedCount = Object.values(studentGrades).filter(
    (g) => g.score && parseFloat(g.score) >= 0
  ).length;
  const progressPercent =
    totalStudents > 0 ? Math.round((evaluatedCount / totalStudents) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Grade Lock Warning */}
      {/* {gradesLocked && (
        <Alert
          variant="default"
          className="border-amber-500/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30"
        >
          <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            {t("evaluation.gradesLockedReadOnly")}
          </AlertDescription>
        </Alert>
      )} */}

      {/* Project Header Card */}
      <Card className="overflow-hidden border bg-linear-to-br from-primary/5 via-primary/10 to-primary/5 shadow-none">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {project.title}
                </h3>
              </div>
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 max-w-2xl">
                  {project.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {project.supervisor && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>
                      {t("project.supervisor")}: {project.supervisor.name}
                    </span>
                  </div>
                )}
                {role === "discussion_committee" && documents.length > 0 && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>
                      {documents.length} {t("committee.distribute.documents")}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    {totalStudents} {t("common.students")}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-background/80 px-6 py-4 shadow-inner">
              <div className="relative h-14 w-14">
                <svg
                  className="h-full w-full -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-muted/20"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${progressPercent}, 100`}
                    className="text-primary transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {progressPercent}%
                  </span>
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {evaluatedCount}/{totalStudents} {t("discussion.evaluated")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Apply Group Grade (quick action) */}
      {!gradesLocked && students.length > 1 && (
        <Card className="border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("evaluation.applyGroupGrade")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1.5 flex-1 min-w-[120px]">
                <Label className="text-xs font-medium">{t("evaluation.grade")} (0–100)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={groupScore}
                  onChange={(e) => setGroupScore(e.target.value)}
                  placeholder="0"
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5 flex-1 min-w-[180px]">
                <Label className="text-xs font-medium">{t("discussion.comments")} ({t("common.optional")})</Label>
                <Input
                  value={groupComments}
                  onChange={(e) => setGroupComments(e.target.value)}
                  placeholder={t("discussion.commentsPlaceholder")}
                  className="h-10"
                />
              </div>
              <Button
                onClick={handleApplyGroupGrade}
                className="h-10 gap-2"
                disabled={isSubmittingGroup || !groupScore}
              >
                {isSubmittingGroup ? <LoadingSpinner size="sm" /> : null}
                {t("evaluation.apply")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Per-student grading table */}
      <Card className="border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("evaluation.individualGrades")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("evaluation.studentGroupMembers")}
          </p>
        </CardHeader>
        <CardContent>
          <PerStudentGradingTable
            students={students}
            grades={Object.fromEntries(
              students.map((s) => {
                const e = studentGrades[s.id] ?? { studentId: s.id, score: "", maxScore: "100", comments: "", hasExistingGrade: false };
                return [
                  s.id,
                  {
                    studentId: s.id,
                    score: e.score,
                    comments: e.comments,
                    hasExistingGrade: e.hasExistingGrade ?? false,
                  },
                ];
              })
            )}
            onGradeChange={setGradeForStudent}
            onSave={handleSaveStudent}
            gradesLocked={gradesLocked}
            savingStudentId={savingStudentId}
          />
        </CardContent>
      </Card>

      {/* Action Buttons - hide Close when embedded inline */}
      {!inline && (
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => {
              onSuccess?.();
              onOpenChange(false);
            }}
          >
            {t("common.close")}
          </Button>
        </div>
      )}
    </div >
  );
}
