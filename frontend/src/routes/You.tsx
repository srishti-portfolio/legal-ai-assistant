import { useState, type FormEvent } from "react";
import { updateProfile } from "../api/user.js";
import { Alert, Button, SelectField, TextField } from "../components/ui.js";
import { useAuth } from "../hooks/useAuth.js";
import { useLanguage } from "../hooks/useLanguage.js";
import { LANGUAGE_NATIVE_NAMES, type LanguageCode } from "../i18n/translations.js";

export function You() {
  const { user, updateUser } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [name, setName] = useState(user?.name ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  if (!user) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      // Changing the language here re-translates the whole app immediately (via
      // AuthContext's sync effect on updateUser) and is also saved to the account,
      // so it's remembered the next time this user logs in on any device.
      const updated = await updateProfile({ name, language });
      updateUser(updated);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="mb-4 text-lg font-semibold text-slate-900">{t("yourProfile")}</h1>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-500">{t("emailLabel")}</p>
        <p className="text-sm font-medium text-slate-800">{user.email}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {status === "saved" && <Alert tone="success">{t("profileUpdated")}</Alert>}
        {status === "error" && <Alert tone="error">{t("profileUpdateError")}</Alert>}

        <TextField label={t("nameLabel")} value={name} onChange={(e) => setName(e.target.value)} required />

        <SelectField
          label={t("languageLabel")}
          value={language}
          onChange={(e) => setLanguage(e.target.value as LanguageCode)}
        >
          {(Object.entries(LANGUAGE_NATIVE_NAMES) as [LanguageCode, string][]).map(([code, nativeName]) => (
            <option key={code} value={code}>
              {nativeName}
            </option>
          ))}
        </SelectField>

        <Button type="submit" disabled={status === "saving"} className="self-start">
          {status === "saving" ? t("saving") : t("saveChanges")}
        </Button>
      </form>
    </div>
  );
}