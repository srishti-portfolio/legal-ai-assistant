import type { DocumentRow } from "../types/models.js";
import { pool } from "./pool.js";

export async function createDocument(input: {
  userId: string;
  originalName: string;
  mimeType: string;
  storagePath: string;
  sizeBytes: number;
}): Promise<DocumentRow> {
  const { rows } = await pool.query<DocumentRow>(
    `INSERT INTO documents (user_id, original_name, mime_type, storage_path, size_bytes, status)
     VALUES ($1, $2, $3, $4, $5, 'processing') RETURNING *`,
    [input.userId, input.originalName, input.mimeType, input.storagePath, input.sizeBytes],
  );
  return rows[0]!;
}

export async function markDocumentReady(id: string, pageCount: number | null): Promise<void> {
  await pool.query(`UPDATE documents SET status = 'ready', page_count = $2 WHERE id = $1`, [id, pageCount]);
}

export async function markDocumentFailed(id: string, errorMessage: string): Promise<void> {
  await pool.query(`UPDATE documents SET status = 'failed', error_message = $2 WHERE id = $1`, [
    id,
    errorMessage,
  ]);
}

export async function listDocumentsForUser(userId: string): Promise<DocumentRow[]> {
  const { rows } = await pool.query<DocumentRow>(
    `SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId],
  );
  return rows;
}

export async function findDocumentForUser(id: string, userId: string): Promise<DocumentRow | null> {
  const { rows } = await pool.query<DocumentRow>(
    `SELECT * FROM documents WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  return rows[0] ?? null;
}

export async function deleteDocumentForUser(id: string, userId: string): Promise<boolean> {
  const { rowCount } = await pool.query(`DELETE FROM documents WHERE id = $1 AND user_id = $2`, [
    id,
    userId,
  ]);
  return (rowCount ?? 0) > 0;
}
