import type { QaEntry } from "../types.js";
import { apiRequest } from "./client.js";

export function listHistory(documentId?: string): Promise<{ entries: QaEntry[] }> {
  const query = documentId ? `?documentId=${encodeURIComponent(documentId)}` : "";
  return apiRequest(`/history${query}`);
}
