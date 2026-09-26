import { Router } from "express";
import { createUser, findUserByEmail, findUserById } from "../db/users.repo.js";
import { requireAuth } from "../middleware/auth.js";
import { ConflictError, UnauthorizedError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { clearAuthCookie, setAuthCookie } from "../utils/authCookie.js";
import { signToken } from "../utils/jwt.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { loginSchema, registerSchema } from "../validators/auth.js";

export const authRouter = Router();

function toPublicUser(user: { id: string; name: string; email: string; language: string }) {
  return { id: user.id, name: user.name, email: user.email, language: user.language };
}

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);

    const existing = await findUserByEmail(input.email);
    if (existing) {
      throw new ConflictError("An account with this email already exists.");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await createUser(input.name, input.email, passwordHash, input.language);
    const token = signToken({ userId: user.id, email: user.email });

    // Token goes only in an httpOnly cookie, never in the JSON body — see authCookie.ts.
    setAuthCookie(res, token);
    res.status(201).json({ user: toPublicUser(user) });
  }),
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);

    const user = await findUserByEmail(input.email);
    // Constant error message regardless of which field was wrong, so the response
    // can't be used to enumerate registered email addresses.
    if (!user || !(await verifyPassword(input.password, user.password_hash))) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    const token = signToken({ userId: user.id, email: user.email });
    setAuthCookie(res, token);
    res.json({ user: toPublicUser(user) });
  }),
);

authRouter.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.status(204).send();
});

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await findUserById(req.user!.userId);
    if (!user) throw new UnauthorizedError("Account no longer exists.");
    res.json({ user: toPublicUser(user) });
  }),
);