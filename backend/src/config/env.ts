import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() !== "" ? value : fallback;
}

export const env = {
  nodeEnv: optional("NODE_ENV", "development"),
  port: Number(optional("PORT", "4000")),
  corsOrigin: optional("CORS_ORIGIN", "http://localhost:5173"),

  db: {
    // Hosted providers (Neon, Supabase, Cloud SQL) give a single connection string that
    // requires SSL. When set, this takes priority over the discrete DB_* fields below,
    // which remain for the local docker-compose Postgres (no SSL needed there).
    url: optional("DATABASE_URL", ""),
    host: optional("DB_HOST", "localhost"),
    port: Number(optional("DB_PORT", "5432")),
    user: optional("DB_USER", "legalai"),
    password: optional("DB_PASSWORD", "legalai_dev_password"),
    name: optional("DB_NAME", "legalai"),
  },

  jwt: {
    // Only truly required secret — server refuses to boot without it so nobody
    // accidentally ships the placeholder value from .env.example.
    secret: required("JWT_SECRET"),
    expiresIn: optional("JWT_EXPIRES_IN", "7d"),
    cookieMaxAgeMs: Number(optional("JWT_COOKIE_MAX_AGE_MS", String(7 * 24 * 60 * 60 * 1000))),
  },

  gemini: {
    apiKey: optional("GEMINI_API_KEY", ""),
    generationModel: optional("GEMINI_GENERATION_MODEL", "gemini-flash-lite-latest"),
    embeddingModel: optional("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001"),
  },

  ocr: {
    credentialsPath: optional("GOOGLE_APPLICATION_CREDENTIALS", ""),
  },

  uploads: {
    maxUploadMb: Number(optional("MAX_UPLOAD_MB", "15")),
    dir: optional("UPLOAD_DIR", "./uploads"),
  },

  rateLimit: {
    windowMs: Number(optional("RATE_LIMIT_WINDOW_MS", "900000")),
    max: Number(optional("RATE_LIMIT_MAX", "200")),
  },
};
