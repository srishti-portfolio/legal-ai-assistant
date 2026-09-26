import { Router } from "express";
import { findUserByEmail, findUserById, updateUserCredentials, updateUserProfile } from "../db/users.repo.js";
import { requireAuth } from "../middleware/auth.js";
import { ConflictError, UnauthorizedError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { toPublicUser } from "../utils/publicUser.js";
import { updateCredentialsSchema, updateProfileSchema } from "../validators/user.js";

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get(
  "/profile",
  asyncHandler(async (req, res) => {
    const user = await findUserById(req.user!.userId);
    if (!user) throw new UnauthorizedError("Account no longer exists.");
    res.json(toPublicUser(user));
  }),
);

userRouter.patch(
  "/profile",
  asyncHandler(async (req, res) => {
    const input = updateProfileSchema.parse(req.body);
    const user = await updateUserProfile(req.user!.userId, input);
    if (!user) throw new UnauthorizedError("Account no longer exists.");
    res.json(toPublicUser(user));
  }),
);

// Email and password are handled separately from /profile because changing either requires
// re-entering the current password — this stops a hijacked but still-logged-in session (e.g.
// an unattended browser tab) from silently locking the real owner out by swapping the email
// or password. Name/language don't carry that risk, so /profile above doesn't need it.
userRouter.patch(
  "/credentials",
  asyncHandler(async (req, res) => {
    const input = updateCredentialsSchema.parse(req.body);

    const user = await findUserById(req.user!.userId);
    if (!user) throw new UnauthorizedError("Account no longer exists.");

    const isCurrentPasswordValid = await verifyPassword(input.currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError("Current password is incorrect.");
    }

    if (input.email && input.email !== user.email) {
      const existing = await findUserByEmail(input.email);
      if (existing) throw new ConflictError("An account with this email already exists.");
    }

    const passwordHash = input.newPassword ? await hashPassword(input.newPassword) : undefined;

    let updated;
    try {
      updated = await updateUserCredentials(user.id, { email: input.email, passwordHash });
    } catch (err) {
      // Race-condition fallback: two simultaneous requests could both pass the check above
      // before either commits. The unique constraint on email is the real guarantee; this
      // just turns that into the same friendly error instead of a raw 500.
      if ((err as { code?: string }).code === "23505") {
        throw new ConflictError("An account with this email already exists.");
      }
      throw err;
    }
    if (!updated) throw new UnauthorizedError("Account no longer exists.");

    res.json(toPublicUser(updated));
  }),
);