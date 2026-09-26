import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "../context/LanguageContext.js";
import { ChatComposer } from "./ChatComposer.js";

// ChatComposer calls useLanguage() for its labels/placeholders/button text.
function renderWithLanguage(ui: ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe("ChatComposer", () => {
  it("does not submit a question shorter than 3 characters", async () => {
    const onSubmit = vi.fn();
    renderWithLanguage(<ChatComposer disabled={false} isSending={false} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByRole("textbox"), "hi");
    expect(screen.getByRole("button", { name: "Ask" })).toBeDisabled();
  });

  it("submits a valid question and clears the input afterward", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderWithLanguage(<ChatComposer disabled={false} isSending={false} onSubmit={onSubmit} />);

    const textbox = screen.getByRole("textbox");
    await userEvent.type(textbox, "What is the notice period?");
    await userEvent.click(screen.getByRole("button", { name: "Ask" }));

    expect(onSubmit).toHaveBeenCalledWith("What is the notice period?");
    expect(textbox).toHaveValue("");
  });

  it("submits on Enter but inserts a newline on Shift+Enter instead", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderWithLanguage(<ChatComposer disabled={false} isSending={false} onSubmit={onSubmit} />);

    const textbox = screen.getByRole("textbox");
    await userEvent.type(textbox, "Line one{Shift>}{Enter}{/Shift}Line two");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(textbox).toHaveValue("Line one\nLine two");

    await userEvent.type(textbox, "{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("Line one\nLine two");
  });

  it("disables the input and shows guidance text when no ready document is selected", () => {
    renderWithLanguage(<ChatComposer disabled={true} isSending={false} onSubmit={vi.fn()} />);
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByPlaceholderText(/select a ready document/i)).toBeInTheDocument();
  });
});