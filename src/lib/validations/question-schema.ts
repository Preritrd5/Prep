import { z } from "zod";

export const OptionLabelEnum = z.enum(["A", "B", "C", "D"]);
export const DifficultyEnum = z.enum(["Easy", "Medium", "Hard", "Mixed"]);

export const GeneratedQuestionSchema = z.object({
  question: z.string().min(10, "Question text must be at least 10 characters"),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .length(4, "Question must have exactly 4 answer options"),
  correctAnswer: OptionLabelEnum,
  explanation: z.string().min(10, "Explanation must provide meaningful reasoning"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  topic: z.string().optional(),
});

export const GeneratedQuestionsBatchSchema = z.array(GeneratedQuestionSchema);

export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;
