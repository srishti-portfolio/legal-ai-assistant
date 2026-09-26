import { beforeEach, describe, expect, it, vi } from "vitest";

// env.ts snapshots process.env at import time, so this must be set before ocr.ts (and its
// transitive import of env.ts) is ever loaded in this test file.
process.env.GOOGLE_APPLICATION_CREDENTIALS = "/fake/service-account.json";

const documentTextDetection = vi.fn();
vi.mock("@google-cloud/vision", () => ({
  // Must be a real `function`, not an arrow function — arrow functions can't be
  // called with `new`, which is how the real ocr.ts constructs its client.
  ImageAnnotatorClient: vi.fn().mockImplementation(function MockImageAnnotatorClient() {
    return { documentTextDetection };
  }),
}));

const { extractTextFromImage } = await import("../src/services/ocr.js");
const { BadRequestError } = await import("../src/utils/AppError.js");

describe("extractTextFromImage", () => {
  beforeEach(() => {
    documentTextDetection.mockReset();
  });

  it("returns the detected text, trimmed", async () => {
    documentTextDetection.mockResolvedValue([{ fullTextAnnotation: { text: "  Hello world  \n" } }]);
    const result = await extractTextFromImage(Buffer.from("image-bytes"));
    expect(result).toBe("Hello world");
  });

  it("throws a clear error when no text is detected in the image", async () => {
    documentTextDetection.mockResolvedValue([{ fullTextAnnotation: null }]);
    await expect(extractTextFromImage(Buffer.from("image-bytes"))).rejects.toThrow(BadRequestError);
  });
});