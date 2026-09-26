import type { DocumentSummary } from "../types.js";
import { apiRequest } from "./client.js";

export function listDocuments(): Promise<{ documents: DocumentSummary[] }> {
  return apiRequest("/documents");
}

export function getDocument(id: string): Promise<DocumentSummary> {
  return apiRequest(`/documents/${id}`);
}

export function uploadDocument(file: File): Promise<DocumentSummary> {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest("/documents", { method: "POST", body: formData, isFormData: true });
}

export function deleteDocument(id: string): Promise<void> {
  return apiRequest(`/documents/${id}`, { method: "DELETE" });
}
