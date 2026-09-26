import { useEffect, useMemo, useState } from "react";
import { listDocuments } from "../api/documents.js";
import { listHistory } from "../api/history.js";
import { Alert, Spinner } from "../components/ui.js";
import { useLanguage } from "../hooks/useLanguage.js";
import type { DocumentSummary, QaEntry } from "../types.js";

export function History() {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<QaEntry[]>([]);
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listHistory(), listDocuments()])
      .then(([historyRes, docsRes]) => {
        setEntries(historyRes.entries);
        setDocuments(docsRes.documents);
      })
      .catch(() => setError(t("errorLoadHistory")))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const documentNameById = useMemo(() => new Map(documents.map((d) => [d.id, d.name])), [documents]);

  if (isLoading) return <Spinner label={t("loadingDocuments")} />;
  if (error) return <Alert tone="error">{error}</Alert>;

  if (entries.length === 0) {
    return (
      <div>
        <h1 className="mb-2 text-lg font-semibold text-slate-900">{t("historyTitle")}</h1>
        <p className="text-sm text-slate-500">{t("historyEmpty")}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-slate-900">{t("historyTitle")}</h1>
      <ol className="flex flex-col gap-3">
        {entries.map((entry) => (
          <li key={entry.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span className="font-medium text-brand-500">
                {entry.documentId
                  ? documentNameById.get(entry.documentId) ?? t("deletedDocument")
                  : t("unknownDocument")}
              </span>
              <time dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString()}</time>
            </div>
            <p className="mb-1 text-sm font-medium text-slate-800">
              {t("questionPrefix")} {entry.question}
            </p>
            <p className="text-sm text-slate-700">
              {entry.grounded ? entry.answer : <span className="italic text-slate-500">{entry.answer}</span>}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}