import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { useLanguage } from "../hooks/useLanguage.js";
import { LanguageProvider } from "./LanguageContext.js";

const STORAGE_KEY = "cleartrms_language";

function Probe() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div>
      <p>current: {language}</p>
      <p>greeting: {t("loginTitle")}</p>
      <p>interpolated: {t("viewSourcePassages", { n: 3 })}</p>
      <button onClick={() => setLanguage("hi")}>switch to hindi</button>
    </div>
  );
}

describe("LanguageProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to English when nothing is stored", () => {
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );
    expect(screen.getByText("current: en")).toBeInTheDocument();
    expect(screen.getByText("greeting: Welcome back")).toBeInTheDocument();
  });

  it("restores a previously chosen language from localStorage", () => {
    localStorage.setItem(STORAGE_KEY, "es");
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );
    expect(screen.getByText("current: es")).toBeInTheDocument();
    expect(screen.getByText("greeting: Bienvenido de nuevo")).toBeInTheDocument();
  });

  it("ignores a corrupted or unsupported stored value instead of crashing", () => {
    localStorage.setItem(STORAGE_KEY, "klingon");
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );
    expect(screen.getByText("current: en")).toBeInTheDocument();
  });

  it("switches language on demand and persists the choice", async () => {
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );

    await userEvent.click(screen.getByRole("button", { name: "switch to hindi" }));

    expect(screen.getByText("current: hi")).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBe("hi");
  });

  it("interpolates {placeholder} values into translated strings", () => {
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );
    expect(screen.getByText("interpolated: View 3 source passage(s)")).toBeInTheDocument();
  });
});