import { AppError } from "../../utils/AppError.js";
import type { UserRole } from "../users/user.model.js";
import { IncidentModel } from "../incidents/incident.model.js";
import { WorkNoteModel } from "./workNote.model.js";

const isStaff = (role: UserRole) => ["agent", "admin", "super_admin"].includes(role);

const getAccessibleIncident = async (incidentId: string, user: { id: string; role: UserRole }) => {
  const incident = await IncidentModel.findById(incidentId);
  if (!incident) throw new AppError(404, "Incident not found", "INCIDENT_NOT_FOUND");
  if (!isStaff(user.role) && incident.createdBy.toString() !== user.id) {
    throw new AppError(403, "You cannot access this incident", "FORBIDDEN");
  }
  return incident;
};

export const listWorkNotes = async (incidentId: string, user: { id: string; role: UserRole }) => {
  await getAccessibleIncident(incidentId, user);
  const filter: Record<string, unknown> = { incidentId };
  if (!isStaff(user.role)) filter.isInternal = false;
  return WorkNoteModel.find(filter).populate("authorId", "name role").sort({ createdAt: -1 });
};

export const createWorkNote = async (incidentId: string, input: { note: string; isInternal: boolean }, user: { id: string; role: UserRole }) => {
  const incident = await getAccessibleIncident(incidentId, user);
  if (!isStaff(user.role)) throw new AppError(403, "Only support staff can add work notes", "FORBIDDEN");
  const workNote = await WorkNoteModel.create({ incidentId, authorId: user.id, ...input });
  incident.lastActivityAt = new Date();
  await incident.save();
  return workNote.populate("authorId", "name role");
};
