import { ImageAnnotatorClient } from "@google-cloud/vision";
import { env } from "../config/env.js";
import { AppError, BadRequestError } from "../utils/AppError.js";

let client: ImageAnnotatorClient | null = null;

function getClient(): ImageAnnotatorClient {
  if (!env.ocr.credentialsPath) {
    throw new AppError(
      "OCR is not configured on this server (missing GOOGLE_APPLICATION_CREDENTIALS). " +
        "Image uploads cannot be processed until Google Cloud Vision credentials are set.",
      503,
    );
  }
  client ??= new ImageAnnotatorClient({ keyFilename: env.ocr.credentialsPath });
  return client;
}

/** Runs Google Cloud Vision's document text detection, tuned for dense printed text (contracts, forms). */
export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  const [result] = await getClient().documentTextDetection({ image: { content: buffer } });
  const text = result.fullTextAnnotation?.text?.trim() ?? "";

  if (text.length === 0) {
    throw new BadRequestError("No readable text was found in this image. Please upload a clearer scan.");
  }

  return text;
}
