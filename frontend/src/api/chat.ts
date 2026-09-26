import type { QaEntry } from "../types.js";
import { apiRequest } from "./client.js";

export function askQuestion(documentId: string, question: string): Promise<QaEntry> {
  return apiRequest("/chat/ask", { method: "POST", body: { documentId, question } });
}
