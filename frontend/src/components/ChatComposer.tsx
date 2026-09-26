import { useId, useState, type FormEvent, type KeyboardEvent } from "react";
import { useLanguage } from "../hooks/useLanguage.js";
import { Button } from "./ui.js";

export function ChatComposer({
  disabled,
  isSending,
  onSubmit,
}: {
  disabled: boolean;
  isSending: boolean;
  onSubmit: (question: string) => Promise<void>;
}) {
  const { t } = useLanguage();
  const [question, setQuestion] = useState("");
  const labelId = useId();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = question.trim();
    if (trimmed.length < 3) return;
    await onSubmit(trimmed);
    setQuestion("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e as unknown as FormEvent);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1">
        <label htmlFor={labelId} className="sr-only">
          {t("composerSrLabel")}
        </label>
        <textarea
          id={labelId}
          rows={2}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? t("composerPlaceholderDisabled") : t("composerPlaceholderEnabled")}
          className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-slate-100"
        />
      </div>
      <Button type="submit" disabled={disabled || isSending || question.trim().length < 3}>
        {isSending ? t("asking") : t("ask")}
      </Button>
    </form>
  );
}