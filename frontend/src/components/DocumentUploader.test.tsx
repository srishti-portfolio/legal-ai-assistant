import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../api/client.js";
import { LanguageProvider } from "../context/LanguageContext.js";
import { DocumentUploader } from "./DocumentUploader.js";

// DocumentUploader calls useLanguage() for its labels/hints/error text.
function renderWithLanguage(ui: ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

function makeFile(name = "contract.pdf", type = "application/pdf") {
  return new File(["file contents"], name, { type });
}

function getFileInput(): HTMLInputElement {
  return screen.getByLabelText(/drag & drop a document here/i);
}

describe("DocumentUploader", () => {
  it("calls onUpload with the selected file", async () => {
    const onUpload = vi.fn().mockResolvedValue(undefined);
    renderWithLanguage(<DocumentUploader onUpload={onUpload} />);

    const file = makeFile();
    await userEvent.upload(getFileInput(), file);

    await waitFor(() => expect(onUpload).toHaveBeenCalledWith(file));
  });

  it("shows the server's error message when the upload fails", async () => {
    const onUpload = vi.fn().mockRejectedValue(new ApiError("File too large.", 400));
    renderWithLanguage(<DocumentUploader onUpload={onUpload} />);

    await userEvent.upload(getFileInput(), makeFile());

    expect(await screen.findByText("File too large.")).toBeInTheDocument();
  });

  it("falls back to a generic error message for a non-API error", async () => {
    const onUpload = vi.fn().mockRejectedValue(new Error("network down"));
    renderWithLanguage(<DocumentUploader onUpload={onUpload} />);

    await userEvent.upload(getFileInput(), makeFile());

    expect(await screen.findByText(/upload failed/i)).toBeInTheDocument();
  });

  it("resets the file input after an upload so the same file can be re-selected", async () => {
    const onUpload = vi.fn().mockResolvedValue(undefined);
    renderWithLanguage(<DocumentUploader onUpload={onUpload} />);

    const input = getFileInput();
    await userEvent.upload(input, makeFile());

    await waitFor(() => expect(input.value).toBe(""));
  });
});