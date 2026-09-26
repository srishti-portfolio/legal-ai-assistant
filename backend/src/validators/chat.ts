import { z } from "zod";

export const askQuestionSchema = z.object({
  documentId: z.string().uuid("Invalid document id"),
  question: z.string().trim().min(3, "Question is too short").max(1000, "Question is too long"),
});

export type AskQuestionInput = z.infer<typeof askQuestionSchema>;

export const SUPPORTED_LANGUAGES = ["en", "hi", "es", "fr", "de", "pt", "ar", "zh"] as const;

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  language: z.enum(SUPPORTED_LANGUAGES).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
