import { sendSuccess } from "../../utils/apiResponse.js";
import * as incidentService from "./incident.service.js";
export const createIncident = async (req, res) => {
    const incident = await incidentService.createIncident(req.body, req.user.id);
    sendSuccess(res, 201, "Incident created", { incident });
};
export const listIncidents = async (req, res) => {
    const result = await incidentService.listIncidents(req.query, req.user);
    sendSuccess(res, 200, "Incidents fetched", result.items, result.meta);
};
export const getIncident = async (req, res) => {
    const incident = await incidentService.getIncident(String(req.params.incidentId), req.user);
    sendSuccess(res, 200, "Incident fetched", { incident });
};
export const updateIncident = async (req, res) => {
    const incident = await incidentService.updateIncident(String(req.params.incidentId), req.body, req.user);
    sendSuccess(res, 200, "Incident updated", { incident });
};
export const deleteIncident = async (req, res) => {
    await incidentService.deleteIncident(String(req.params.incidentId), req.user);
    sendSuccess(res, 200, "Incident deleted");
};
