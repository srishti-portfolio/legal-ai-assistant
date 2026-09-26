import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.js";
import { chatRouter } from "./routes/chat.js";
import { documentsRouter } from "./routes/documents.js";
import { historyRouter } from "./routes/history.js";
import { userRouter } from "./routes/user.js";

export function createApp(): Express {
  const app = express();

  // Behind a single reverse proxy (Cloud Run, nginx) in production — needed for
  // express-rate-limit and req.ip to see the real client address via X-Forwarded-For.
  app.set("trust proxy", env.nodeEnv === "production" ? 1 : false);

  app.use(helmet());
  app.use(compression()); // gzip JSON responses — cheap win on the chat/history payloads
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.use(
    rateLimit({
      windowMs: env.rateLimit.windowMs,
      limit: env.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/documents", documentsRouter);
  app.use("/api/chat", chatRouter);
  app.use("/api/history", historyRouter);
  app.use("/api/user", userRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}