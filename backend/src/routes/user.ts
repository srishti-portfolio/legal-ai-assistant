import { Router } from "express";
import { findUserById, updateUserProfile } from "../db/users.repo.js";
import { requireAuth } from "../middleware/auth.js";
import { UnauthorizedError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { updateProfileSchema } from "../validators/chat.js";

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get(
  "/profile",
  asyncHandler(async (req, res) => {
    const user = await findUserById(req.user!.userId);
    if (!user) throw new UnauthorizedError("Account no longer exists.");
    res.json({ id: user.id, name: user.name, email: user.email, language: user.language });
  }),
);

userRouter.patch(
  "/profile",
  asyncHandler(async (req, res) => {
    const input = updateProfileSchema.parse(req.body);
    const user = await updateUserProfile(req.user!.userId, input);
    if (!user) throw new UnauthorizedError("Account no longer exists.");
    res.json({ id: user.id, name: user.name, email: user.email, language: user.language });
  }),
);
