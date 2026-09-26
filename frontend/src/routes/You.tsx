import { useState, type FormEvent } from "react";
import { ApiError } from "../api/client.js";
import { updateCredentials, updateProfile } from "../api/user.js";
import { Alert, Button, PasswordField, SelectField, TextField } from "../components/ui.js";
import { useAuth } from "../hooks/useAuth.js";
import { useLanguage } from "../hooks/useLanguage.js";
import { LANGUAGE_NATIVE_NAMES, type LanguageCode } from "../i18n/translations.js";

export function You() {
  const { user, updateUser } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [name, setName] = useState(user?.name ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [credStatus, setCredStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [credError, setCredError] = useState<string | null>(null);

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

  async function handleCredentialsSubmit(e: FormEvent) {
    e.preventDefault();
    setCredError(null);

    if (newPassword && newPassword !== confirmNewPassword) {
      setCredStatus("error");
      setCredError(t("passwordsDontMatch"));
      return;
    }

    setCredStatus("saving");
    try {
      const updated = await updateCredentials({
        currentPassword,
        email,
        newPassword: newPassword || undefined,
      });
      updateUser(updated);
      // Passwords never stay in component state longer than the request that needs them.
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setCredStatus("saved");
    } catch (err) {
      setCredStatus("error");
      setCredError(err instanceof ApiError ? err.message : t("profileUpdateError"));
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="mb-4 text-lg font-semibold text-slate-900">{t("yourProfile")}</h1>

      <form onSubmit={handleSubmit} className="mb-8 flex flex-col gap-4">
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

      <div className="border-t border-slate-200 pt-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">{t("changeEmailPasswordHeading")}</h2>

        <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-4">
          {credStatus === "saved" && <Alert tone="success">{t("credentialsUpdated")}</Alert>}
          {credStatus === "error" && credError && <Alert tone="error">{credError}</Alert>}

          <TextField
            label={t("emailLabel")}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <PasswordField
            label={t("newPasswordLabel")}
            autoComplete="new-password"
            hint={t("newPasswordHint")}
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          {newPassword && (
            <PasswordField
              label={t("confirmNewPasswordLabel")}
              autoComplete="new-password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          )}

          {/* Re-entering the current password is required for both an email and a password
              change — see backend/src/routes/user.ts for why (a hijacked but still-logged-in
              session shouldn't be able to silently take over the account this way). */}
          <PasswordField
            label={t("currentPasswordLabel")}
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <Button type="submit" disabled={credStatus === "saving"} className="self-start">
            {credStatus === "saving" ? t("updatingCredentials") : t("updateCredentials")}
          </Button>
        </form>
      </div>
    </div>
  );
}