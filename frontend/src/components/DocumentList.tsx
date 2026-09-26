import { useLanguage } from "../hooks/useLanguage.js";
import type { Translations } from "../i18n/translations.js";
import type { DocumentSummary } from "../types.js";

const STATUS_STYLES: Record<DocumentSummary["status"], string> = {
  processing: "bg-amber-100 text-amber-800",
  ready: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

const STATUS_KEYS: Record<DocumentSummary["status"], keyof Translations> = {
  processing: "statusProcessing",
  ready: "statusReady",
  failed: "statusFailed",
};

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentList({
  documents,
  selectedId,
  onSelect,
  onDelete,
}: {
  documents: DocumentSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useLanguage();

  if (documents.length === 0) {
    return <p className="text-sm text-slate-500">{t("noDocumentsUploaded")}</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {documents.map((doc) => {
        const isSelected = doc.id === selectedId;
        return (
          <li key={doc.id}>
            <div
              className={`flex items-center justify-between gap-2 rounded-lg border p-3 ${
                isSelected ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(doc.id)}
                disabled={doc.status !== "ready"}
                aria-current={isSelected ? "true" : undefined}
                className="flex min-w-0 flex-1 flex-col items-start text-left disabled:cursor-not-allowed"
              >
                <span className="w-full truncate text-sm font-medium text-slate-800">{doc.name}</span>
                <span className="text-xs text-slate-500">{formatSize(doc.sizeBytes)}</span>
                {doc.status === "failed" && doc.errorMessage && (
                  <span className="mt-1 text-xs text-red-600">{doc.errorMessage}</span>
                )}
              </button>
              <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[doc.status]}`}>
                {t(STATUS_KEYS[doc.status])}
              </span>
              <button
                type="button"
                onClick={() => onDelete(doc.id)}
                aria-label={`${t("deleteLabel")} ${doc.name}`}
                className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}