import pino from "pino";

import { config, isProduction, isTest } from "../config/env.js";

const usePrettyTransport = !isProduction && !process.env.VERCEL;

export const logger = pino({
  level: isTest ? "silent" : process.env.LOG_LEVEL ?? "info",
  transport: usePrettyTransport
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard"
        }
      }
    : undefined,
  base: {
    env: config.NODE_ENV,
    service: "ticketing-system-api"
  }
});
