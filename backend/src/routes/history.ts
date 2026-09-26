import { Router } from "express";
import { z } from "zod";
import { listHistoryForUser } from "../db/history.repo.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const historyRouter = Router();

historyRouter.use(requireAuth);

const querySchema = z.object({ documentId: z.string().uuid().optional() });

historyRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { documentId } = querySchema.parse(req.query);
    const entries = await listHistoryForUser(req.user!.userId, documentId);
    res.json({
      entries: entries.map((e) => ({
        id: e.id,
        documentId: e.document_id,
        question: e.question,
        answer: e.answer,
        grounded: e.grounded,
        sources: e.sources,
        createdAt: e.created_at,
      })),
    });
  }),
);
