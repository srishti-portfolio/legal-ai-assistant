import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

// Matches the `embedding VECTOR(768)` column in the chunks table. gemini-embedding-001
// defaults to 3072 dimensions but supports Matryoshka truncation via outputDimensionality —
// the installed SDK version predates that field in its types, so it's added with a cast;
// the REST API itself accepts and honors it regardless (verified against the live endpoint).
const EMBEDDING_DIMENSIONS = 768;

let client: GoogleGenerativeAI | null = null;

const RETRYABLE_STATUS_CODES = new Set([429, 503]);
const MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 800;

/**
 * Gemini occasionally returns 429 (rate limited) or 503 (temporarily overloaded) under
 * normal load — these are expected transient conditions, not bugs, so retry with backoff
 * before surfacing an error to the user.
 */
async function withRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const status = (err as { status?: number }).status;
      const isRetryable = status !== undefined && RETRYABLE_STATUS_CODES.has(status);

      if (!isRetryable || attempt === MAX_ATTEMPTS) {
        if (status !== undefined && RETRYABLE_STATUS_CODES.has(status)) {
          // Retries exhausted — surface a message the user can act on instead of a bare 500.
          throw new AppError(
            "The AI service is temporarily overloaded. Please wait a moment and try again.",
            503,
          );
        }
        throw err;
      }

      const delayMs = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
      console.warn(`${label} returned ${status}; retrying in ${delayMs}ms (attempt ${attempt}/${MAX_ATTEMPTS})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("unreachable");
}

function getClient(): GoogleGenerativeAI {
  if (!env.gemini.apiKey) {
    throw new AppError(
      "The AI service is not configured on this server (missing GEMINI_API_KEY).",
      503,
    );
  }
  client ??= new GoogleGenerativeAI(env.gemini.apiKey);
  return client;
}

/** Embeds document chunks at ingest time. */
export async function embedDocumentChunks(texts: string[]): Promise<number[][]> {
  const model = getClient().getGenerativeModel({ model: env.gemini.embeddingModel });
  const BATCH_SIZE = 100; // Gemini batchEmbedContents caps requests around this size.
  const vectors: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const { embeddings } = await withRetry("Gemini batchEmbedContents", () =>
      model.batchEmbedContents({
        requests: batch.map((text) => ({
          content: { role: "user", parts: [{ text }] },
          taskType: TaskType.RETRIEVAL_DOCUMENT,
          outputDimensionality: EMBEDDING_DIMENSIONS,
        })) as Parameters<typeof model.batchEmbedContents>[0]["requests"],
      }),
    );
    vectors.push(...embeddings.map((e) => e.values));
  }

  return vectors;
}

/** Embeds a user's question with the matching query task type for better retrieval. */
export async function embedQuery(text: string): Promise<number[]> {
  const model = getClient().getGenerativeModel({ model: env.gemini.embeddingModel });
  const { embedding } = await withRetry("Gemini embedContent", () =>
    model.embedContent({
      content: { role: "user", parts: [{ text }] },
      taskType: TaskType.RETRIEVAL_QUERY,
      outputDimensionality: EMBEDDING_DIMENSIONS,
    } as Parameters<typeof model.embedContent>[0]),
  );
  return embedding.values;
}

export const NOT_MENTIONED_SENTINEL = "NOT_MENTIONED_IN_DOCUMENT";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  es: "Spanish",
  fr: "French",
  de: "German",
  pt: "Portuguese",
  ar: "Arabic",
  zh: "Chinese",
};

export interface ContextPassage {
  index: number;
  pageNumber: number | null;
  content: string;
}

const SYSTEM_INSTRUCTION = `You are a careful legal-document assistant. You answer questions using ONLY the numbered
context passages provided below, which were retrieved from a document the user uploaded. You are not
allowed to use any outside knowledge, general legal knowledge, or assumptions about what a document
"usually" says.

Rules, in strict priority order:
1. If the passages fully or partially answer the question, answer using only facts stated in the passages.
   Keep the answer clear and plain-language, as if explaining to someone with no legal background.
2. Reference which passage number(s) you used, e.g. "(see passage 2)".
3. If the passages do NOT contain information that answers the question, respond with EXACTLY this token
   and nothing else: ${NOT_MENTIONED_SENTINEL}
4. Never fill gaps with general legal knowledge, typical contract conventions, or guesses. If it is not
   written in the passages, it does not exist for the purposes of this answer.
5. Do not give personalized legal advice or tell the user what to do. Describe only what the document says,
   and if relevant, suggest they confirm next steps with a licensed professional.`;

// Tried in order after the configured primary model. Lite variants carry far less demand
// than a flagship model, so they're a good safety net when the primary is overloaded —
// particularly valuable during a live demo where a single failed answer is visible to an
// audience, not just logged and retried later.
const FALLBACK_GENERATION_MODELS = ["gemini-flash-lite-latest", "gemini-2.5-flash-lite"];

export async function generateGroundedAnswer(
  question: string,
  passages: ContextPassage[],
  answerLanguage = "en",
): Promise<string> {
  const contextBlock = passages
    .map((p) => `[Passage ${p.index}${p.pageNumber ? `, page ${p.pageNumber}` : ""}]\n${p.content}`)
    .join("\n\n");

  const languageName = LANGUAGE_NAMES[answerLanguage] ?? "English";
  const languageInstruction =
    languageName === "English"
      ? ""
      : `\n\nWrite your answer in ${languageName}, unless it is the exact sentinel token from rule 3.`;

  const prompt = `Context passages from the uploaded document:\n\n${contextBlock}\n\nQuestion: ${question}${languageInstruction}`;

  const modelsToTry = [
    env.gemini.generationModel,
    ...FALLBACK_GENERATION_MODELS.filter((m) => m !== env.gemini.generationModel),
  ];

  let lastError: unknown;
  for (const modelName of modelsToTry) {
    try {
      const model = getClient().getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
          temperature: 0.1, // Low temperature: favor faithful extraction over creative phrasing.
          maxOutputTokens: 800,
        },
      });
      const result = await withRetry(`Gemini generateContent (${modelName})`, () => model.generateContent(prompt));
      return result.response.text().trim();
    } catch (err) {
      lastError = err;
      console.warn(`Model "${modelName}" failed, trying next fallback if any.`);
    }
  }
  throw lastError;
}
