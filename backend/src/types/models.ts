export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  language: string;
  created_at: string;
}

export type DocumentStatus = "processing" | "ready" | "failed";

export interface DocumentRow {
  id: string;
  user_id: string;
  original_name: string;
  mime_type: string;
  storage_path: string;
  size_bytes: number;
  status: DocumentStatus;
  error_message: string | null;
  page_count: number | null;
  created_at: string;
}

export interface ChunkMatch {
  id: string;
  content: string;
  page_number: number | null;
  chunk_index: number;
  distance: number;
}

export interface QaSource {
  chunkId: string;
  pageNumber: number | null;
  excerpt: string;
}

export interface QaHistoryRow {
  id: string;
  user_id: string;
  document_id: string;
  question: string;
  answer: string;
  grounded: boolean;
  sources: QaSource[];
  created_at: string;
}
