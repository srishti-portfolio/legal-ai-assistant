import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "../src/validators/auth.js";
import { askQuestionSchema } from "../src/validators/chat.js";
import { updateCredentialsSchema, updateProfileSchema } from "../src/validators/user.js";

describe("registerSchema", () => {
  it("accepts a valid registration payload", () => {
    const result = registerSchema.parse({ name: "Asha", email: "Asha@Example.com", password: "secret123" });
    expect(result.email).toBe("asha@example.com"); // normalized to lowercase
  });

  it("rejects a password with no digit", () => {
    expect(() => registerSchema.parse({ name: "Asha", email: "a@b.com", password: "onlyletters" })).toThrow();
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(() => registerSchema.parse({ name: "Asha", email: "a@b.com", password: "ab1" })).toThrow();
  });

  it("rejects an invalid email", () => {
    expect(() => registerSchema.parse({ name: "Asha", email: "not-an-email", password: "secret123" })).toThrow();
  });
});

describe("loginSchema", () => {
  it("rejects an empty password", () => {
    expect(() => loginSchema.parse({ email: "a@b.com", password: "" })).toThrow();
  });
});

describe("askQuestionSchema", () => {
  it("rejects a non-uuid documentId", () => {
    expect(() => askQuestionSchema.parse({ documentId: "not-a-uuid", question: "What is the notice period?" })).toThrow();
  });

  it("rejects a question that is too short", () => {
    expect(() =>
      askQuestionSchema.parse({ documentId: "123e4567-e89b-12d3-a456-426614174000", question: "hi" }),
    ).toThrow();
  });

  it("accepts a valid question", () => {
    const result = askQuestionSchema.parse({
      documentId: "123e4567-e89b-12d3-a456-426614174000",
      question: "What is the notice period for termination?",
    });
    expect(result.question).toContain("notice period");
  });
});

describe("updateProfileSchema", () => {
  it("rejects an unsupported language code", () => {
    expect(() => updateProfileSchema.parse({ language: "klingon" })).toThrow();
  });

  it("allows partial updates", () => {
    expect(updateProfileSchema.parse({ name: "New Name" })).toEqual({ name: "New Name" });
  });
});

describe("updateCredentialsSchema", () => {
  const currentPassword = "correct-horse-1";

  it("requires the current password", () => {
    expect(() => updateCredentialsSchema.parse({ email: "new@example.com" })).toThrow();
  });

  it("rejects a payload with neither a new email nor a new password", () => {
    expect(() => updateCredentialsSchema.parse({ currentPassword })).toThrow();
  });

  it("accepts an email-only change", () => {
    const result = updateCredentialsSchema.parse({ currentPassword, email: "New@Example.com" });
    expect(result.email).toBe("new@example.com"); // normalized to lowercase
  });

  it("accepts a password-only change", () => {
    const result = updateCredentialsSchema.parse({ currentPassword, newPassword: "newpassword1" });
    expect(result.newPassword).toBe("newpassword1");
  });

  it("rejects a new password that fails the complexity rules", () => {
    expect(() => updateCredentialsSchema.parse({ currentPassword, newPassword: "onlyletters" })).toThrow();
  });
});