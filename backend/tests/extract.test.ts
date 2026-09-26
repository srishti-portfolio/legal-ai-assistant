import { beforeEach, describe, expect, it, vi } from "vitest";

const extractRawText = vi.fn();
vi.mock("mammoth", () => ({ default: { extractRawText: (...args: unknown[]) => extractRawText(...args) } }));

const extractTextFromImage = vi.fn();
vi.mock("../src/services/ocr.js", () => ({
  extractTextFromImage: (...args: unknown[]) => extractTextFromImage(...args),
}));

const pdfParseMock = vi.fn();
vi.mock("pdf-parse/lib/pdf-parse.js", () => ({ default: (...args: unknown[]) => pdfParseMock(...args) }));

const { extractText } = await import("../src/services/extract.js");
const { BadRequestError } = await import("../src/utils/AppError.js");

describe("extractText", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an unsupported mime type", async () => {
    await expect(extractText(Buffer.from("x"), "application/zip")).rejects.toThrow(BadRequestError);
  });

  it("delegates JPEG uploads to OCR", async () => {
    extractTextFromImage.mockResolvedValue("scanned text");
    const result = await extractText(Buffer.from("img"), "image/jpeg");
    expect(result).toEqual({ text: "scanned text", pageCount: 1, pages: ["scanned text"] });
    expect(extractTextFromImage).toHaveBeenCalledTimes(1);
  });

  it("extracts DOCX text via mammoth", async () => {
    extractRawText.mockResolvedValue({ value: "docx contents" });
    const result = await extractText(
      Buffer.from("docx"),
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    expect(result).toEqual({ text: "docx contents", pageCount: null, pages: null });
  });

  it("rejects a PDF with too little extractable text (looks scanned)", async () => {
    pdfParseMock.mockResolvedValue({ text: "short", numpages: 1 });
    await expect(extractText(Buffer.from("pdf"), "application/pdf")).rejects.toThrow(BadRequestError);
  });

  it("extracts text and per-page content from a text-based PDF", async () => {
    const longText = "A".repeat(60);
    pdfParseMock.mockImplementation(
      async (_buf: Buffer, opts: { pagerender: (page: unknown) => Promise<string> }) => {
        // Exercise the pagerender callback exactly the way the real pdf-parse would call it.
        await opts.pagerender({ getTextContent: async () => ({ items: [{ str: longText }] }) });
        return { text: longText, numpages: 1 };
      },
    );
    const result = await extractText(Buffer.from("pdf"), "application/pdf");
    expect(result.text).toBe(longText);
    expect(result.pages).toEqual([longText]);
  });
});