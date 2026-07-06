import { Types } from "mongoose";

import { AppError } from "../../utils/AppError.js";
import { deleteAttachmentsForIncident } from "../attachments/attachment.service.js";
import type { UserRole } from "../users/user.model.js";
import { IncidentModel } from "./incident.model.js";

const canRead = (incident: any, user: { id: string; role: UserRole }) =>
  user.role === "admin" ||
  user.role === "agent" ||
  incident.createdBy.toString() === user.id ||
  incident.assignedTo?.toString() === user.id;

const nextIncidentNumber = async () => {
  const count = await IncidentModel.countDocuments();
  return `INC${String(count + 1).padStart(6, "0")}`;
};

export const createIncident = async (input: any, userId: string) => {
  return IncidentModel.create({
    ...input,
    number: await nextIncidentNumber(),
    createdBy: userId,
    lastActivityAt: new Date()
  });
};

export const listIncidents = async (query: any, user: { id: string; role: UserRole }) => {
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.assignedTo) filter.assignedTo = query.assignedTo;
  if (query.createdBy) filter.createdBy = query.createdBy;
  if (query.category) filter.category = query.category;
  if (query.search) filter.$text = { $search: query.search };

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

export const getIncident = async (incidentId: string, user: { id: string; role: UserRole }) => {
  const incident = await IncidentModel.findById(incidentId).populate("createdBy", "name email role").populate("assignedTo", "name email role");
  if (!incident) throw new AppError(404, "Incident not found", "INCIDENT_NOT_FOUND");
  if (!canRead(incident, user)) throw new AppError(403, "You cannot access this incident", "FORBIDDEN");
  return incident;
};

export const updateIncident = async (incidentId: string, input: any, user: { id: string; role: UserRole }) => {
  const incident = await IncidentModel.findById(incidentId);
  if (!incident) throw new AppError(404, "Incident not found", "INCIDENT_NOT_FOUND");
  if (!canRead(incident, user)) throw new AppError(403, "You cannot access this incident", "FORBIDDEN");

  if (user.role === "user" && ("assignedTo" in input || "status" in input)) {
    throw new AppError(403, "Only agents or admins can assign or change status", "FORBIDDEN");
  }

  Object.assign(incident, input, { lastActivityAt: new Date() });
  if (input.status === "closed" && !incident.closedAt) incident.closedAt = new Date();
  if (input.status && input.status !== "closed") incident.closedAt = undefined;
  await incident.save();
  return incident;
};

export const deleteIncident = async (incidentId: string, user: { id: string; role: UserRole }) => {
  if (user.role !== "admin") throw new AppError(403, "Only admins can delete incidents", "FORBIDDEN");
  const deleted = await IncidentModel.findByIdAndDelete(incidentId);
  if (!deleted) throw new AppError(404, "Incident not found", "INCIDENT_NOT_FOUND");
  await deleteAttachmentsForIncident(incidentId);
};
