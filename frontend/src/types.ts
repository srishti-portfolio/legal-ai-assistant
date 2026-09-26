export interface PublicUser {
  id: string;
  name: string;
  email: string;
  language: string;
}

export type DocumentStatus = "processing" | "ready" | "failed";

export interface DocumentSummary {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  status: DocumentStatus;
  errorMessage: string | null;
  pageCount: number | null;
  createdAt: string;
}

export interface QaSource {
  chunkId: string;
  pageNumber: number | null;
  excerpt: string;
}

export interface QaEntry {
  id: string;
  documentId?: string;
  question: string;
  answer: string;
  grounded: boolean;
  sources: QaSource[];
  createdAt: string;
}