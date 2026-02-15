import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Button,
  Badge,
} from "@/components/ui";
import { Loader2, Save, User } from "lucide-react";
import type { User as UserType } from "@/types/user.types";

const MIN_GRADE = 0;
const MAX_GRADE = 100;

export interface StudentGradeRow {
  studentId: string;
  score: string;
  comments: string;
  hasExistingGrade: boolean;
}

export interface PerStudentGradingTableProps {
  students: Pick<UserType, "id" | "name" | "email" | "department">[];
  grades: Record<string, StudentGradeRow>;
  onGradeChange: (studentId: string, field: "score" | "comments", value: string) => void;
  onSave: (studentId: string) => Promise<void>;
  gradesLocked?: boolean;
  savingStudentId?: string | null;
  /** Optional: custom validation message for inline display */
  getValidationError?: (studentId: string) => string | null;
}

export function PerStudentGradingTable({
  students,
  grades,
  onGradeChange,
  onSave,
  gradesLocked = false,
  savingStudentId = null,
  getValidationError,
}: PerStudentGradingTableProps) {
  const { t } = useTranslation();

  const validateGrade = useCallback((value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const num = parseFloat(trimmed);
    if (isNaN(num)) return t("evaluation.gradeInvalid");
    if (num < MIN_GRADE || num > MAX_GRADE) {
      return t("evaluation.gradeRange", { min: MIN_GRADE, max: MAX_GRADE });
    }
    return null;
  }, [t]);

  const handleSave = async (studentId: string) => {
    const entry = grades[studentId];
    const scoreStr = entry?.score?.trim() ?? "";
    const err = validateGrade(scoreStr);
    if (err) return;
    await onSave(studentId);
  };

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-[220px] font-semibold">
              {t("common.student")}
            </TableHead>
            <TableHead className="w-[140px] text-center font-semibold">
              {t("evaluation.grade")} (0–100)
            </TableHead>
            <TableHead className="min-w-[180px] font-semibold">
              {t("discussion.comments")}
            </TableHead>
            <TableHead className="w-[120px] text-center font-semibold">
              {t("common.status")}
            </TableHead>
            {!gradesLocked && (
              <TableHead className="w-[120px] text-center font-semibold">
                {t("common.actions")}
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => {
            const entry = grades[student.id] ?? {
              studentId: student.id,
              score: "",
              comments: "",
              hasExistingGrade: false,
            };
            const validationError = getValidationError?.(student.id) ?? validateGrade(entry.score);
            const isSaving = savingStudentId === student.id;
            const hasGrade = entry.hasExistingGrade || (entry.score.trim() !== "" && !validationError);
            const canSave =
              !gradesLocked &&
              entry.score.trim() !== "" &&
              !validationError &&
              !isSaving;

            return (
              <TableRow key={student.id} className="hover:bg-muted/20">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{student.name}</p>
                      {student.department && (
                        <p className="text-xs text-muted-foreground truncate">
                          {student.department}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {gradesLocked ? (
                    <span className="font-medium">
                      {entry.score ? Number(entry.score).toFixed(1) : "—"}
                    </span>
                  ) : (
                    <div className="space-y-1">
                      <Input
                        type="number"
                        min={MIN_GRADE}
                        max={MAX_GRADE}
                        step="0.01"
                        value={entry.score}
                        onChange={(e) => onGradeChange(student.id, "score", e.target.value)}
                        placeholder="0"
                        className={`h-9 w-full max-w-[100px] mx-auto text-center ${
                          validationError && entry.score.trim() ? "border-destructive" : ""
                        }`}
                      />
                      {validationError && entry.score.trim() && (
                        <p className="text-xs text-destructive">{validationError}</p>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {gradesLocked ? (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {entry.comments || "—"}
                    </p>
                  ) : (
                    <Input
                      value={entry.comments}
                      onChange={(e) => onGradeChange(student.id, "comments", e.target.value)}
                      placeholder={t("discussion.commentsPlaceholder")}
                      className="h-9"
                    />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={hasGrade ? "default" : "secondary"}
                    className={
                      hasGrade
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                    }
                  >
                    {hasGrade ? t("evaluation.statusSubmitted") : t("evaluation.statusDraft")}
                  </Badge>
                </TableCell>
                {!gradesLocked && (
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant={hasGrade ? "outline" : "default"}
                      onClick={() => handleSave(student.id)}
                      disabled={!canSave}
                      className="gap-1.5"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {hasGrade ? t("evaluation.update") : t("evaluation.save")}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
