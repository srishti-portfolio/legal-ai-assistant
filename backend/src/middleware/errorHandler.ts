import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: "Route not found" });
}

// Express identifies error middleware by arity (4 params) — keep `next` even though unused.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: err.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    });
    return;
  }

  if (err instanceof MulterError) {
    res.status(400).json({ error: `Upload error: ${err.message}` });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Unexpected error: log full detail server-side, never leak internals to the client.
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    ...(env.nodeEnv !== "production" && err instanceof Error ? { detail: err.message } : {}),
  });
}
