import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import * as authApi from "../api/auth.js";
import { ApiError } from "../api/client.js";
import { useLanguage } from "../hooks/useLanguage.js";
import type { LanguageCode } from "../i18n/translations.js";
import type { PublicUser } from "../types.js";

interface AuthContextValue {
  user: PublicUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, language: LanguageCode) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: PublicUser) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setLanguage } = useLanguage();

  useEffect(() => {
    authApi
      .fetchCurrentUser()
      .then(({ user }) => setUser(user))
      .catch((err) => {
        // A 401 here just means "not logged in yet" — not a real error to surface.
        if (!(err instanceof ApiError) || err.status !== 401) {
          console.error("Failed to restore session:", err);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Whenever the known user (or their saved language) changes — on login, register, session
  // restore, or a profile edit on the You tab — the UI language follows it automatically,
  // so the account's saved preference is what drives translation, not just a one-off choice.
  useEffect(() => {
    if (user) setLanguage(user.language as LanguageCode);
  }, [user, setLanguage]);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await authApi.login({ email, password });
    setUser(user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, language: LanguageCode) => {
    const { user } = await authApi.register({ name, email, password, language });
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((user: PublicUser) => setUser(user), []);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, updateUser }),
    [user, isLoading, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}