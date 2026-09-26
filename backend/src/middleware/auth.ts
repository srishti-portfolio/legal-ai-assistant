import type { NextFunction, Request, Response } from "express";
import { AUTH_COOKIE_NAME } from "../utils/authCookie.js";
import { UnauthorizedError } from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";

function extractToken(req: Request): string | null {
  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
  if (typeof cookieToken === "string" && cookieToken.length > 0) return cookieToken;

  // Bearer header is accepted too, so the API remains usable from non-browser clients
  // (tests, curl, a future mobile app) that can't rely on cookie jars.
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length);

  return null;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    throw new UnauthorizedError("Authentication required.");
  }

  try {
    req.user = verifyToken(token);
  } catch {
    throw new UnauthorizedError("Invalid or expired session.");
  }

  next();
}
