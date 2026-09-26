import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../api/client.js";
import { useAuth } from "../hooks/useAuth.js";
import { AuthProvider } from "./AuthContext.js";
import { LanguageProvider } from "./LanguageContext.js";

const fetchCurrentUser = vi.fn();
const login = vi.fn();
const logout = vi.fn();

vi.mock("../api/auth.js", () => ({
  fetchCurrentUser: (...args: unknown[]) => fetchCurrentUser(...args),
  login: (...args: unknown[]) => login(...args),
  logout: (...args: unknown[]) => logout(...args),
  register: vi.fn(),
}));

// AuthProvider reads/writes the UI language via useLanguage(), so it must be rendered
// inside a LanguageProvider just like in the real app.
function renderWithProviders(ui: ReactNode) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

function Probe() {
  const { user, isLoading, login: doLogin, logout: doLogout } = useAuth();
  if (isLoading) return <p>loading</p>;
  return (
    <div>
      <p>{user ? `signed in as ${user.name}` : "signed out"}</p>
      <button onClick={() => doLogin("a@b.com", "password123")}>login</button>
      <button onClick={() => doLogout()}>logout</button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("restores the session on mount when a valid cookie exists", async () => {
    fetchCurrentUser.mockResolvedValue({ user: { id: "1", name: "Asha", email: "a@b.com", language: "en" } });

    renderWithProviders(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText("signed in as Asha")).toBeInTheDocument());
  });

  it("treats a 401 on mount as simply signed-out, not an error", async () => {
    fetchCurrentUser.mockRejectedValue(new ApiError("Unauthorized", 401));

    renderWithProviders(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText("signed out")).toBeInTheDocument());
  });

  it("updates state after a successful login", async () => {
    fetchCurrentUser.mockRejectedValue(new ApiError("Unauthorized", 401));
    login.mockResolvedValue({ user: { id: "1", name: "Asha", email: "a@b.com", language: "en" } });

    renderWithProviders(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText("signed out")).toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: "login" }));
    await waitFor(() => expect(screen.getByText("signed in as Asha")).toBeInTheDocument());
  });

  it("clears state after logout", async () => {
    fetchCurrentUser.mockResolvedValue({ user: { id: "1", name: "Asha", email: "a@b.com", language: "en" } });
    logout.mockResolvedValue(undefined);

    renderWithProviders(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText("signed in as Asha")).toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: "logout" }));
    await waitFor(() => expect(screen.getByText("signed out")).toBeInTheDocument());
  });
});