import { Router } from "express";
import rateLimit from "express-rate-limit";
import { findDocumentForUser } from "../db/documents.repo.js";
import { addHistoryEntry } from "../db/history.repo.js";
import { findUserById } from "../db/users.repo.js";
import { requireAuth } from "../middleware/auth.js";
import { answerQuestion } from "../services/rag.js";
import { BadRequestError, NotFoundError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { askQuestionSchema } from "../validators/chat.js";

export const chatRouter = Router();

chatRouter.use(requireAuth);

// LLM calls are the most expensive request this API makes — a tighter limit than the
// global one keeps a single user from burning through the Gemini quota/budget.
const askLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many questions in a short time. Please wait a moment and try again." },
});

chatRouter.post(
  "/ask",
  askLimiter,
  asyncHandler(async (req, res) => {
    const input = askQuestionSchema.parse(req.body);

    const document = await findDocumentForUser(input.documentId, req.user!.userId);
    if (!document) throw new NotFoundError("Document not found.");
    if (document.status !== "ready") {
      throw new BadRequestError(
        document.status === "processing"
          ? "This document is still being processed. Please wait a moment and try again."
          : `This document failed to process: ${document.error_message ?? "unknown error"}`,
      );
    }

    const user = await findUserById(req.user!.userId);
    const result = await answerQuestion(document.id, input.question, user?.language);

    const entry = await addHistoryEntry({
      userId: req.user!.userId,
      documentId: document.id,
      question: input.question,
      answer: result.answer,
      grounded: result.grounded,
      sources: result.sources,
    });

    res.json({
      id: entry.id,
      question: entry.question,
      answer: entry.answer,
      grounded: entry.grounded,
      sources: entry.sources,
      createdAt: entry.created_at,
    });
  }),
);
