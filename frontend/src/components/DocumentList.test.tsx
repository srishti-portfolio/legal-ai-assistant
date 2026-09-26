import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "../context/LanguageContext.js";
import type { DocumentSummary } from "../types.js";
import { DocumentList } from "./DocumentList.js";

// DocumentList calls useLanguage() for status labels and the empty state, so it needs a
// LanguageProvider ancestor just like in the real app.
function renderWithLanguage(ui: ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

function makeDoc(overrides: Partial<DocumentSummary> = {}): DocumentSummary {
  return {
    id: "doc-1",
    name: "lease.pdf",
    mimeType: "application/pdf",
    sizeBytes: 204800,
    status: "ready",
    errorMessage: null,
    pageCount: 3,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("DocumentList", () => {
  it("shows an empty state when there are no documents", () => {
    renderWithLanguage(<DocumentList documents={[]} selectedId={null} onSelect={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/no documents uploaded yet/i)).toBeInTheDocument();
  });

  it("lets the user select a ready document", async () => {
    const onSelect = vi.fn();
    renderWithLanguage(<DocumentList documents={[makeDoc()]} selectedId={null} onSelect={onSelect} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByText("lease.pdf"));
    expect(onSelect).toHaveBeenCalledWith("doc-1");
  });

  it("disables selection for a document that is still processing", () => {
    renderWithLanguage(
      <DocumentList
        documents={[makeDoc({ status: "processing" })]}
        selectedId={null}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("lease.pdf").closest("button")).toBeDisabled();
  });

  it("surfaces the error message for a failed document", () => {
    renderWithLanguage(
      <DocumentList
        documents={[makeDoc({ status: "failed", errorMessage: "Could not extract text." })]}
        selectedId={null}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("Could not extract text.")).toBeInTheDocument();
  });

  it("calls onDelete with the document id", async () => {
    const onDelete = vi.fn();
    renderWithLanguage(<DocumentList documents={[makeDoc()]} selectedId={null} onSelect={vi.fn()} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole("button", { name: /delete lease.pdf/i }));
    expect(onDelete).toHaveBeenCalledWith("doc-1");
  });
});