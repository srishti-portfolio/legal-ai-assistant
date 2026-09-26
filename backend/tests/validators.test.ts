import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "../src/validators/auth.js";
import { askQuestionSchema, updateProfileSchema } from "../src/validators/chat.js";

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
