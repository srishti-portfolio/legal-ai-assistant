import { describe, expect, it } from "vitest";
import { signToken, verifyToken } from "../src/utils/jwt.js";

describe("jwt", () => {
  it("round-trips a payload through sign and verify", () => {
    const token = signToken({ userId: "user-1", email: "a@b.com" });
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe("user-1");
    expect(decoded.email).toBe("a@b.com");
  });

  it("throws on a tampered token", () => {
    const token = signToken({ userId: "user-1", email: "a@b.com" });
    const tampered = token.slice(0, -2) + "xx";
    expect(() => verifyToken(tampered)).toThrow();
  });

  it("throws on garbage input", () => {
    expect(() => verifyToken("not.a.jwt")).toThrow();
  });
});
