import express from "express";

import { createIncident, getIncidents } from "./incident.controller.js";

import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getIncidents);

router.post("/", authMiddleware, createIncident);

export default router;
