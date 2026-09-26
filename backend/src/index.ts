import { mkdir } from "node:fs/promises";
import { createApp } from "./app.js";
import { env } from "./config/env.js";

async function main(): Promise<void> {
  await mkdir(env.uploads.dir, { recursive: true });

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Legal AI backend listening on port ${env.port} (${env.nodeEnv})`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
