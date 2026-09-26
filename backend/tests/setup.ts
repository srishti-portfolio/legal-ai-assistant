// Loaded before every test file so importing src/config/env.ts never throws
// on a missing JWT_SECRET, and so no test accidentally calls the real Gemini API.
process.env.JWT_SECRET = "test-secret-do-not-use-in-production";
process.env.NODE_ENV = "test";
process.env.GEMINI_API_KEY = "";
