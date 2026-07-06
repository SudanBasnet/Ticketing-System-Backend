import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import { attachmentRoutes } from "../attachments/attachment.routes.js";
import * as controller from "./incident.controller.js";
import { createIncidentSchema, incidentIdParamSchema, listIncidentQuerySchema, updateIncidentSchema } from "./incident.schemas.js";

export const incidentRoutes = Router();

incidentRoutes.use(authenticate);
incidentRoutes.post("/", validate({ body: createIncidentSchema }), controller.createIncident);
incidentRoutes.get("/", validate({ query: listIncidentQuerySchema }), controller.listIncidents);
incidentRoutes.get("/:incidentId", validate({ params: incidentIdParamSchema }), controller.getIncident);
incidentRoutes.patch("/:incidentId", validate({ params: incidentIdParamSchema, body: updateIncidentSchema }), controller.updateIncident);
incidentRoutes.delete("/:incidentId", validate({ params: incidentIdParamSchema }), controller.deleteIncident);
incidentRoutes.use("/:incidentId/attachments", attachmentRoutes);
