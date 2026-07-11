import type { RequestHandler } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as service from "./workNote.service.js";

export const list: RequestHandler = async (req, res) => {
  sendSuccess(res, 200, "Work notes fetched", await service.listWorkNotes(String(req.params.incidentId), req.user!));
};

export const create: RequestHandler = async (req, res) => {
  sendSuccess(res, 201, "Work note added", { workNote: await service.createWorkNote(String(req.params.incidentId), req.body, req.user!) });
};
