import { z } from "zod";
import { SUPPORTED_LANGUAGES } from "./chat.js";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  language: z.enum(SUPPORTED_LANGUAGES).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Email and password are handled separately from the rest of the profile because changing
// either requires re-entering the current password (see routes/user.ts) — a hijacked but
// still-logged-in session shouldn't be able to silently lock the real owner out.
export const updateCredentialsSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    email: z.string().trim().toLowerCase().email("Invalid email address").max(255).optional(),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(200)
      .regex(/[A-Za-z]/, "Password must contain a letter")
      .regex(/[0-9]/, "Password must contain a number")
      .optional(),
  })
  .refine((data) => data.email !== undefined || data.newPassword !== undefined, {
    message: "Provide a new email or a new password to update.",
    path: ["email"],
  });

export type UpdateCredentialsInput = z.infer<typeof updateCredentialsSchema>;