import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Alert,
  AlertDescription,
  Badge,
} from "@/components/ui";
import { LoadingSpinner } from "@/components/common";
import { useToast } from "@/components/common";
import {
  AlertCircle,
  Loader2,
  Users,
  FileText,
  User,
  Lock,
  CheckCircle2,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { usePeriodCheck } from "@/hooks/usePeriodCheck";
import { discussionCommitteeProjectService } from "../../../projects/api/project.service";
import { committeeEvaluationService } from "../../api/evaluation.service";
import { useSubmitFinalGrade } from "../../hooks/useEvaluationOperations";
import type { Project } from "@/types/project.types";
import type { User as UserType } from "@/types/user.types";
import type { Grade } from "@/types/evaluation.types";
import type { EvaluationMode, StudentGradeEntry } from "../../types/Evaluation.types";

export type EvaluationRole = "discussion_committee" | "supervisor";

export interface UnifiedEvaluationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  role: EvaluationRole;
  onSuccess?: () => void;
  /** For supervisor: fetch project via supervisor API */
  fetchProject?: (id: string) => Promise<Project | null>;
  fetchGrades?: (projectId: string) => Promise<Grade[]>;
  submitGrade?: (params: {
    projectId: string;
    studentId: string;
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
  const isPeriodActiveComputed = isPeriodActive || isPhase2Active;

  // State
  const [evaluationMode, setEvaluationMode] = useState<EvaluationMode>("group");
  const [studentGrades, setStudentGrades] = useState<
    Record<string, StudentGradeEntry>
  >({});
  const [groupScore, setGroupScore] = useState("");
  const [groupMaxScore, setGroupMaxScore] = useState("100");
  const [groupComments, setGroupComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(
    null
  );

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
    ],
    queryFn: () =>
      role === "discussion_committee"
        ? committeeEvaluationService.getEvaluationsByProject(projectId)
        : fetchGradesProp?.(projectId) ?? Promise.resolve([]),
    enabled: open && !!projectId,
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
        g?.committeeGrade ?? (g as Record<string, unknown>)?.committee_grade;
      const supervisorGrade =
        g?.supervisorGrade ?? (g as Record<string, unknown>)?.supervisor_grade;
      const source =
        role === "discussion_committee" ? committeeGrade : supervisorGrade;
      const sourceObj = source as Record<string, unknown> | undefined;
      const score = sourceObj?.score ?? "";
      const maxScore = sourceObj?.maxScore ?? sourceObj?.max_score ?? "100";
      next[s.id] = {
        studentId: s.id,
        score: String(score),
        maxScore: String(maxScore),
        comments: (sourceObj?.comments as string) ?? "",
        hasExistingGrade: !!sourceObj?.score,
      };
    });
    setStudentGrades(next);
  }, [open, students, grades, role]);

  // Check if grades are locked
  const gradesLocked = grades.some((g: Grade) => g.isApproved === true);

  // Apply group grade to all students
  const handleApplyGroupGrade = useCallback(() => {
    const score = groupScore.trim();
    const max = groupMaxScore.trim();
    if (!score || !max) {
      toastError(t("evaluation.enterGroupGrade"));
      return;
    }
    const numScore = parseFloat(score);
    const numMax = parseFloat(max);
    if (isNaN(numScore) || isNaN(numMax) || numScore < 0 || numScore > numMax) {
      toastError(t("discussion.invalidScore"));
      return;
    }
    const next: Record<string, StudentGradeEntry> = {};
    students.forEach((s) => {
      next[s.id] = {
        studentId: s.id,
        score,
        maxScore: max,
        comments: groupComments,
        hasExistingGrade: studentGrades[s.id]?.hasExistingGrade,
      };
    });
    setStudentGrades(next);
    toastSuccess(t("evaluation.groupGradeApplied"));
  }, [groupScore, groupMaxScore, groupComments, students, studentGrades, t, toastError, toastSuccess]);

  // Update individual student grade
  const setGradeForStudent = useCallback(
    (
      studentId: string,
      field: keyof Omit<StudentGradeEntry, "studentId" | "isLoading" | "hasExistingGrade">,
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

  // Submit all grades
  const handleSubmit = async () => {
    if (!isPeriodActiveComputed) {
      toastError(t("discussion.evaluationPeriodClosed"));
      return;
    }

    const toSubmit: Array<{
      studentId: string;
      score: number;
      maxScore: number;
      comments?: string;
    }> = [];

    students.forEach((s) => {
      const entry = studentGrades[s.id];
      if (!entry?.score?.trim() || !entry?.maxScore?.trim()) return;
      const score = parseFloat(entry.score);
      const maxScore = parseFloat(entry.maxScore);
      if (isNaN(score) || isNaN(maxScore) || score < 0 || score > maxScore)
        return;
      toSubmit.push({
        studentId: s.id,
        score,
        maxScore,
        comments: entry.comments?.trim() || undefined,
      });
    });

    if (toSubmit.length === 0) {
      toastError(t("evaluation.enterAtLeastOneGrade"));
      return;
    }

    setSubmitting(true);
    try {
      const submit = submitGradeProp
        ? (p: {
          projectId: string;
          studentId: string;
          grade: {
            score: number;
            maxScore: number;
            criteria: Record<string, unknown>;
            comments?: string;
          };
        }) => submitGradeProp(p)
        : (
          p: Parameters<typeof committeeEvaluationService.submitFinalGrade>[0]
        ) => submitCommitteeGrade.mutateAsync(p);

      for (const item of toSubmit) {
        await submit({
          projectId,
          studentId: item.studentId,
          grade: {
            score: item.score,
            maxScore: item.maxScore,
            criteria: {} as Record<string, unknown>,
            comments: item.comments,
          },
        });
      }
      toastSuccess(t("discussion.evaluationSaved"));
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      toastError(
        err instanceof Error ? err.message : t("discussion.evaluationError")
      );
    } finally {
      setSubmitting(false);
    }
  };

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
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  {project.title}
                </h3>
              </div>
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 max-w-2xl">
                  {project.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-sm">
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
              <div className="relative h-16 w-16">
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

      {/* Evaluation Mode Toggle & Group Grade */}
      {!gradesLocked && (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                {t("evaluation.applyGroupGrade")}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={evaluationMode === "group" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEvaluationMode("group")}
                  className="h-8"
                >
                  <Users className="mr-1.5 h-3.5 w-3.5" />
                  {t("common.group")}
                </Button>
                <Button
                  variant={evaluationMode === "individual" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEvaluationMode("individual")}
                  className="h-8"
                >
                  <User className="mr-1.5 h-3.5 w-3.5" />
                  {t("common.individual")}
                </Button>
              </div>
            </div>
          </CardHeader>
          {evaluationMode === "group" && (
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {t("discussion.score")}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={groupScore}
                    onChange={(e) => setGroupScore(e.target.value)}
                    placeholder="0"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {t("discussion.maxScore")}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={groupMaxScore}
                    onChange={(e) => setGroupMaxScore(e.target.value)}
                    placeholder="100"
                    className="h-10"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={handleApplyGroupGrade}
                    className="w-full h-10 gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {t("evaluation.applyToAll")}
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  {t("discussion.comments")} ({t("common.optional")})
                </Label>
                <Textarea
                  value={groupComments}
                  onChange={(e) => setGroupComments(e.target.value)}
                  placeholder={t("discussion.commentsPlaceholder")}
                  rows={2}
                  className="resize-none"
                />
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Student List */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            {t("evaluation.individualGrades")}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {t("evaluation.studentGroupMembers")}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {students.map((student, index) => {
            const entry = studentGrades[student.id] ?? {
              studentId: student.id,
              score: "",
              maxScore: "100",
              comments: "",
            };
            const isExpanded = expandedStudentId === student.id;
            const hasGrade = entry.score && parseFloat(entry.score) >= 0;

            return (
              <div
                key={student.id}
                className={`overflow-hidden rounded-xl border transition-all duration-200 ${isExpanded
                    ? "border-primary/30 shadow-md"
                    : "border-border/50 hover:border-border"
                  }`}
              >
                {/* Student Header Row */}
                <div
                  className={`flex items-center justify-between gap-4 p-4 cursor-pointer transition-colors ${isExpanded
                      ? "bg-primary/5"
                      : "hover:bg-muted/50"
                    }`}
                  onClick={() =>
                    setExpandedStudentId(isExpanded ? null : student.id)
                  }
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold text-sm ${hasGrade
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {hasGrade ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {student.name}
                      </p>
                      {student.email && (
                        <p className="text-xs text-muted-foreground truncate">
                          {student.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {hasGrade && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      >
                        {entry.score}/{entry.maxScore}
                      </Badge>
                    )}
                    {gradesLocked && (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t bg-muted/20 p-4 space-y-4">
                    {gradesLocked ? (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div>
                          <span className="text-xs text-muted-foreground block mb-1">
                            {t("discussion.score")}
                          </span>
                          <p className="font-semibold text-lg">
                            {entry.score || "—"}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block mb-1">
                            {t("discussion.maxScore")}
                          </span>
                          <p className="font-semibold text-lg">
                            {entry.maxScore || "—"}
                          </p>
                        </div>
                        {entry.comments && (
                          <div className="col-span-2">
                            <span className="text-xs text-muted-foreground block mb-1">
                              {t("discussion.comments")}
                            </span>
                            <p className="text-sm">{entry.comments}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium">
                              {t("discussion.score")} *
                            </Label>
                            <Input
                              type="number"
                              min={0}
                              value={entry.score}
                              onChange={(e) =>
                                setGradeForStudent(
                                  student.id,
                                  "score",
                                  e.target.value
                                )
                              }
                              placeholder="0"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium">
                              {t("discussion.maxScore")} *
                            </Label>
                            <Input
                              type="number"
                              min={0}
                              value={entry.maxScore}
                              onChange={(e) =>
                                setGradeForStudent(
                                  student.id,
                                  "maxScore",
                                  e.target.value
                                )
                              }
                              placeholder="100"
                              className="h-9"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">
                            {t("discussion.comments")} ({t("common.optional")})
                          </Label>
                          <Textarea
                            value={entry.comments}
                            onChange={(e) =>
                              setGradeForStudent(
                                student.id,
                                "comments",
                                e.target.value
                              )
                            }
                            placeholder={t("discussion.commentsPlaceholder")}
                            rows={2}
                            className="resize-none"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        {gradesLocked ? (
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.close")}
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="min-w-[140px] gap-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {t("discussion.saveEvaluation")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
