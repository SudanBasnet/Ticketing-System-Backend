import pino from "pino";
import { config, isProduction, isTest } from "../config/env.js";
export const logger = pino({
    level: isTest ? "silent" : process.env.LOG_LEVEL ?? "info",
    transport: isProduction
        ? undefined
        : {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "SYS:standard"
            }
        },
    base: {
        env: config.NODE_ENV,
        service: "ticketing-system-api"
    }
});
