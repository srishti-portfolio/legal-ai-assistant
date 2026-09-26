import { useId, useRef, useState, type DragEvent } from "react";
import { ApiError } from "../api/client.js";
import { useLanguage } from "../hooks/useLanguage.js";
import { Alert, Spinner } from "./ui.js";

const ACCEPTED_TYPES =
  "application/pdf,image/jpeg,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export function DocumentUploader({ onUpload }: { onUpload: (file: File) => Promise<void> }) {
  const { t } = useLanguage();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("uploadErrorGeneric"));
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    void handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragging ? "border-brand-500 bg-brand-50" : "border-slate-300 bg-white"
        }`}
      >
        <label htmlFor={inputId} className="block cursor-pointer">
          <p className="font-medium text-slate-700">{t("dropText")}</p>
          <p className="mt-1 text-xs text-slate-500">{t("fileHint")}</p>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={ACCEPTED_TYPES}
            className="sr-only"
            onChange={(e) => void handleFile(e.target.files?.[0])}
            disabled={isUploading}
          />
        </label>
      </div>
      <div className="mt-2" aria-live="polite">
        {isUploading && <Spinner label={t("uploading")} />}
        {error && <Alert tone="error">{error}</Alert>}
      </div>
    </div>
  );
}