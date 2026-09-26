import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { LanguageProvider } from "../context/LanguageContext.js";
import type { QaEntry } from "../types.js";
import { ChatThread } from "./ChatThread.js";

// ChatThread and its GroundedBadge call useLanguage(), so it needs a LanguageProvider
// ancestor just like in the real app.
function renderWithLanguage(ui: ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

function makeEntry(overrides: Partial<QaEntry> = {}): QaEntry {
  return {
    id: "1",
    question: "What is the notice period?",
    answer: "The notice period is 30 days.",
    grounded: true,
    sources: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("ChatThread", () => {
  it("shows guidance text when there are no questions yet", () => {
    renderWithLanguage(<ChatThread entries={[]} />);
    expect(screen.getByText(/ask a question about this document/i)).toBeInTheDocument();
  });

  it("labels a grounded answer as found in the document", () => {
    renderWithLanguage(<ChatThread entries={[makeEntry({ grounded: true })]} />);
    expect(screen.getByText("Found in document")).toBeInTheDocument();
  });

  it("labels an ungrounded answer as not mentioned, never hiding the distinction", () => {
    renderWithLanguage(
      <ChatThread
        entries={[
          makeEntry({
            grounded: false,
            answer: "This is not mentioned in the document.",
          }),
        ]}
      />,
    );
    expect(screen.getByText("Not mentioned in document")).toBeInTheDocument();
  });

  it("exposes source passages behind a details/summary disclosure", () => {
    renderWithLanguage(
      <ChatThread
        entries={[
          makeEntry({
            sources: [{ chunkId: "c1", pageNumber: 4, excerpt: "Tenant shall give 30 days notice" }],
          }),
        ]}
      />,
    );
    expect(screen.getByText(/view 1 source passage/i)).toBeInTheDocument();
    expect(screen.getByText(/page 4/i)).toBeInTheDocument();
  });
});