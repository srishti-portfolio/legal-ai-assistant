import type { QaHistoryRow, QaSource } from "../types/models.js";
import { pool } from "./pool.js";

export async function addHistoryEntry(input: {
  userId: string;
  documentId: string;
  question: string;
  answer: string;
  grounded: boolean;
  sources: QaSource[];
}): Promise<QaHistoryRow> {
  const { rows } = await pool.query<QaHistoryRow>(
    `INSERT INTO qa_history (user_id, document_id, question, answer, grounded, sources)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [input.userId, input.documentId, input.question, input.answer, input.grounded, JSON.stringify(input.sources)],
  );
  return rows[0]!;
}

export async function listHistoryForUser(userId: string, documentId?: string): Promise<QaHistoryRow[]> {
  if (documentId) {
    const { rows } = await pool.query<QaHistoryRow>(
      `SELECT * FROM qa_history WHERE user_id = $1 AND document_id = $2 ORDER BY created_at DESC`,
      [userId, documentId],
    );
    return rows;
  }
  const { rows } = await pool.query<QaHistoryRow>(
    `SELECT * FROM qa_history WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId],
  );
  return rows;
}
