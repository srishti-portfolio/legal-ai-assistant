import { Link } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage.js";

export function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-2xl font-bold text-brand-500">{t("notFoundTitle")}</h1>
      <p className="text-sm text-slate-600">{t("notFoundSubtitle")}</p>
      <Link to="/" className="mt-2 font-medium text-brand-500 underline">
        {t("goBackHome")}
      </Link>
    </div>
  );
}