import { z } from "zod";

// Evaluation Form Schema
export const evaluationSchema = (t: (key: string) => string) => {
  return z.object({
    score: z
      .string()
      .min(1, t("supervisor.validation.scoreRequired"))
      .refine(
        (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
        t("supervisor.validation.scoreInvalid")),
    maxScore: z
      .string()
      .min(1, t("supervisor.validation.maxScoreRequired"))
      .refine(
        (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
        t("supervisor.validation.maxScoreInvalid")),
    comments: z.string().optional(),
  }).refine(
    (data) => {
      const score = parseFloat(data.score);
      const maxScore = parseFloat(data.maxScore);
      return !isNaN(score) && !isNaN(maxScore) && score >= 0 && score <= maxScore;
    },
    {
      message: t("supervisor.invalidScore"),
      path: ["score"],
    }
  );
};

export type EvaluationSchema = z.infer<ReturnType<typeof evaluationSchema>>;

