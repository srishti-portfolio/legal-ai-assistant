import { beforeEach, describe, expect, it, vi } from "vitest";

const readFile = vi.fn();
vi.mock("node:fs/promises", () => ({ readFile: (...args: unknown[]) => readFile(...args) }));

const insertChunks = vi.fn();
vi.mock("../src/db/chunks.repo.js", () => ({ insertChunks: (...args: unknown[]) => insertChunks(...args) }));

const markDocumentFailed = vi.fn();
const markDocumentReady = vi.fn();
vi.mock("../src/db/documents.repo.js", () => ({
  markDocumentFailed: (...args: unknown[]) => markDocumentFailed(...args),
  markDocumentReady: (...args: unknown[]) => markDocumentReady(...args),
}));

const chunkDocument = vi.fn();
vi.mock("../src/services/chunk.js", () => ({ chunkDocument: (...args: unknown[]) => chunkDocument(...args) }));

const extractText = vi.fn();
vi.mock("../src/services/extract.js", () => ({ extractText: (...args: unknown[]) => extractText(...args) }));

const embedDocumentChunks = vi.fn();
vi.mock("../src/services/gemini.js", () => ({
  embedDocumentChunks: (...args: unknown[]) => embedDocumentChunks(...args),
}));

const { runIngestPipeline } = await import("../src/services/ingest.js");

describe("runIngestPipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    readFile.mockResolvedValue(Buffer.from("file bytes"));
  });

  it("extracts, chunks, embeds, stores, and marks the document ready on success", async () => {
    extractText.mockResolvedValue({ text: "hello", pageCount: 2, pages: null });
    chunkDocument.mockReturnValue([{ content: "hello", pageNumber: null }]);
    embedDocumentChunks.mockResolvedValue([[0.1, 0.2]]);

    await runIngestPipeline("doc-1", "/uploads/doc-1.pdf", "application/pdf");

    expect(insertChunks).toHaveBeenCalledWith("doc-1", [{ content: "hello", pageNumber: null }], [[0.1, 0.2]]);
    expect(markDocumentReady).toHaveBeenCalledWith("doc-1", 2);
    expect(markDocumentFailed).not.toHaveBeenCalled();
  });

  it("marks the document failed when no chunks come out of extraction, without ever calling Gemini", async () => {
    extractText.mockResolvedValue({ text: "", pageCount: null, pages: null });
    chunkDocument.mockReturnValue([]);

    await runIngestPipeline("doc-2", "/uploads/doc-2.pdf", "application/pdf");

    expect(embedDocumentChunks).not.toHaveBeenCalled();
    expect(markDocumentFailed).toHaveBeenCalledWith("doc-2", expect.stringContaining("No usable text"));
  });

  it("marks the document failed with the thrown error's message when extraction fails", async () => {
    extractText.mockRejectedValue(new Error("scanned PDF, no text"));

    await runIngestPipeline("doc-3", "/uploads/doc-3.pdf", "application/pdf");

    expect(markDocumentFailed).toHaveBeenCalledWith("doc-3", "scanned PDF, no text");
  });

  it("falls back to a generic message when something non-Error is thrown", async () => {
    extractText.mockRejectedValue("weird rejection");

    await runIngestPipeline("doc-4", "/uploads/doc-4.pdf", "application/pdf");

    expect(markDocumentFailed).toHaveBeenCalledWith("doc-4", "Unknown error while processing the document.");
  });
});