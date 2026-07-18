import cookieParser from "cookie-parser";
import express from "express";

import { applySecurityMiddleware } from "./middleware/security.js";
import { requestId } from "./middleware/requestId.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { incidentRoutes } from "./modules/incidents/incident.routes.js";
import { userRoutes } from "./modules/users/user.routes.js";
import { serviceRecordRoutes } from "./modules/serviceManagement/serviceRecord.routes.js";
import { sendSuccess } from "./utils/apiResponse.js";

export const app = express();

app.use(requestId);
applySecurityMiddleware(app);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/", (_req, res) => {
  sendSuccess(res, 200, "Ticketing System API", {
    service: "ticketing-system-api",
    health: "/api/health",
    apiBase: "/api/v1"
  });
});

app.get("/api/health", (_req, res) => {
  sendSuccess(res, 200, "API healthy", {
    service: "ticketing-system-api",
    uptime: process.uptime()
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/incidents", incidentRoutes);
app.use("/api/v1/service-management", serviceRecordRoutes);

app.use(notFound);
app.use(errorHandler);
