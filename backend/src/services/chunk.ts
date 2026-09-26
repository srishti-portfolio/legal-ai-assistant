import type { ExtractionResult } from "./extract.js";

export interface TextChunk {
  content: string;
  pageNumber: number | null;
}

const TARGET_CHUNK_CHARS = 1200;
const OVERLAP_CHARS = 200;
const MIN_CHUNK_CHARS = 40;

/**
 * Splits document text into overlapping, paragraph-aware chunks for embedding.
 * Overlap keeps a clause that straddles a chunk boundary retrievable from either side.
 */
export function chunkDocument(extraction: ExtractionResult): TextChunk[] {
  if (extraction.pages && extraction.pages.length > 0) {
    return extraction.pages.flatMap((pageText, index) =>
      chunkText(pageText, index + 1),
    );
  }
  return chunkText(extraction.text, null);
}

function chunkText(text: string, pageNumber: number | null): TextChunk[] {
  const paragraphs = text
    .split(/\n\s*\n|(?<=[.;])\s{2,}/g)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 0);

  if (paragraphs.length === 0) return [];

  const chunks: TextChunk[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (current.length > 0 && current.length + paragraph.length + 1 > TARGET_CHUNK_CHARS) {
      chunks.push({ content: current, pageNumber });
      // Carry the tail of the previous chunk forward so a clause split across
      // the boundary still appears whole in at least one chunk.
      current = current.slice(Math.max(0, current.length - OVERLAP_CHARS));
    }
    current = current.length > 0 ? `${current} ${paragraph}` : paragraph;

    while (current.length > TARGET_CHUNK_CHARS * 1.5) {
      chunks.push({ content: current.slice(0, TARGET_CHUNK_CHARS), pageNumber });
      current = current.slice(TARGET_CHUNK_CHARS - OVERLAP_CHARS);
    }
  }

  const remainder = current.trim();
  if (remainder.length > 0) {
    // A short remainder is worth keeping on its own only if there's nothing to attach it
    // to (it's the whole document); otherwise fold it into the previous chunk as a tail.
    if (remainder.length >= MIN_CHUNK_CHARS || chunks.length === 0) {
      chunks.push({ content: remainder, pageNumber });
    } else {
      const last = chunks[chunks.length - 1]!;
      chunks[chunks.length - 1] = { ...last, content: `${last.content} ${remainder}` };
    }
  }

  return chunks;
}
