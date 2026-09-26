import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";
import { translations, type LanguageCode, type Translations } from "../i18n/translations.js";

const STORAGE_KEY = "cleartrms_language";
const RTL_LANGUAGES: ReadonlySet<LanguageCode> = new Set(["ar"]);

function readStoredLanguage(): LanguageCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in translations) return stored as LanguageCode;
  } catch {
    // Private browsing / storage disabled — fall back to the default silently.
  }
  return "en";
}

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: keyof Translations, vars?: Record<string, string | number>) => string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(readStoredLanguage);

  const setLanguage = useCallback((next: LanguageCode) => {
    setLanguageState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Non-fatal — the choice just won't persist across reloads in this browser.
    }
  }, []);

  const t = useCallback(
    (key: keyof Translations, vars?: Record<string, string | number>) => {
      let text = translations[language][key];
      if (vars) {
        for (const [name, value] of Object.entries(vars)) {
          text = text.replace(`{${name}}`, String(value));
        }
      }
      return text;
    },
    [language],
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      <div dir={RTL_LANGUAGES.has(language) ? "rtl" : "ltr"}>{children}</div>
    </LanguageContext.Provider>
  );
}