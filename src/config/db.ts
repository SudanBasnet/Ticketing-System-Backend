import mongoose from "mongoose";

import { config } from "./env.js";
import { logger } from "../utils/logger.js";

export const connectDb = async () => {
  mongoose.set("strictQuery", true);

  await mongoose.connect(config.MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000
  });

  logger.info({ database: mongoose.connection.name }, "MongoDB connected");
};

export const disconnectDb = async () => {
  await mongoose.connection.close();
  logger.info("MongoDB disconnected");
};
