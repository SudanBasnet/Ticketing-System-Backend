import { Types } from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { deleteAttachmentsForIncident } from "../attachments/attachment.service.js";
import { IncidentModel } from "./incident.model.js";
const referenceId = (reference) => reference?._id?.toString() ?? reference?.toString();
const canRead = (incident, user) => user.role === "admin" || user.role === "super_admin" ||
    user.role === "agent" ||
    referenceId(incident.createdBy) === user.id ||
    referenceId(incident.assignedTo) === user.id;
const nextIncidentNumber = async () => {
    const count = await IncidentModel.countDocuments();
    return `INC${String(count + 1).padStart(6, "0")}`;
};
export const createIncident = async (input, userId) => {
    return IncidentModel.create({
        ...input,
        number: await nextIncidentNumber(),
        createdBy: userId,
        lastActivityAt: new Date()
    });
};
export const listIncidents = async (query, user) => {
    const filter = {};
    if (query.status)
        filter.status = query.status;
    if (query.priority)
        filter.priority = query.priority;
    if (query.assignedTo)
        filter.assignedTo = query.assignedTo;
    if (query.createdBy)
        filter.createdBy = query.createdBy;
    if (query.category)
        filter.category = query.category;
    if (query.search)
        filter.$text = { $search: query.search };
    if (user.role === "user") {
        filter.createdBy = new Types.ObjectId(user.id);
    }
    const [items, total] = await Promise.all([
        IncidentModel.find(filter)
            .populate("createdBy", "name email role")
            .populate("assignedTo", "name email role")
            .sort(query.sort)
            .skip((query.page - 1) * query.limit)
            .limit(query.limit),
        IncidentModel.countDocuments(filter)
    ]);
    return {
        items,
        meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) }
    };
};
export const getIncident = async (incidentId, user) => {
    const incident = await IncidentModel.findById(incidentId).populate("createdBy", "name email role").populate("assignedTo", "name email role");
    if (!incident)
        throw new AppError(404, "Incident not found", "INCIDENT_NOT_FOUND");
    if (!canRead(incident, user))
        throw new AppError(403, "You cannot access this incident", "FORBIDDEN");
    return incident;
};
export const updateIncident = async (incidentId, input, user) => {
    const incident = await IncidentModel.findById(incidentId);
    if (!incident)
        throw new AppError(404, "Incident not found", "INCIDENT_NOT_FOUND");
    if (!canRead(incident, user))
        throw new AppError(403, "You cannot access this incident", "FORBIDDEN");
    if (user.role === "user" && ("assignedTo" in input || "status" in input)) {
        throw new AppError(403, "Only agents or admins can assign or change status", "FORBIDDEN");
    }
    Object.assign(incident, input, { lastActivityAt: new Date() });
    if (input.status === "closed" && !incident.closedAt)
        incident.closedAt = new Date();
    if (input.status && input.status !== "closed")
        incident.closedAt = undefined;
    await incident.save();
    return incident;
};
export const deleteIncident = async (incidentId, user) => {
    if (!["admin", "super_admin"].includes(user.role))
        throw new AppError(403, "Only admins can delete incidents", "FORBIDDEN");
    const deleted = await IncidentModel.findByIdAndDelete(incidentId);
    if (!deleted)
        throw new AppError(404, "Incident not found", "INCIDENT_NOT_FOUND");
    await deleteAttachmentsForIncident(incidentId);
};
