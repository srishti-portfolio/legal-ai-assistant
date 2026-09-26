import { readFile } from "node:fs/promises";
import { insertChunks } from "../db/chunks.repo.js";
import { markDocumentFailed, markDocumentReady } from "../db/documents.repo.js";
import { chunkDocument } from "./chunk.js";
import { extractText } from "./extract.js";
import { embedDocumentChunks } from "./gemini.js";

/**
 * Runs the full ingest pipeline (extract -> chunk -> embed -> store) for a document that
 * was already saved to disk and recorded with status 'processing'. Intended to be invoked
 * without awaiting from the upload route so the HTTP response isn't held open for the
 * duration of OCR/embedding calls; the frontend polls document status instead.
 */
export async function runIngestPipeline(documentId: string, filePath: string, mimeType: string): Promise<void> {
  try {
    const buffer = await readFile(filePath);
    const extraction = await extractText(buffer, mimeType);
    const chunks = chunkDocument(extraction);

    if (chunks.length === 0) {
      await markDocumentFailed(documentId, "No usable text could be extracted from this file.");
      return;
    }

    const embeddings = await embedDocumentChunks(chunks.map((c) => c.content));
    await insertChunks(documentId, chunks, embeddings);
    await markDocumentReady(documentId, extraction.pageCount);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error while processing the document.";
    console.error(`Ingest pipeline failed for document ${documentId}:`, err);
    await markDocumentFailed(documentId, message);
  }
}
