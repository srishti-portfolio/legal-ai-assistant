import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useLanguage } from "../hooks/useLanguage.js";
import type { Translations } from "../i18n/translations.js";
import { Button } from "./ui.js";

const tabs: { to: string; key: keyof Translations; end: boolean }[] = [
  { to: "/", key: "navHome", end: true },
  { to: "/history", key: "navHistory", end: false },
  { to: "/you", key: "navYou", end: false },
];

export function Layout() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <a
        href="#main-content"
        className="sr-only-focusable fixed left-2 top-2 z-50 rounded bg-brand-500 px-3 py-2 text-white"
      >
        {t("skipToContent")}
      </a>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-lg font-bold text-brand-500">ClearTerms</span>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">{user?.name}</span>
            <Button variant="secondary" onClick={handleLogout}>
              {t("navLogout")}
            </Button>
          </div>
        </div>
        <nav aria-label="Main navigation" className="mx-auto max-w-5xl px-4">
          <ul className="flex gap-1">
            {tabs.map((tab) => (
              <li key={tab.to}>
                <NavLink
                  to={tab.to}
                  end={tab.end}
                  className={({ isActive }) =>
                    `inline-block border-b-2 px-4 py-2 text-sm font-medium ${
                      isActive
                        ? "border-brand-500 text-brand-500"
                        : "border-transparent text-slate-600 hover:text-brand-500"
                    }`
                  }
                >
                  {t(tab.key)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="main-content" className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}