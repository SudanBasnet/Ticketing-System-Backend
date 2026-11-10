import type { RequestHandler } from "express";

import { sendSuccess } from "../../utils/apiResponse.js";
import * as service from "./serviceRecord.service.js";

export const list: RequestHandler = async (req, res) => {
  const result = await service.listRecords(String(req.params.type), req.query, req.user!);
  sendSuccess(res, 200, "Records retrieved", result.items, result.meta);
};

export const create: RequestHandler = async (req, res) => {
  const record = await service.createRecord(String(req.params.type), req.body, req.user!);
  sendSuccess(res, 201, "Record created", { record });
};

export const update: RequestHandler = async (req, res) => {
  const record = await service.updateRecord(
    String(req.params.type),
    String(req.params.recordId),
    req.body,
    req.user!
  );
  sendSuccess(res, 200, "Record updated", { record });
};

export const remove: RequestHandler = async (req, res) => {
  await service.deleteRecord(String(req.params.type), String(req.params.recordId), req.user!.role);
  sendSuccess(res, 200, "Record deleted", null);
};

export const overview: RequestHandler = async (_req, res) => {
  const result = await service.getOverview();
  sendSuccess(res, 200, "Overview retrieved", result);
};
