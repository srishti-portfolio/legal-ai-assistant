import { useCallback, useEffect, useState } from "react";
import { askQuestion } from "../api/chat.js";
import { ApiError } from "../api/client.js";
import { deleteDocument, listDocuments, uploadDocument } from "../api/documents.js";
import { listHistory } from "../api/history.js";
import { ChatComposer } from "../components/ChatComposer.js";
import { ChatThread } from "../components/ChatThread.js";
import { DocumentList } from "../components/DocumentList.js";
import { DocumentUploader } from "../components/DocumentUploader.js";
import { Alert, Spinner } from "../components/ui.js";
import { useLanguage } from "../hooks/useLanguage.js";
import type { DocumentSummary, QaEntry } from "../types.js";

const POLL_INTERVAL_MS = 3000;

export function Home() {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [entries, setEntries] = useState<QaEntry[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshDocuments = useCallback(async () => {
    const { documents } = await listDocuments();
    setDocuments(documents);
    return documents;
  }, []);

  useEffect(() => {
    refreshDocuments()
      .catch(() => setError(t("errorLoadDocuments")))
      .finally(() => setIsLoadingDocs(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshDocuments]);

  // Poll while any document is still being processed, so status badges update without a manual refresh.
  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === "processing");
    if (!hasProcessing) return;

    const timer = setInterval(() => {
      refreshDocuments().catch(() => {
        /* transient network hiccup — next poll will retry */
      });
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [documents, refreshDocuments]);

  useEffect(() => {
    if (!selectedId) {
      setEntries([]);
      return;
    }
    setIsLoadingThread(true);
    listHistory(selectedId)
      .then(({ entries }) => setEntries(entries.slice().reverse()))
      .catch(() => setError(t("errorLoadConversation")))
      .finally(() => setIsLoadingThread(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  async function handleUpload(file: File) {
    const doc = await uploadDocument(file);
    setDocuments((prev) => [doc, ...prev]);
  }

  async function handleDelete(id: string) {
    await deleteDocument(id).catch(() => setError(t("errorDelete")));
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  async function handleAsk(question: string) {
    if (!selectedId) return;
    setError(null);
    setIsSending(true);
    try {
      const entry = await askQuestion(selectedId, question);
      setEntries((prev) => [...prev, entry]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("errorAsk"));
    } finally {
      setIsSending(false);
    }
  }

  const selectedDocument = documents.find((d) => d.id === selectedId) ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <section aria-labelledby="documents-heading" className="flex flex-col gap-4">
        <h1 id="documents-heading" className="text-lg font-semibold text-slate-900">
          {t("yourDocuments")}
        </h1>
        <DocumentUploader onUpload={handleUpload} />
        {isLoadingDocs ? (
          <Spinner label={t("loadingDocuments")} />
        ) : (
          <DocumentList documents={documents} selectedId={selectedId} onSelect={setSelectedId} onDelete={handleDelete} />
        )}
      </section>

      <section aria-labelledby="chat-heading" className="flex flex-col gap-4">
        <h2 id="chat-heading" className="text-lg font-semibold text-slate-900">
          {selectedDocument ? selectedDocument.name : t("askAQuestionHeading")}
        </h2>

        {error && <Alert tone="error">{error}</Alert>}

        <div className="min-h-[240px] flex-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
          {isLoadingThread ? <Spinner label={t("loadingConversation")} /> : <ChatThread entries={entries} />}
        </div>

        <ChatComposer disabled={!selectedDocument || selectedDocument.status !== "ready"} isSending={isSending} onSubmit={handleAsk} />
      </section>
    </div>
  );
}