import { describe, expect, it } from "vitest";
import { chunkDocument } from "../src/services/chunk.js";
import type { ExtractionResult } from "../src/services/extract.js";

describe("chunkDocument", () => {
  it("returns no chunks for empty text", () => {
    const result: ExtractionResult = { text: "", pageCount: null, pages: null };
    expect(chunkDocument(result)).toEqual([]);
  });

  it("keeps a short document as a single chunk", () => {
    const result: ExtractionResult = {
      text: "This agreement is between Party A and Party B.",
      pageCount: null,
      pages: null,
    };
    const chunks = chunkDocument(result);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]!.content).toContain("Party A and Party B");
    expect(chunks[0]!.pageNumber).toBeNull();
  });

  it("splits long text into multiple overlapping chunks", () => {
    const paragraph = "The tenant shall pay rent on the first day of each month without deduction. ".repeat(30);
    const result: ExtractionResult = { text: paragraph, pageCount: null, pages: null };

    const chunks = chunkDocument(result);
    expect(chunks.length).toBeGreaterThan(1);

    // Adjacent chunks should share some overlapping text so a clause split across
    // a boundary is still retrievable from either chunk.
    const firstTail = chunks[0]!.content.slice(-50);
    expect(chunks[1]!.content).toContain(firstTail.slice(0, 20));
  });

  it("tags each chunk with the page number it came from when pages are known", () => {
    const result: ExtractionResult = {
      text: "irrelevant",
      pageCount: 2,
      pages: ["Clause 1 is on page one.", "Clause 2 is on page two."],
    };

    const chunks = chunkDocument(result);
    expect(chunks.some((c) => c.pageNumber === 1 && c.content.includes("page one"))).toBe(true);
    expect(chunks.some((c) => c.pageNumber === 2 && c.content.includes("page two"))).toBe(true);
  });

  it("drops whitespace-only paragraphs", () => {
    const result: ExtractionResult = { text: "\n\n   \n\nReal content here.\n\n  \n", pageCount: null, pages: null };
    const chunks = chunkDocument(result);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]!.content).toBe("Real content here.");
  });
});
