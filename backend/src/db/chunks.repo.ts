import type { TextChunk } from "../services/chunk.js";
import type { ChunkMatch } from "../types/models.js";
import { pool } from "./pool.js";
import { toVectorLiteral } from "./vector.js";

export async function insertChunks(
  documentId: string,
  chunks: TextChunk[],
  embeddings: number[][],
): Promise<void> {
  if (chunks.length === 0) return;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]!;
      const embedding = embeddings[i]!;
      await client.query(
        `INSERT INTO chunks (document_id, chunk_index, content, page_number, embedding)
         VALUES ($1, $2, $3, $4, $5)`,
        [documentId, i, chunk.content, chunk.pageNumber, toVectorLiteral(embedding)],
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function searchSimilarChunks(
  documentId: string,
  queryEmbedding: number[],
  limit: number,
): Promise<ChunkMatch[]> {
  const { rows } = await pool.query<ChunkMatch>(
    `SELECT id, content, page_number, chunk_index, embedding <=> $2 AS distance
     FROM chunks
     WHERE document_id = $1
     ORDER BY embedding <=> $2
     LIMIT $3`,
    [documentId, toVectorLiteral(queryEmbedding), limit],
  );
  return rows;
}

export async function countChunksForDocument(documentId: string): Promise<number> {
  const { rows } = await pool.query<{ count: string }>(
    `SELECT COUNT(*) FROM chunks WHERE document_id = $1`,
    [documentId],
  );
  return Number(rows[0]?.count ?? 0);
}
