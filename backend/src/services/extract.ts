import mammoth from "mammoth";
// pdf-parse ships no ESM types and reaches into its own test fixtures on default
// import in some bundlers — importing the lib entrypoint directly avoids that.
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { BadRequestError } from "../utils/AppError.js";
import { extractTextFromImage } from "./ocr.js";

export const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export interface ExtractionResult {
  text: string;
  pageCount: number | null;
  /** Per-page text when known (PDFs), used to tag chunks with a page number for citations. */
  pages: string[] | null;
}

const MIN_VIABLE_TEXT_LENGTH = 50;

export async function extractText(buffer: Buffer, mimeType: string): Promise<ExtractionResult> {
  switch (mimeType) {
    case "application/pdf":
      return extractFromPdf(buffer);
    case "image/jpeg":
    case "image/jpg": {
      const text = await extractTextFromImage(buffer);
      return { text, pageCount: 1, pages: [text] };
    }
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      const { value } = await mammoth.extractRawText({ buffer });
      return { text: value, pageCount: null, pages: null };
    }
    default:
      throw new BadRequestError(
        `Unsupported file type: ${mimeType}. Supported types: PDF, JPG/JPEG, DOCX.`,
      );
  }
}

async function extractFromPdf(buffer: Buffer): Promise<ExtractionResult> {
  const pages: string[] = [];

  const result = await pdfParse(buffer, {
    // Captures each page's text as pdf-parse walks the document, so chunks can
    // later cite a page number instead of just an opaque chunk index.
    pagerender: async (pageData: {
      getTextContent: () => Promise<{ items: Array<{ str: string }> }>;
    }) => {
      const content = await pageData.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      pages.push(pageText);
      return pageText;
    },
  });

  const text = result.text.trim();

  if (text.length < MIN_VIABLE_TEXT_LENGTH) {
    throw new BadRequestError(
      "This PDF appears to be a scanned image with no selectable text. " +
        "Please upload a text-based PDF, or upload individual pages as JPG/JPEG images so OCR can read them.",
    );
  }

  return { text, pageCount: result.numpages, pages };
}
