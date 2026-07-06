import cors from "cors";
import type { Express } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import { config, isProduction } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { sanitizeInput } from "./sanitize.js";

export const applySecurityMiddleware = (app: Express) => {
  const allowedOrigins = config.CLIENT_ORIGIN.split(",").map((origin) => origin.trim());

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
    })
  );
  app.use(sanitizeInput);
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 200,
      standardHeaders: "draft-7",
      legacyHeaders: false
    })
  );

  if (!isProduction) {
    app.use(
      morgan("dev", {
        stream: {
          write: (message) => logger.info(message.trim())
        }
      })
    );
  }
};
