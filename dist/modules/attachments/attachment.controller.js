import { sendSuccess } from "../../utils/apiResponse.js";
import * as attachmentService from "./attachment.service.js";
export const listAttachments = async (req, res) => {
    const attachments = await attachmentService.listAttachments(String(req.params.incidentId), req.user);
    sendSuccess(res, 200, "Attachments fetched", attachments);
};
export const createAttachment = async (req, res) => {
    const attachment = await attachmentService.createAttachment(String(req.params.incidentId), req.file, req.user);
    sendSuccess(res, 201, "Attachment uploaded", { attachment });
};
export const deleteAttachment = async (req, res) => {
    await attachmentService.deleteAttachment(String(req.params.incidentId), String(req.params.attachmentId), req.user);
    sendSuccess(res, 200, "Attachment deleted");
};
