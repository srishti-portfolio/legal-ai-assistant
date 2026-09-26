import { Pool } from "pg";
import { env } from "../config/env.js";

export const pool = new Pool(
  env.db.url
    ? {
        connectionString: env.db.url,
        // Hosted providers (Neon, Supabase, Cloud SQL) terminate SSL with a cert not in
        // Node's default trust store; rejectUnauthorized:false still encrypts the
        // connection, it just skips CA verification — acceptable for this project's scope.
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30_000,
      }
    : {
        host: env.db.host,
        port: env.db.port,
        user: env.db.user,
        password: env.db.password,
        database: env.db.name,
        max: 10,
        idleTimeoutMillis: 30_000,
      },
);

pool.on("error", (err) => {
  // Idle client errors (e.g. connection dropped by the server) must not crash
  // the process — the pool retires the bad client and issues a new one on next use.
  console.error("Unexpected Postgres pool error", err);
});
