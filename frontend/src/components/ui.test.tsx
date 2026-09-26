import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Alert, Button, TextField } from "./ui.js";

describe("Button", () => {
  it("fires onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("cannot be clicked while disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Save
      </Button>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("TextField", () => {
  it("associates the label with the input", () => {
    render(<TextField label="Email" onChange={() => {}} value="" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("marks the input as invalid and announces the error", () => {
    render(<TextField label="Password" error="Too short" onChange={() => {}} value="" />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Too short");
  });
});

describe("Alert", () => {
  it("uses role=alert for errors so screen readers announce them immediately", () => {
    render(<Alert tone="error">Something went wrong</Alert>);
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
  });

  it("uses role=status for non-error tones so it doesn't interrupt the user", () => {
    render(<Alert tone="success">Saved</Alert>);
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
  });
});
