import { createServer } from "node:http";
import { app } from "./app.js";
import { config } from "./config/env.js";
import { connectDb, disconnectDb } from "./config/db.js";
import { logger } from "./utils/logger.js";
const start = async () => {
    await connectDb();
    const server = createServer(app);
    server.listen(config.PORT, () => {
        logger.info({ port: config.PORT }, "API server listening");
    });
    const shutdown = async (signal) => {
        logger.info({ signal }, "Graceful shutdown started");
        server.close(async () => {
            await disconnectDb();
            process.exit(0);
        });
    };
    process.on("SIGINT", () => void shutdown("SIGINT"));
    process.on("SIGTERM", () => void shutdown("SIGTERM"));
};
start().catch((error) => {
    logger.error({ err: error }, "Failed to start API");
    process.exit(1);
});
