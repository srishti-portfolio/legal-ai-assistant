import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

const app = createApp();

describe("GET /api/health", () => {
  it("responds with ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("unknown routes", () => {
  it("returns 404", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
  });
});

describe("authentication is required for protected routes", () => {
  it("GET /api/documents returns 401 without a token", async () => {
    expect((await request(app).get("/api/documents")).status).toBe(401);
  });

  it("GET /api/history returns 401 without a token", async () => {
    expect((await request(app).get("/api/history")).status).toBe(401);
  });

  it("GET /api/user/profile returns 401 without a token", async () => {
    expect((await request(app).get("/api/user/profile")).status).toBe(401);
  });

  it("POST /api/chat/ask returns 401 without a token", async () => {
    expect((await request(app).post("/api/chat/ask")).status).toBe(401);
  });

  it("rejects a malformed Authorization header", async () => {
    const res = await request(app).get("/api/documents").set("Authorization", "NotBearer abc");
    expect(res.status).toBe(401);
  });

  it("rejects an invalid token", async () => {
    const res = await request(app).get("/api/documents").set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });
});

describe("input validation", () => {
  it("rejects registration with a weak password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test User", email: "test@example.com", password: "weak" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("rejects registration with an invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test User", email: "not-an-email", password: "goodpass123" });
    expect(res.status).toBe(400);
  });

  it("rejects login with missing fields", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });
});
