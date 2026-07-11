import { AppError } from "../../utils/AppError.js";
import { deleteCloudinaryAsset, uploadBuffer } from "../uploads/cloudinary.service.js";
import { IncidentModel } from "../incidents/incident.model.js";
import { AttachmentModel } from "./attachment.model.js";
const canAccessIncident = (incident, user) => user.role === "admin" || user.role === "super_admin" ||
    user.role === "agent" ||
    incident.createdBy.toString() === user.id ||
    incident.assignedTo?.toString() === user.id;
export const listAttachments = async (incidentId, user) => {
    const incident = await IncidentModel.findById(incidentId);
    if (!incident)
        throw new AppError(404, "Incident not found", "INCIDENT_NOT_FOUND");
    if (!canAccessIncident(incident, user))
        throw new AppError(403, "You cannot access this incident", "FORBIDDEN");
    return AttachmentModel.find({ incidentId }).populate("uploadedBy", "name email role").sort({ createdAt: -1 });
};
export const createAttachment = async (incidentId, file, user) => {
    if (!file)
        throw new AppError(400, "File is required", "FILE_REQUIRED");
    const incident = await IncidentModel.findById(incidentId);
    if (!incident)
        throw new AppError(404, "Incident not found", "INCIDENT_NOT_FOUND");
    if (!canAccessIncident(incident, user))
        throw new AppError(403, "You cannot access this incident", "FORBIDDEN");
    const uploaded = await uploadBuffer(file, {
        folder: `ticketing-system/incidents/${incidentId}`,
        resourceType: "auto"
    });
    const attachment = await AttachmentModel.create({
        incidentId,
        uploadedBy: user.id,
        fileName: file.originalname,
        fileUrl: uploaded.secure_url,
        fileType: file.mimetype,
        fileSize: file.size,
        cloudinaryPublicId: uploaded.public_id,
        cloudinaryResourceType: uploaded.resource_type === "raw" ? "raw" : "image"
    });
    incident.attachmentCount += 1;
    incident.lastActivityAt = new Date();
    await incident.save();
    return attachment;
};
export const deleteAttachment = async (incidentId, attachmentId, user) => {
    const attachment = await AttachmentModel.findOne({ _id: attachmentId, incidentId });
    if (!attachment)
        throw new AppError(404, "Attachment not found", "ATTACHMENT_NOT_FOUND");
    const incident = await IncidentModel.findById(incidentId);
    if (!incident)
        throw new AppError(404, "Incident not found", "INCIDENT_NOT_FOUND");
    const ownsAttachment = attachment.uploadedBy.toString() === user.id;
    if (!['admin', 'super_admin'].includes(user.role) && user.role !== "agent" && !ownsAttachment) {
        throw new AppError(403, "You cannot delete this attachment", "FORBIDDEN");
    }
    await deleteCloudinaryAsset(attachment.cloudinaryPublicId, attachment.cloudinaryResourceType === "raw" ? "raw" : "image");
    await attachment.deleteOne();
    incident.attachmentCount = Math.max(0, incident.attachmentCount - 1);
    incident.lastActivityAt = new Date();
    await incident.save();
};
export const deleteAttachmentsForIncident = async (incidentId) => {
    const attachments = await AttachmentModel.find({ incidentId });
    await Promise.all(attachments.map((attachment) => deleteCloudinaryAsset(attachment.cloudinaryPublicId, attachment.cloudinaryResourceType === "raw" ? "raw" : "image")));
    await AttachmentModel.deleteMany({ incidentId });
};
