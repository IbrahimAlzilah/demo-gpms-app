import { z } from "zod";

// Final Evaluation Form Schema
export const finalEvaluationSchema = (t: (key: string) => string) => {
  return z
    .object({
      score: z
        .string()
        .min(1, t("discussion.validation.scoreRequired"))
        .refine(
          (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
          t("discussion.validation.scoreInvalid")
        ),
      maxScore: z
        .string()
        .min(1, t("discussion.validation.maxScoreRequired"))
        .refine(
          (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
          t("discussion.validation.maxScoreInvalid")
        ),
      comments: z.string().optional(),
    })
    .refine(
      (data) => {
        const score = parseFloat(data.score);
        const maxScore = parseFloat(data.maxScore);
        return (
          !isNaN(score) && !isNaN(maxScore) && score >= 0 && score <= maxScore
        );
      },
      {
        message: t("discussion.invalidScore"),
        path: ["score"],
      }
    );
};

export type FinalEvaluationSchema = z.infer<
  ReturnType<typeof finalEvaluationSchema>
>;
