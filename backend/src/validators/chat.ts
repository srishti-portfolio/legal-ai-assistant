import { z } from "zod";

export const askQuestionSchema = z.object({
  documentId: z.string().uuid("Invalid document id"),
  question: z.string().trim().min(3, "Question is too short").max(1000, "Question is too long"),
});

export type AskQuestionInput = z.infer<typeof askQuestionSchema>;

export const SUPPORTED_LANGUAGES = ["en", "hi", "es", "fr", "de", "pt", "ar", "zh"] as const;