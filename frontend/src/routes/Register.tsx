import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client.js";
import { Alert, Button, PasswordField, SelectField, TextField } from "../components/ui.js";
import { useAuth } from "../hooks/useAuth.js";
import { useLanguage } from "../hooks/useLanguage.js";
import { LANGUAGE_NATIVE_NAMES, type LanguageCode } from "../i18n/translations.js";

export function Register() {
  const { user, register } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register(name, email, password, language);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to create your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-1 text-2xl font-bold text-brand-500">{t("registerTitle")}</h1>
      <p className="mb-6 text-sm text-slate-600">{t("registerSubtitle")}</p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && <Alert tone="error">{error}</Alert>}
        {/* Picking a language here immediately re-translates this very page — the language
            select changes the app's UI language on the spot, before the account even exists,
            and that choice is what gets saved to the new account. */}
        <SelectField
          label={t("languageLabel")}
          value={language}
          onChange={(e) => setLanguage(e.target.value as LanguageCode)}
        >
          {(Object.entries(LANGUAGE_NATIVE_NAMES) as [LanguageCode, string][]).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </SelectField>
        <TextField
          label={t("nameLabel")}
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label={t("emailLabel")}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordField
          label={t("passwordLabel")}
          autoComplete="new-password"
          required
          minLength={8}
          hint={t("passwordHint")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("creatingAccount") : t("createAccount")}
        </Button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        {t("alreadyHaveAccount")}{" "}
        <Link to="/login" className="font-medium text-brand-500 underline">
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}