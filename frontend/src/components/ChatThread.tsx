import { useLanguage } from "../hooks/useLanguage.js";
import type { QaEntry } from "../types.js";

function GroundedBadge({ grounded }: { grounded: boolean }) {
  const { t } = useLanguage();
  return grounded ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
      {t("foundInDocument")}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
      {t("notMentioned")}
    </span>
  );
}

export function ChatThread({ entries }: { entries: QaEntry[] }) {
  const { t } = useLanguage();

  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">{t("chatGuidance")}</p>;
  }

  return (
    <ol className="flex flex-col gap-4" aria-label="Question and answer history">
      {entries.map((entry) => (
        <li key={entry.id} className="flex flex-col gap-2">
          <div className="self-end rounded-2xl rounded-br-sm bg-brand-500 px-4 py-2 text-sm text-white">
            {entry.question}
          </div>
          <div className="flex flex-col gap-2 self-start rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <GroundedBadge grounded={entry.grounded} />
            </div>
            <p className="whitespace-pre-wrap text-sm text-slate-800">{entry.answer}</p>
            {entry.sources.length > 0 && (
              <details className="text-xs text-slate-600">
                <summary className="cursor-pointer font-medium text-brand-500">
                  {t("viewSourcePassages", { n: entry.sources.length })}
                </summary>
                <ul className="mt-2 flex flex-col gap-2">
                  {entry.sources.map((source) => (
                    <li key={source.chunkId} className="rounded border border-slate-200 bg-slate-50 p-2">
                      {source.pageNumber && (
                        <p className="mb-1 font-medium">
                          {t("pageLabel")} {source.pageNumber}
                        </p>
                      )}
                      <p className="italic">"{source.excerpt}..."</p>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}