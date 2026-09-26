import { searchSimilarChunks } from "../db/chunks.repo.js";
import type { QaSource } from "../types/models.js";
import { embedQuery, generateGroundedAnswer, NOT_MENTIONED_SENTINEL } from "./gemini.js";

const TOP_K = 6;

// pgvector cosine distance: 0 = identical direction, 2 = opposite. Anything retrieved
// above this distance is too semantically unrelated to the question to trust as context —
// we refuse to generate rather than let the model improvise from a weak match.
const MAX_TRUSTED_DISTANCE = 0.65;

export const NOT_MENTIONED_MESSAGE =
  "This is not mentioned in the document. The uploaded file does not appear to contain information " +
  "that answers this question.";

export interface AnswerResult {
  answer: string;
  grounded: boolean;
  sources: QaSource[];
}

export async function answerQuestion(
  documentId: string,
  question: string,
  answerLanguage = "en",
): Promise<AnswerResult> {
  const queryEmbedding = await embedQuery(question);
  const matches = await searchSimilarChunks(documentId, queryEmbedding, TOP_K);

  const trusted = matches.filter((m) => m.distance <= MAX_TRUSTED_DISTANCE);

  // Guardrail layer 1: retrieval confidence. If nothing in the document is semantically
  // close to the question, don't even ask the LLM — return the deterministic fallback.
  if (trusted.length === 0) {
    return { answer: NOT_MENTIONED_MESSAGE, grounded: false, sources: [] };
  }

  const passages = trusted.map((m, i) => ({
    index: i + 1,
    pageNumber: m.page_number,
    content: m.content,
  }));

  const raw = await generateGroundedAnswer(question, passages, answerLanguage);

  // Guardrail layer 2: the model itself must say so if the retrieved passages, on closer
  // reading, don't actually answer the question (retrieval can be topically close but
  // still miss the specific fact asked about).
  if (raw.includes(NOT_MENTIONED_SENTINEL)) {
    return { answer: NOT_MENTIONED_MESSAGE, grounded: false, sources: [] };
  }

  const sources: QaSource[] = trusted.map((m) => ({
    chunkId: m.id,
    pageNumber: m.page_number,
    excerpt: m.content.slice(0, 240),
  }));

  return { answer: raw, grounded: true, sources };
}
 