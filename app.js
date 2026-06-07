import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import incidentRoutes from "./modules/incidents/incident.routes.js";
const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "ITSM Backend Running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);

export default app;
